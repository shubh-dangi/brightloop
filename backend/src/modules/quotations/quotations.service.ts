import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateQuotationTemplateDto } from "./dto/create-template.dto";
import { UserPayload } from "../../common/decorators/current-user.decorator";

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  async createTemplate(dto: CreateQuotationTemplateDto) {
    return this.prisma.quotationTemplate.create({
      data: {
        name: dto.name,
        planId: dto.planId,
        validityDays: dto.validityDays,
        lines: {
          create: dto.lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            quantity: l.quantity,
          })),
        },
      },
      include: {
        lines: {
          include: { product: true, variant: true },
        },
        plan: true,
      },
    });
  }

  async listTemplates() {
    return this.prisma.quotationTemplate.findMany({
      where: { active: true },
      include: {
        lines: {
          include: { product: true, variant: true },
        },
        plan: true,
      },
    });
  }

  async getTemplateById(id: string) {
    const template = await this.prisma.quotationTemplate.findUnique({
      where: { id },
      include: {
        lines: {
          include: { product: true, variant: true },
        },
        plan: true,
      },
    });
    if (!template) throw new NotFoundException("Template not found.");
    return template;
  }

  async listQuotations(actor: UserPayload) {
    const where: any = {
      status: { in: ["QUOTATION", "DRAFT"] },
    };
    if (actor && actor.role === "CUSTOMER") {
      where.customerId = actor.userId;
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

  async getQuotationById(id: string, actor: UserPayload) {
    const quote = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, companyName: true, phone: true } },
        plan: true,
        lines: { include: { product: true, variant: true } },
      },
    });
    if (!quote) throw new NotFoundException("Quotation not found.");
    if (actor.role === "CUSTOMER" && quote.customerId !== actor.userId) {
      throw new ForbiddenException("Access denied.");
    }
    return quote;
  }

  async createQuotation(data: any, actor: UserPayload) {
    const customerId = actor.role === "CUSTOMER" ? actor.userId : (data.customerId || actor.userId);
    const defaultPlan = await this.prisma.plan.findFirst();
    const planId = data.planId || defaultPlan?.id;
    if (!planId) throw new NotFoundException("No billing plan available.");

    let totalAmount = 0;
    const linesData = [];
    if (Array.isArray(data.lines)) {
      for (const l of data.lines) {
        const prod = await this.prisma.product.findUnique({ where: { id: l.productId } });
        let variantExtra = 0;
        if (l.variantId) {
          const v = await this.prisma.productVariant.findUnique({ where: { id: l.variantId } });
          if (v) variantExtra = v.extraPrice;
        }
        const unitPrice = prod && prod.salesPrice > 0 ? (prod.salesPrice + variantExtra) : (l.unitPrice || 0);
        const taxRate = l.taxRate || 0;
        const lineTax = (unitPrice * taxRate) / 100;
        const lineTotal = (unitPrice + lineTax) * (l.quantity || 1);
        totalAmount += lineTotal;
        linesData.push({
          productId: l.productId,
          variantId: l.variantId,
          quantity: l.quantity || 1,
          unitPrice,
          taxRate,
          amount: lineTotal,
        });
      }
    }

    const count = await this.prisma.subscription.count();
    const subscriptionNumber = `QT-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    return this.prisma.subscription.create({
      data: {
        subscriptionNumber,
        customerId,
        planId,
        startDate: new Date(),
        nextBillingDate: new Date(),
        paymentTerms: data.paymentTerms || "Net 30",
        status: "QUOTATION",
        totalAmount,
        lines: { create: linesData },
      },
      include: {
        customer: { select: { id: true, name: true, email: true, companyName: true } },
        plan: true,
        lines: { include: { product: true, variant: true } },
      },
    });
  }

  async updateQuotationStatus(id: string, status: string, actor: UserPayload) {
    const quote = await this.getQuotationById(id, actor);
    return this.prisma.subscription.update({
      where: { id: quote.id },
      data: { status },
      include: { customer: true, plan: true, lines: true },
    });
  }

  async convertToSubscription(id: string, planId?: string, actor?: UserPayload) {
    const quote = await this.getQuotationById(id, actor!);
    const targetPlanId = planId || quote.planId;
    const plan = await this.prisma.plan.findUnique({ where: { id: targetPlanId } });
    if (!plan) throw new NotFoundException("Plan not found.");

    const startDate = new Date();
    const nextDate = new Date(startDate);
    if (plan.billingInterval.toUpperCase() === "YEARLY") {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    return this.prisma.subscription.update({
      where: { id: quote.id },
      data: {
        status: "ACTIVE",
        planId: targetPlanId,
        startDate,
        nextBillingDate: nextDate,
      },
      include: { customer: true, plan: true, lines: true },
    });
  }
}
