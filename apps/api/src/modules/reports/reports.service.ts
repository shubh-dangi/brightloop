import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async getOperationalReport(orgId: string) {
    const now = new Date();

    const [
      activeSubscriptions,
      overdueInvoices,
      recentPayments,
      totalCustomers,
      pendingQuotations,
    ] = await Promise.all([
      this.prisma.subscription.findMany({
        where: { organizationId: orgId, status: 'ACTIVE' },
        include: { customer: true, plan: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.findMany({
        where: {
          organizationId: orgId,
          status: { in: ['CONFIRMED', 'DRAFT'] },
          dueDate: { lt: now },
        },
        include: { customer: true },
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.payment.findMany({
        where: { organizationId: orgId },
        include: { customer: true, invoice: true },
        orderBy: { paymentDate: 'desc' },
        take: 20,
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

  async getExecutiveFinancialReport(orgId: string) {
    const [allSubscriptions, allInvoices, allPayments] = await Promise.all([
      this.prisma.subscription.findMany({
        where: { organizationId: orgId },
        include: { plan: true },
      }),
      this.prisma.invoice.findMany({
        where: { organizationId: orgId },
      }),
      this.prisma.payment.findMany({
        where: { organizationId: orgId },
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
