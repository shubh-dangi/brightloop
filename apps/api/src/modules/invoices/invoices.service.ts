import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InvoiceStatus } from '@brightloop/contracts';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

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
      where.status = status as InvoiceStatus;
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        subscription: {
          include: { plan: true },
        },
        lines: true,
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
        throw new NotFoundException('Invoice not found');
      }
      where.customerId = customer.id;
    }

    const invoice = await this.prisma.invoice.findFirst({
      where,
      include: {
        customer: true,
        subscription: {
          include: { plan: true },
        },
        lines: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async confirm(orgId: string, id: string) {
    const invoice = await this.findOne(orgId, id);
    if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
      throw new BadRequestException('Cannot confirm a paid or cancelled invoice');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: { customer: true, lines: true },
    });
  }

  async cancel(orgId: string, id: string) {
    const invoice = await this.findOne(orgId, id);
    if (invoice.status === 'PAID') {
      throw new BadRequestException('Cannot cancel an invoice that is already paid');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED', outstandingAmount: 0 },
      include: { customer: true, lines: true },
    });
  }

  async send(orgId: string, id: string) {
    const invoice = await this.findOne(orgId, id);
    // In production, would trigger Resend EmailService with PDF attachment
    return {
      message: `Invoice ${invoice.invoiceNumber} has been dispatched to ${invoice.customer.email}`,
      sentAt: new Date().toISOString(),
    };
  }
}
