import { Injectable, ConflictException, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateDiscountRuleDto } from "./dto/create-discount.dto";

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  async createDiscountRule(dto: CreateDiscountRuleDto) {
    const existing = await this.prisma.discountRule.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(`Discount code '${dto.code}' already exists.`);
    }

    return this.prisma.discountRule.create({
      data: {
        code: dto.code.toUpperCase(),
        type: dto.type,
        value: dto.value,
        scope: dto.scope || "SUBSCRIPTION",
        productId: dto.productId,
        minQuantity: dto.minQuantity || 0,
        minPurchase: dto.minPurchase || 0,
        maxUses: dto.maxUses,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  async listDiscountRules() {
    return this.prisma.discountRule.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async validateAndApplyDiscount(code: string, subtotal: number, totalQuantity: number) {
    const rule = await this.prisma.discountRule.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!rule || !rule.active) {
      throw new NotFoundException("Invalid or inactive discount code.");
    }

    const now = new Date();
    if (rule.startDate && now < rule.startDate) {
      throw new BadRequestException("Discount code is not active yet.");
    }

    if (rule.endDate && now > rule.endDate) {
      throw new BadRequestException("Discount code has expired.");
    }

    if (rule.maxUses && rule.usedCount >= rule.maxUses) {
      throw new BadRequestException("Discount code usage limit has been reached.");
    }

    if (rule.minPurchase && subtotal < rule.minPurchase) {
      throw new BadRequestException(`Minimum purchase of $${rule.minPurchase} required for this discount.`);
    }

    if (rule.minQuantity && totalQuantity < rule.minQuantity) {
      throw new BadRequestException(`Minimum quantity of ${rule.minQuantity} items required for this discount.`);
    }

    let discountAmount = 0;
    if (rule.type === "PERCENTAGE") {
      discountAmount = (subtotal * rule.value) / 100;
    } else {
      discountAmount = Math.min(rule.value, subtotal);
    }

    const finalAmount = Math.max(0, subtotal - discountAmount);

    return {
      valid: true,
      rule,
      discountAmount,
      finalAmount,
    };
  }

  async recordDiscountUsage(ruleId: string) {
    await this.prisma.discountRule.update({
      where: { id: ruleId },
      data: { usedCount: { increment: 1 } },
    });
  }
}
