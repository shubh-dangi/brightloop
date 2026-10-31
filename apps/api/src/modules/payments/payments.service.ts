import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RecordPaymentInput } from '@brightloop/contracts';

@Injectable()
export class PaymentsService {
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
        { paymentReference: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { invoice: { invoiceNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      include: {
        customer: true,
        invoice: true,
        recordedBy: {
          select: { id: true, name: true, email: true },
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
        throw new NotFoundException('Payment record not found');
      }
      where.customerId = customer.id;
    }

    const payment = await this.prisma.payment.findFirst({
      where,
      include: {
        customer: true,
        invoice: {
          include: { lines: true },
        },
        recordedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    return payment;
  }

  async record(orgId: string, userId: string, data: RecordPaymentInput) {
    if (data.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    return this.prisma.$transaction(async (tx) => {
      // Concurrency lock & verification inside transaction
      const invoice = await tx.invoice.findFirst({
        where: { id: data.invoiceId, organizationId: orgId },
        include: { customer: true },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      if (invoice.status === 'CANCELLED') {
        throw new BadRequestException('Cannot record payment against a cancelled invoice');
      }

      if (invoice.status === 'PAID' || invoice.outstandingAmount <= 0) {
        throw new BadRequestException('Invoice is already fully paid');
      }

      if (data.amount > invoice.outstandingAmount) {
        throw new BadRequestException(
          `Payment amount (${data.amount}) cannot exceed remaining outstanding balance (${invoice.outstandingAmount})`,
        );
      }

      const count = await tx.payment.count({ where: { organizationId: orgId } });
      const paymentReference = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

      // 1. Create payment record
      const payment = await tx.payment.create({
        data: {
          organizationId: orgId,
          paymentReference,
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          paymentDate: new Date(data.paymentDate),
          note: data.note,
          recordedById: userId,
        },
        include: {
          customer: true,
          invoice: true,
          recordedBy: { select: { id: true, name: true, email: true } },
        },
      });

      // 2. Update invoice balances atomically
      const newPaidAmount = invoice.paidAmount + data.amount;
      const newOutstandingAmount = Math.max(0, invoice.totalAmount - newPaidAmount);
      const isPaidInFull = newOutstandingAmount <= 0;

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          outstandingAmount: newOutstandingAmount,
          ...(isPaidInFull && { status: 'PAID' }),
        },
      });

      // 3. Log to ActivityLedger
      await tx.activityLog.create({
        data: {
          organizationId: orgId,
          userId,
          action: 'payment:recorded',
          entity: 'Payment',
          entityId: payment.id,
          details: {
            paymentReference,
            invoiceNumber: invoice.invoiceNumber,
            amount: data.amount,
            method: data.paymentMethod,
          },
        },
      });

      return payment;
    });
  }
}
