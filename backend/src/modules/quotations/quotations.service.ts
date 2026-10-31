import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateQuotationTemplateDto } from "./dto/create-template.dto";

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
}

