import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private prisma: PrismaService) {}

  private calculateNextDate(currentDate: Date, interval: string): Date {
    const nextDate = new Date(currentDate);
    switch (interval.toUpperCase()) {
      case "DAILY":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "WEEKLY":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "YEARLY":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      case "MONTHLY":
      default:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }
    return nextDate;
  }

  async runBillingEngine(runDate = new Date()) {
    this.logger.log(`⚡ Running Billing Day Engine for date: ${runDate.toISOString()}`);

    // 1. Fetch all ACTIVE subscriptions due for billing
    const dueSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        nextBillingDate: { lte: runDate },
      },
      include: {
        customer: true,
        plan: true,
        lines: {
          include: { product: true, variant: true },
        },
      },
    });

    const defaultTax = await this.prisma.taxRule.findFirst({
      where: { isDefault: true, active: true },
    });
    const taxRate = defaultTax ? defaultTax.rate : 0.0;

    let processedCount = 0;
    let totalBilled = 0;
    const generatedInvoices = [];

    for (const sub of dueSubscriptions) {
      // 2. IDEMPOTENCY CHECK: Ensure not already billed for this billing cycle
      const periodStart = sub.nextBillingDate;
      const periodEnd = this.calculateNextDate(periodStart, sub.plan.billingInterval);

      const existingInvoice = await this.prisma.invoice.findFirst({
        where: {
          subscriptionId: sub.id,
          billingPeriodStart: periodStart,
        },
      });

      if (existingInvoice) {
        this.logger.warn(`Subscription ${sub.subscriptionNumber} already billed for period ${periodStart.toISOString()}. Skipping duplicate.`);
        continue;
      }

      // 3. Compute Line Items & Taxes
      let subtotal = 0;
      let taxTotal = 0;

      const invoiceLinesData = sub.lines.map((line) => {
        const itemUnitPrice = line.unitPrice + (line.variant ? line.variant.extraPrice : 0);
        const lineSubtotal = itemUnitPrice * line.quantity;
        const lineTax = (lineSubtotal * (line.taxRate || taxRate)) / 100;

        subtotal += lineSubtotal;
        taxTotal += lineTax;

        return {
          productId: line.productId,
          variantId: line.variantId,
          description: `${line.product.name} ${line.variant ? `(${line.variant.name})` : ""}`,
          quantity: line.quantity,
          unitPrice: itemUnitPrice,
          taxAmount: lineTax,
          discountAmount: 0.0,
          lineTotal: lineSubtotal + lineTax,
        };
      });

      const grandTotal = subtotal + taxTotal;
      const dueDate = new Date(runDate);
      dueDate.setDate(dueDate.getDate() + 30); // Net 30 default

      const invCount = await this.prisma.invoice.count();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, "0")}`;

      // 4. Create Invoice
      const invoice = await this.prisma.invoice.create({
        data: {
          invoiceNumber,
          subscriptionId: sub.id,
          customerId: sub.customerId,
          issueDate: runDate,
          dueDate,
          subtotal,
          taxTotal,
          discountTotal: 0.0,
          grandTotal,
          status: "DRAFT",
          billingPeriodStart: periodStart,
          billingPeriodEnd: periodEnd,
          notes: `Automated recurring invoice for Plan: ${sub.plan.name}`,
          lines: { create: invoiceLinesData },
        },
        include: { lines: true },
      });

      // 5. Update subscription's next billing date so it is NEVER billed twice in this cycle!
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: {
          nextBillingDate: periodEnd,
        },
      });

      processedCount++;
      totalBilled += grandTotal;
      generatedInvoices.push(invoice);
    }

    this.logger.log(`✅ Billing Engine Complete: ${processedCount} subscriptions billed. Total: $${totalBilled}`);

    return {
      success: true,
      processedCount,
      totalBilled,
      invoices: generatedInvoices,
    };
  }

  async getUpcomingBillingForecast() {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return this.prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        nextBillingDate: { lte: nextWeek },
      },
      include: {
        customer: { select: { id: true, name: true, email: true, companyName: true } },
        plan: true,
      },
      orderBy: { nextBillingDate: "asc" },
    });
  }
}
