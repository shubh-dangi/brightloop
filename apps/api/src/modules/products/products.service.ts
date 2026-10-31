import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductInput } from '@brightloop/contracts';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, userRole: string, search?: string) {
    const where: any = { organizationId: orgId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        variants: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Mask cost price for Staff (MEMBER / VIEWER)
    const isStaff = userRole === 'MEMBER' || userRole === 'VIEWER';
    return products.map((p) => ({
      ...p,
      costPrice: isStaff ? null : p.costPrice,
    }));
  }

  async findOne(orgId: string, id: string, userRole: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, organizationId: orgId },
      include: {
        variants: true,
        plans: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const isStaff = userRole === 'MEMBER' || userRole === 'VIEWER';
    return {
      ...product,
      costPrice: isStaff ? null : product.costPrice,
    };
  }

  async create(orgId: string, data: CreateProductInput) {
    return this.prisma.product.create({
      data: {
        organizationId: orgId,
        name: data.name,
        type: data.type,
        salesPrice: data.salesPrice,
        costPrice: data.costPrice,
        notes: data.notes,
        variants: data.variants?.length
          ? {
              create: data.variants.map((v) => ({
                name: v.name,
                additionalPrice: v.additionalPrice,
              })),
            }
          : undefined,
      },
      include: {
        variants: true,
      },
    });
  }

  async update(orgId: string, id: string, data: Partial<CreateProductInput>) {
    await this.prisma.product.findFirstOrThrow({
      where: { id, organizationId: orgId },
    });

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.salesPrice !== undefined && { salesPrice: data.salesPrice }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        variants: true,
      },
    });
  }
}
