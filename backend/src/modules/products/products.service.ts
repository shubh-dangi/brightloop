import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateProductDto, CreateProductVariantDto } from "./dto/create-product.dto";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(dto: CreateProductDto) {
    const { variants, ...productData } = dto;

    return this.prisma.product.create({
      data: {
        ...productData,
        variants: variants && variants.length > 0 ? {
          create: variants.map((v) => ({
            name: v.name,
            attributeKey: v.attributeKey,
            attributeValue: v.attributeValue,
            extraPrice: v.extraPrice,
          })),
        } : undefined,
      },
      include: { variants: true },
    });
  }

  async listProducts(activeOnly = true) {
    return this.prisma.product.findMany({
      where: activeOnly ? { active: true } : {},
      include: { variants: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!product) throw new NotFoundException("Product not found.");
    return product;
  }

  async addVariant(productId: string, dto: CreateProductVariantDto) {
    await this.getProductById(productId);
    return this.prisma.productVariant.create({
      data: {
        productId,
        name: dto.name,
        attributeKey: dto.attributeKey,
        attributeValue: dto.attributeValue,
        extraPrice: dto.extraPrice,
      },
    });
  }
}

