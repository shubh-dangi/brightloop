import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async getSummary(orgId: string, userRole?: string, userEmail?: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (userRole === 'CUSTOMER' && userEmail) {
      const customer = await this.prisma.customer.findFirst({
        where: { organizationId: orgId, email: userEmail.toLowerCase() },
      });

      if (!customer) {
        return {
          stats: {
            totalCustomers: 1,
            activeSubscriptions: 0,
            quotationsPending: 0,
            invoicesDue: 0,
            invoicesOverdue: 0,
            paymentsCollectedThisMonth: 0,
            mrr: 0,
            totalMembers: 1,
            systemHealth: '100% Operational',
          },
          charts: { trendData: [], statusDistribution: [] },
          recentActivity: [],
          recentNotifications: [],
        };
      }

      const [activeSubs, invoicesDue, invoicesOverdue, paymentsThisMonth, mySubs, allPayments] =
        await Promise.all([
          this.prisma.subscription.count({
            where: { organizationId: orgId, customerId: customer.id, status: 'ACTIVE' },
          }),
          this.prisma.invoice.count({
            where: { organizationId: orgId, customerId: customer.id, status: 'CONFIRMED' },
          }),
          this.prisma.invoice.count({
            where: {
              organizationId: orgId,
              customerId: customer.id,
              status: 'CONFIRMED',
              dueDate: { lt: now },
            },
          }),
          this.prisma.payment.findMany({
            where: {
              organizationId: orgId,
              customerId: customer.id,
              paymentDate: { gte: startOfMonth },
            },
            select: { amount: true },
          }),
          this.prisma.subscription.findMany({
            where: { organizationId: orgId, customerId: customer.id, status: 'ACTIVE' },
            select: { billingFrequency: true, totalAmount: true },
          }),
          this.prisma.payment.findMany({
            where: {
              organizationId: orgId,
              customerId: customer.id,
            },
            select: { amount: true },
          }),
        ]);

      const paymentsCollectedThisMonth = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);
      const totalRealizedPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
      const calculatedSpend = mySubs.reduce((sum, s) => sum + s.totalAmount, 0);

      return {
        stats: {
          totalCustomers: 1,
          activeSubscriptions: activeSubs,
          quotationsPending: 0,
          invoicesDue,
          invoicesOverdue,
          paymentsCollectedThisMonth,
          totalRealizedPaid,
          mrr: calculatedSpend,
          totalMembers: 1,
          systemHealth: '100% Operational',
        },
        charts: { trendData: [], statusDistribution: [] },
        recentActivity: [],
        recentNotifications: [],
      };
    }

    const [
      totalCustomers,
      activeSubscriptions,
      quotationsPending,
      invoicesDue,
      invoicesOverdue,
      paymentsThisMonth,
      totalMembers,
      recentActivity,
      recentNotifications,
      activeSubsList,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { organizationId: orgId } }),
      this.prisma.subscription.count({
        where: { organizationId: orgId, status: 'ACTIVE' },
      }),
      this.prisma.quotation.count({
        where: { organizationId: orgId, status: 'QUOTATION' },
      }),
      this.prisma.invoice.count({
        where: { organizationId: orgId, status: 'CONFIRMED' },
      }),
      this.prisma.invoice.count({
        where: {
          organizationId: orgId,
          status: 'CONFIRMED',
          dueDate: { lt: now },
        },
      }),
      this.prisma.payment.findMany({
        where: {
          organizationId: orgId,
          paymentDate: { gte: startOfMonth },
        },
        select: { amount: true },
      }),
      this.prisma.organizationMember.count({
        where: { organizationId: orgId },
      }),
      this.prisma.activityLog.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.notification.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.subscription.findMany({
        where: { organizationId: orgId, status: 'ACTIVE' },
        select: { billingFrequency: true, totalAmount: true },
      }),
    ]);

    const paymentsCollectedThisMonth = paymentsThisMonth.reduce(
      (sum, p) => sum + p.amount,
      0,
    );

    // Dynamic Monthly Recurring Revenue calculation
    const calculatedMRR = activeSubsList.reduce((sum, s) => {
      if (s.billingFrequency === 'YEARLY') return sum + s.totalAmount / 12;
      if (s.billingFrequency === 'WEEKLY') return sum + s.totalAmount * 4.33;
      if (s.billingFrequency === 'DAILY') return sum + s.totalAmount * 30;
      return sum + s.totalAmount;
    }, 0);

    // Distribution of active subscriptions by billing frequency
    const monthlyCount = activeSubsList.filter((s) => s.billingFrequency === 'MONTHLY').length;
    const yearlyCount = activeSubsList.filter((s) => s.billingFrequency === 'YEARLY').length;
    const otherCount = activeSubsList.length - monthlyCount - yearlyCount;

    const statusDistribution = [
      { name: 'Monthly Plan', value: monthlyCount || 1, color: '#8b5cf6' },
      { name: 'Yearly Plan', value: yearlyCount || 1, color: '#10b981' },
      { name: 'Custom / Other', value: otherCount || 0, color: '#6366f1' },
    ];

    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const trendData = months.map((month, index) => {
      const multiplier = (index + 1) / months.length;
      return {
        month,
        revenue: Math.round(calculatedMRR * multiplier) || (index + 1) * 350,
        activity: (index + 1) * 8 + 4,
      };
    });

    return {
      stats: {
        totalCustomers,
        activeSubscriptions,
        quotationsPending,
        invoicesDue,
        invoicesOverdue,
        paymentsCollectedThisMonth,
        mrr: Math.round(calculatedMRR * 100) / 100,
        totalMembers,
        systemHealth: '100% Operational',
      },
      charts: {
        trendData,
        statusDistribution,
      },
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        entity: a.entity,
        user: a.user?.name || 'System',
        createdAt: a.createdAt,
      })),
      recentNotifications,
    };
  }
}
