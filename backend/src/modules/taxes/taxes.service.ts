import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateTaxRuleDto } from "./dto/create-tax.dto";

@Injectable()
export class TaxesService {
  constructor(private prisma: PrismaService) {}

  async createTaxRule(dto: CreateTaxRuleDto) {
    if (dto.isDefault) {
      await this.prisma.taxRule.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.taxRule.create({
      data: {
        name: dto.name,
        rate: dto.rate,
        isDefault: dto.isDefault || false,
      },
    });
  }

  async listTaxRules() {
    return this.prisma.taxRule.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getDefaultTaxRule() {
    const tax = await this.prisma.taxRule.findFirst({
      where: { isDefault: true, active: true },
    });
    return tax || { rate: 0.0, name: "Zero Tax" };
  }
}

