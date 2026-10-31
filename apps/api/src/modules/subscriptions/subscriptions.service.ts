import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSubscriptionInput, SubscriptionStatus } from '@brightloop/contracts';

@Injectable()
export class SubscriptionsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async findAll(orgId: string, userRole?: string, userEmail?: string, status?: string, search?: string) {
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

    if (status) {
      where.status = status as SubscriptionStatus;
    }

    if (search) {
      where.OR = [
        { subscriptionNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        plan: true,
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
        throw new NotFoundException('Subscription not found');
      }
      where.customerId = customer.id;
    }

    const subscription = await this.prisma.subscription.findFirst({
      where,
      include: {
        customer: true,
        plan: true,
        creator: { select: { id: true, name: true, email: true } },
        lines: {
          include: { product: true, variant: true },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async create(orgId: string, userId: string, data: CreateSubscriptionInput) {
    const plan = await this.prisma.plan.findFirst({
      where: { id: data.planId, organizationId: orgId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const count = await this.prisma.subscription.count({ where: { organizationId: orgId } });
    const subNumber = `SUB-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    let subtotal = 0;
    let taxAmount = 0;

    const lineCalculations = [];

    for (const line of data.lines) {
      const product = await this.prisma.product.findFirst({
        where: { id: line.productId, organizationId: orgId },
        include: { variants: true },
      });

      if (!product) {
        throw new BadRequestException(`Product ${line.productId} not found`);
      }

      const basePrice = product.salesPrice || 0;
      let variantExtra = 0;
      if (line.variantId) {
        const variant = product.variants.find((v) => v.id === line.variantId);
        if (variant) variantExtra = variant.additionalPrice;
      }
      const unitPrice = (line.unitPrice && line.unitPrice > variantExtra) ? line.unitPrice : (basePrice + variantExtra);

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

    return this.prisma.subscription.create({
      data: {
        organizationId: orgId,
        createdById: userId,
        subscriptionNumber: subNumber,
        customerId: data.customerId,
        planId: data.planId,
        quotationId: data.quotationId,
        startDate: new Date(data.startDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        billingFrequency: plan.billingFrequency,
        paymentTerms: data.paymentTerms || 'Net 30',
        subtotal,
        taxAmount,
        discountAmount: 0,
        totalAmount,
        status: 'ACTIVE',
        lines: {
          create: lineCalculations,
        },
      },
      include: {
        customer: true,
        plan: true,
        lines: true,
      },
    });
  }

  async pause(orgId: string, id: string) {
    const sub = await this.findOne(orgId, id);
    if (!sub.plan.allowPause) {
      throw new BadRequestException('This plan does not permit pausing subscriptions.');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: { status: 'PAUSED' },
      include: { customer: true, plan: true },
    });
  }

  async resume(orgId: string, id: string) {
    await this.findOne(orgId, id);

    return this.prisma.subscription.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: { customer: true, plan: true },
    });
  }

  async close(orgId: string, id: string) {
    const sub = await this.findOne(orgId, id);
    if (!sub.plan.allowEarlyClose) {
      throw new BadRequestException('This plan does not permit early closure.');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: { status: 'CLOSED' },
      include: { customer: true, plan: true },
    });
  }

  async renew(orgId: string, id: string) {
    const sub = await this.findOne(orgId, id);
    if (!sub.plan.allowRenewal) {
      throw new BadRequestException('This plan is not configured for automatic renewals.');
    }

    // Advance expiry date by billing frequency
    const currentExpiry = sub.expiryDate ? new Date(sub.expiryDate) : new Date();
    const newExpiry = new Date(currentExpiry);

    if (sub.billingFrequency === 'MONTHLY') {
      newExpiry.setMonth(newExpiry.getMonth() + 1);
    } else if (sub.billingFrequency === 'YEARLY') {
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    } else if (sub.billingFrequency === 'WEEKLY') {
      newExpiry.setDate(newExpiry.getDate() + 7);
    } else {
      newExpiry.setDate(newExpiry.getDate() + 1);
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        expiryDate: newExpiry,
      },
      include: { customer: true, plan: true },
    });
  }
}
