import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getFinanceDashboard() {
    const now = new Date();

    const [
      activeSubscriptionsCount,
      totalCustomersCount,
      paymentsAggregation,
      activeSubscriptions,
      invoices,
    ] = await Promise.all([
      this.prisma.subscription.count({ where: { status: "ACTIVE" } }),
      this.prisma.user.count({ where: { role: "CUSTOMER" } }),
      this.prisma.payment.aggregate({ _sum: { amount: true } }),
      this.prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        include: { plan: true },
      }),
      this.prisma.invoice.findMany({
        include: {
          customer: { select: { id: true, name: true, email: true, companyName: true } },
          payments: true,
        },
      }),
    ]);

    // 1. Calculate MRR & ARR
    let mrr = 0;
    for (const sub of activeSubscriptions) {
      const interval = sub.plan.billingInterval.toUpperCase();
      if (interval === "DAILY") mrr += sub.totalAmount * 30;
      else if (interval === "WEEKLY") mrr += sub.totalAmount * 4.33;
      else if (interval === "MONTHLY") mrr += sub.totalAmount;
      else if (interval === "YEARLY") mrr += sub.totalAmount / 12;
    }
    const arr = mrr * 12;

    // 2. Revenue Collected vs Outstanding
    const totalCollected = paymentsAggregation._sum.amount || 0;
    let totalOwed = 0;
    const overdueInvoices = [];

    for (const inv of invoices) {
      const paidForInv = inv.payments.reduce((acc, p) => acc + p.amount, 0);
      const balance = Math.max(0, inv.grandTotal - paidForInv);

      if (inv.status !== "PAID" && inv.status !== "CANCELLED") {
        totalOwed += balance;
      }

      if (inv.status === "CONFIRMED" && new Date(inv.dueDate) < now && balance > 0) {
        overdueInvoices.push({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customer: inv.customer,
          dueDate: inv.dueDate,
          grandTotal: inv.grandTotal,
          balanceOwed: balance,
          daysOverdue: Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 3600 * 24)),
        });
      }
    }

    return {
      overview: {
        activeSubscriptions: activeSubscriptionsCount,
        totalCustomers: totalCustomersCount,
        mrr: Math.round(mrr * 100) / 100,
        arr: Math.round(arr * 100) / 100,
        totalRevenueCollected: Math.round(totalCollected * 100) / 100,
        totalRevenueOutstanding: Math.round(totalOwed * 100) / 100,
        overdueInvoicesCount: overdueInvoices.length,
      },
      overdueInvoices: overdueInvoices.sort((a, b) => b.daysOverdue - a.daysOverdue),
    };
  }
}

