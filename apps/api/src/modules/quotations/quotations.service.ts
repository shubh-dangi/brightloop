import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateQuotationInput, QuotationStatus } from '@brightloop/contracts';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, userRole?: string, userEmail?: string, search?: string) {
    const where: any = { organizationId: orgId };

    // Enforce Customer Portal IDOR isolation
    if (userRole === 'CUSTOMER' && userEmail) {
      const customer = await this.prisma.customer.findFirst({
        where: { organizationId: orgId, email: userEmail.toLowerCase() },
      });
      if (!customer) {
        return [];
      }
      where.customerId = customer.id;
    }

    if (search) {
      where.OR = [
        { quotationNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.quotation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        lines: {
          include: { product: true, variant: true },
        },
      },
    });
  }

  async findOne(orgId: string, id: string, userRole?: string, userEmail?: string) {
    const where: any = { id, organizationId: orgId };

    if (userRole === 'CUSTOMER' && userEmail) {
      const customer = await this.prisma.customer.findFirst({
        where: { organizationId: orgId, email: userEmail.toLowerCase() },
      });
      if (!customer) {
        throw new NotFoundException('Quotation not found');
      }
      where.customerId = customer.id;
    }

    const quotation = await this.prisma.quotation.findFirst({
      where,
      include: {
        customer: true,
        creator: { select: { id: true, name: true, email: true } },
        lines: {
          include: { product: true, variant: true },
        },
        subscriptions: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    return quotation;
  }

  async create(orgId: string, userId: string, data: CreateQuotationInput) {
    // Generate sequential quote number
    const count = await this.prisma.quotation.count({ where: { organizationId: orgId } });
    const quoteNumber = `QT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const validDays = data.validDays || 15;
    const expiryDate = new Date(Date.now() + validDays * 86400000);

    // Calculate line totals and taxes server-side
    let subtotal = 0;
    let taxAmount = 0;

    const lineCalculations = [];

    for (const line of data.lines) {
      const product = await this.prisma.product.findFirst({
        where: { id: line.productId, organizationId: orgId },
        include: { variants: true },
      });

      if (!product) {
        throw new BadRequestException(`Product with ID ${line.productId} not found`);
      }

      let unitPrice = line.unitPrice || product.salesPrice;
      if (line.variantId) {
        const variant = product.variants.find((v) => v.id === line.variantId);
        if (variant) {
          unitPrice += variant.additionalPrice;
        }
      }

      const lineSubtotal = unitPrice * line.quantity;
      const lineTax = (lineSubtotal * (line.taxRate || 0)) / 100;

      subtotal += lineSubtotal;
      taxAmount += lineTax;

      lineCalculations.push({
        productId: line.productId,
        variantId: line.variantId || null,
        quantity: line.quantity,
        unitPrice,
        taxRate: line.taxRate || 0,
        taxAmount: lineTax,
        lineTotal: lineSubtotal + lineTax,
      });
    }

    const totalAmount = subtotal + taxAmount;

    return this.prisma.quotation.create({
      data: {
        organizationId: orgId,
        createdById: userId,
        quotationNumber: quoteNumber,
        customerId: data.customerId,
        templateName: data.templateName || 'Standard Quotation Template',
        validDays,
        expiryDate,
        subtotal,
        discountAmount: 0,
        taxAmount,
        totalAmount,
        status: 'QUOTATION',
        notes: data.notes,
        lines: {
          create: lineCalculations,
        },
      },
      include: {
        customer: true,
        lines: true,
      },
    });
  }

  async updateStatus(orgId: string, id: string, status: QuotationStatus) {
    await this.findOne(orgId, id);

    return this.prisma.quotation.update({
      where: { id },
      data: { status: status as any },
      include: { customer: true, lines: true },
    });
  }

  async convertToSubscription(orgId: string, userId: string, quoteId: string, planId: string) {
    const quote = await this.findOne(orgId, quoteId);

    const existingSub = await this.prisma.subscription.findFirst({
      where: { quotationId: quoteId, organizationId: orgId },
    });
    if (existingSub) {
      throw new BadRequestException('This quotation has already been converted into an active subscription');
    }

    if (quote.status === 'CANCELLED' || quote.status === 'EXPIRED') {
      throw new BadRequestException('Cannot convert a cancelled or expired quotation');
    }

    // Verify plan exists
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, organizationId: orgId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found for subscription conversion');
    }

    const subCount = await this.prisma.subscription.count({ where: { organizationId: orgId } });
    const subNumber = `SUB-${new Date().getFullYear()}-${String(subCount + 1).padStart(3, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      // Re-verify quotation conversion inside transaction to prevent race conditions
      const existingSubInside = await tx.subscription.findFirst({
        where: { quotationId: quote.id, organizationId: orgId },
      });
      if (existingSubInside) {
        throw new BadRequestException('Quotation has already been converted into a subscription');
      }

      // 1. Update quote status to CONFIRMED
      await tx.quotation.update({
        where: { id: quote.id },
        data: { status: 'CONFIRMED' },
      });

      // 2. Create the Subscription
      const subscription = await tx.subscription.create({
        data: {
          organizationId: orgId,
          createdById: userId,
          subscriptionNumber: subNumber,
          customerId: quote.customerId,
          planId: plan.id,
          quotationId: quote.id,
          startDate: new Date(),
          billingFrequency: plan.billingFrequency,
          paymentTerms: 'Net 30',
          subtotal: quote.subtotal,
          discountAmount: quote.discountAmount,
          taxAmount: quote.taxAmount,
          totalAmount: quote.totalAmount,
          status: 'ACTIVE',
          lines: {
            create: quote.lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              taxRate: l.taxRate,
              taxAmount: l.taxAmount,
              lineTotal: l.lineTotal,
            })),
          },
        },
        include: {
          customer: true,
          plan: true,
          lines: true,
        },
      });

      // 3. Create First Draft/Confirmed Invoice for Billing Day
      const invCount = await tx.invoice.count({ where: { organizationId: orgId } });
      const invNumber = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(3, '0')}`;

      await tx.invoice.create({
        data: {
          organizationId: orgId,
          invoiceNumber: invNumber,
          subscriptionId: subscription.id,
          customerId: quote.customerId,
          invoiceDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 86400000), // Net 30
          subtotal: quote.subtotal,
          taxAmount: quote.taxAmount,
          discountAmount: quote.discountAmount,
          totalAmount: quote.totalAmount,
          paidAmount: 0,
          outstandingAmount: quote.totalAmount,
          status: 'CONFIRMED',
          lines: {
            create: quote.lines.map((l) => ({
              description: `Subscription Line: ${l.quantity}x unit`,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              taxRate: l.taxRate,
              taxAmount: l.taxAmount,
              lineTotal: l.lineTotal,
            })),
          },
        },
      });

      return subscription;
    });
  }
}
