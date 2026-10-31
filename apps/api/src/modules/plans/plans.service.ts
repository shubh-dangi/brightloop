import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePlanInput } from '@brightloop/contracts';

@Injectable()
export class PlansService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.plan.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { id: true, name: true, type: true, salesPrice: true },
        },
        _count: {
          select: { subscriptions: true },
        },
      },
    });
  }

  async findOne(orgId: string, id: string) {
    const plan = await this.prisma.plan.findFirst({
      where: { id, organizationId: orgId },
      include: {
        product: true,
        subscriptions: {
          include: { customer: true },
          take: 10,
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  async create(orgId: string, data: CreatePlanInput) {
    return this.prisma.plan.create({
      data: {
        organizationId: orgId,
        productId: data.productId,
        name: data.name,
        price: data.price,
        billingFrequency: data.billingFrequency,
        minQuantity: data.minQuantity,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        autoCloseOnEnd: data.autoCloseOnEnd,
        allowEarlyClose: data.allowEarlyClose,
        allowPause: data.allowPause,
        allowRenewal: data.allowRenewal,
      },
      include: {
        product: true,
      },
    });
  }

  async update(orgId: string, id: string, data: any) {
    await this.findOne(orgId, id);
    return this.prisma.plan.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.billingFrequency && { billingFrequency: data.billingFrequency }),
        ...(data.minQuantity !== undefined && { minQuantity: data.minQuantity }),
        ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.autoCloseOnEnd !== undefined && { autoCloseOnEnd: data.autoCloseOnEnd }),
        ...(data.allowEarlyClose !== undefined && { allowEarlyClose: data.allowEarlyClose }),
        ...(data.allowPause !== undefined && { allowPause: data.allowPause }),
        ...(data.allowRenewal !== undefined && { allowRenewal: data.allowRenewal }),
      },
      include: {
        product: true,
      },
    });
  }
}
