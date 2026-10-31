import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDiscountInput } from '@brightloop/contracts';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.discount.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const discount = await this.prisma.discount.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!discount) {
      throw new NotFoundException('Discount rule not found');
    }

    return discount;
  }

  async create(orgId: string, data: CreateDiscountInput) {
    const existing = await this.prisma.discount.findFirst({
      where: { organizationId: orgId, code: data.code.toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException('A discount with this code already exists in your workspace');
    }

    return this.prisma.discount.create({
      data: {
        organizationId: orgId,
        name: data.name,
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        minPurchase: data.minPurchase || 0,
        minQuantity: data.minQuantity || 0,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        maxUsage: data.maxUsage,
        scope: data.scope,
        applicableProductIds: data.applicableProductIds || [],
      },
    });
  }

  async validateAndCalculate(orgId: string, code: string, purchaseAmount: number, quantity: number) {
    const discount = await this.prisma.discount.findFirst({
      where: { organizationId: orgId, code: code.toUpperCase() },
    });

    if (!discount) {
      throw new NotFoundException('Invalid discount code');
    }

    const now = new Date();
    if (discount.startDate && now < discount.startDate) {
      throw new BadRequestException('This discount promotion has not started yet');
    }

    if (discount.endDate && now > discount.endDate) {
      throw new BadRequestException('This discount coupon has expired');
    }

    if (discount.maxUsage && discount.usedCount >= discount.maxUsage) {
      throw new BadRequestException('This discount coupon has reached its maximum redemption limit');
    }

    if (discount.minPurchase > 0 && purchaseAmount < discount.minPurchase) {
      throw new BadRequestException(`Minimum purchase of $${discount.minPurchase} required to apply this coupon`);
    }

    if (discount.minQuantity > 0 && quantity < discount.minQuantity) {
      throw new BadRequestException(`Minimum quantity of ${discount.minQuantity} items required for this coupon`);
    }

    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = (purchaseAmount * discount.value) / 100;
    } else {
      discountAmount = Math.min(purchaseAmount, discount.value);
    }

    return {
      discount,
      discountAmount,
      finalAmount: Math.max(0, purchaseAmount - discountAmount),
    };
  }
}
