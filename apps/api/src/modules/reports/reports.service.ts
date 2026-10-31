import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface ReportFilterDto {
  startDate?: string;
  endDate?: string;
  status?: string;
  customerId?: string;
  format?: string;
}

@Injectable()
export class ReportsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async getOperationalReport(orgId: string, filters: ReportFilterDto = {}) {
    const now = new Date();

    const subWhere: any = { organizationId: orgId };
    if (filters.status) subWhere.status = filters.status;
    else subWhere.status = 'ACTIVE';
    if (filters.customerId) subWhere.customerId = filters.customerId;
    if (filters.startDate || filters.endDate) {
      subWhere.createdAt = {};
      if (filters.startDate) subWhere.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) subWhere.createdAt.lte = new Date(filters.endDate);
    }

    const invWhere: any = {
      organizationId: orgId,
      status: { in: ['CONFIRMED', 'DRAFT'] },
      dueDate: { lt: now },
    };
    if (filters.customerId) invWhere.customerId = filters.customerId;

    const [
      activeSubscriptions,
      overdueInvoices,
      recentPayments,
      totalCustomers,
      pendingQuotations,
    ] = await Promise.all([
      this.prisma.subscription.findMany({
        where: subWhere,
        include: { customer: true, plan: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.findMany({
        where: invWhere,
        include: { customer: true },
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.payment.findMany({
        where: {
          organizationId: orgId,
          ...(filters.customerId && { customerId: filters.customerId }),
        },
        include: { customer: true, invoice: true },
        orderBy: { paymentDate: 'desc' },
        take: 50,
      }),
      this.prisma.customer.count({
        where: { organizationId: orgId },
      }),
      this.prisma.quotation.count({
        where: { organizationId: orgId, status: 'QUOTATION' },
      }),
    ]);

    const totalOverdueAmount = overdueInvoices.reduce(
      (sum, inv) => sum + inv.outstandingAmount,
      0,
    );
    const totalCollected = recentPayments.reduce((sum, p) => sum + p.amount, 0);

    if (filters.format === 'csv') {
      const csvRows = [
        ['Type', 'Reference', 'Customer', 'Date / Due', 'Amount', 'Status'].join(','),
        ...activeSubscriptions.map((s) =>
          ['Subscription', s.subscriptionNumber, `"${s.customer.name}"`, s.createdAt.toISOString().slice(0, 10), s.totalAmount, s.status].join(','),
        ),
        ...overdueInvoices.map((i) =>
          ['Overdue Invoice', i.invoiceNumber, `"${i.customer.name}"`, i.dueDate.toISOString().slice(0, 10), i.outstandingAmount, i.status].join(','),
        ),
        ...recentPayments.map((p) =>
          ['Payment', p.paymentReference || p.id, `"${p.customer.name}"`, p.paymentDate.toISOString().slice(0, 10), p.amount, 'PAID'].join(','),
        ),
      ];
      return csvRows.join('\n');
    }

    return {
      summary: {
        totalCustomers,
        activeSubscriptionsCount: activeSubscriptions.length,
        pendingQuotationsCount: pendingQuotations,
        overdueInvoicesCount: overdueInvoices.length,
        totalOverdueAmount,
        totalCollected,
      },
      activeSubscriptions,
      overdueInvoices,
      recentPayments,
    };
  }

  async getExecutiveFinancialReport(orgId: string, filters: ReportFilterDto = {}) {
    const invWhere: any = { organizationId: orgId };
    const payWhere: any = { organizationId: orgId };
    const subWhere: any = { organizationId: orgId };

    if (filters.customerId) {
      invWhere.customerId = filters.customerId;
      payWhere.customerId = filters.customerId;
      subWhere.customerId = filters.customerId;
    }

    if (filters.startDate || filters.endDate) {
      invWhere.createdAt = {};
      payWhere.paymentDate = {};
      if (filters.startDate) {
        invWhere.createdAt.gte = new Date(filters.startDate);
        payWhere.paymentDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        invWhere.createdAt.lte = new Date(filters.endDate);
        payWhere.paymentDate.lte = new Date(filters.endDate);
      }
    }

    const [allSubscriptions, allInvoices, allPayments] = await Promise.all([
      this.prisma.subscription.findMany({
        where: subWhere,
        include: { plan: true },
      }),
      this.prisma.invoice.findMany({
        where: invWhere,
      }),
      this.prisma.payment.findMany({
        where: payWhere,
      }),
    ]);

    const totalInvoiced = allInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalCashCollected = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = allInvoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);

    // Calculate MRR approximation
    const mrr = allSubscriptions
      .filter((s) => s.status === 'ACTIVE')
      .reduce((sum, s) => {
        if (s.billingFrequency === 'YEARLY') return sum + s.totalAmount / 12;
        if (s.billingFrequency === 'WEEKLY') return sum + s.totalAmount * 4.33;
        if (s.billingFrequency === 'DAILY') return sum + s.totalAmount * 30;
        return sum + s.totalAmount;
      }, 0);

    if (filters.format === 'csv') {
      const csvRows = [
        ['Metric', 'Value'].join(','),
        ['MRR', Math.round(mrr * 100) / 100],
        ['ARR', Math.round(mrr * 12 * 100) / 100],
        ['Total Invoiced', totalInvoiced],
        ['Total Cash Collected', totalCashCollected],
        ['Total Outstanding', totalOutstanding],
      ];
      return csvRows.join('\n');
    }

    return {
      metrics: {
        mrr: Math.round(mrr * 100) / 100,
        arr: Math.round(mrr * 12 * 100) / 100,
        totalInvoiced,
        totalCashCollected,
        totalOutstanding,
      },
    };
  }
}
