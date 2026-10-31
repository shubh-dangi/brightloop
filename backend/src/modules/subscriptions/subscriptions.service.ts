import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateSubscriptionDto, SubscriptionStatus } from "./dto/create-subscription.dto";
import { UserPayload } from "../../common/decorators/current-user.decorator";

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  private calculateNextBillingDate(startDate: Date, interval: string): Date {
    const nextDate = new Date(startDate);
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

  async createSubscription(dto: CreateSubscriptionDto, actor: UserPayload) {
    const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException("Plan not found.");

    const customer = await this.prisma.user.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException("Customer not found.");

    // Customer cannot create subscription for another customer
    if (actor.role === "CUSTOMER" && actor.userId !== dto.customerId) {
      throw new ForbiddenException("Customers can only create subscriptions for themselves.");
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const nextBillingDate = this.calculateNextBillingDate(startDate, plan.billingInterval);

    // SECURITY: Validate product catalog and compute official unit price (Price tampering prevention)
    let totalAmount = 0;
    const computedLines = [];

    for (const line of dto.lines) {
      const product = await this.prisma.product.findUnique({ where: { id: line.productId } });
      if (!product) throw new NotFoundException(`Product not found: ${line.productId}`);

      let variantExtra = 0;
      if (line.variantId) {
        const variant = await this.prisma.productVariant.findUnique({ where: { id: line.variantId } });
        if (variant) variantExtra = variant.extraPrice;
      }

      // Base unit price comes from verified catalog, fallback to DTO if product price is 0
      const unitPrice = product.salesPrice > 0 ? (product.salesPrice + variantExtra) : (line.unitPrice || 0);
      const taxRate = line.taxRate && line.taxRate >= 0 ? line.taxRate : 0;
      const lineTax = (unitPrice * taxRate) / 100;
      const lineTotal = (unitPrice + lineTax) * (line.quantity || 1);

      totalAmount += lineTotal;
      computedLines.push({
        productId: line.productId,
        variantId: line.variantId,
        quantity: line.quantity || 1,
        unitPrice,
        taxRate,
        amount: lineTotal,
      });
    }

    const count = await this.prisma.subscription.count();
    const subscriptionNumber = `SUB-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const subscription = await this.prisma.subscription.create({
      data: {
        subscriptionNumber,
        customerId: dto.customerId,
        planId: dto.planId,
        startDate,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        nextBillingDate,
        paymentTerms: dto.paymentTerms || "Net 30",
        status: actor.role === "CUSTOMER" ? "QUOTATION" : "DRAFT",
        totalAmount,
        lines: { create: computedLines },
      },
      include: {
        customer: { select: { id: true, name: true, email: true, companyName: true } },
        plan: true,
        lines: { include: { product: true, variant: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: actor.userId,
        action: "SUBSCRIPTION_CREATED",
        entity: "Subscription",
        entityId: subscription.id,
        details: JSON.stringify({ number: subscriptionNumber, total: totalAmount }),
      },
    });

    return subscription;
  }

  async listSubscriptions(actor: UserPayload, status?: string) {
    const where: any = {};
    if (actor.role === "CUSTOMER") {
      where.customerId = actor.userId; // Strict Tenant Isolation
    }
    if (status) {
      where.status = status;
    }

    return this.prisma.subscription.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, companyName: true } },
        plan: true,
        lines: { include: { product: true, variant: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSubscriptionById(id: string, actor: UserPayload) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, companyName: true } },
        plan: true,
        lines: { include: { product: true, variant: true } },
        invoices: true,
      },
    });

    if (!sub) throw new NotFoundException("Subscription not found.");

    if (actor.role === "CUSTOMER" && sub.customerId !== actor.userId) {
      throw new ForbiddenException("Access denied: You cannot view another customer's subscription.");
    }

    return sub;
  }

  async transitionStatus(id: string, targetStatus: SubscriptionStatus, actor: UserPayload) {
    const sub = await this.getSubscriptionById(id, actor);

    // State Machine Transitions validation
    const validTransitions: Record<string, string[]> = {
      DRAFT: ["QUOTATION", "CANCELLED", "CLOSED"],
      QUOTATION: ["CONFIRMED", "CLOSED"],
      CONFIRMED: ["ACTIVE", "CLOSED"],
      ACTIVE: ["PAUSED", "CLOSED"],
      PAUSED: ["ACTIVE", "CLOSED"],
      CLOSED: ["ACTIVE"], // Renew
    };

    const allowed = validTransitions[sub.status] || [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition subscription from status '${sub.status}' to '${targetStatus}'. Allowed: [${allowed.join(", ")}]`
      );
    }

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { status: targetStatus },
      include: { customer: true, plan: true, lines: true },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: actor.userId,
        action: `SUBSCRIPTION_${targetStatus}`,
        entity: "Subscription",
        entityId: id,
        details: JSON.stringify({ from: sub.status, to: targetStatus }),
      },
    });

    return updated;
  }
}
