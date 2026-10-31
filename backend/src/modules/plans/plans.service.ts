import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreatePlanDto } from "./dto/create-plan.dto";

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async createPlan(dto: CreatePlanDto) {
    return this.prisma.plan.create({
      data: {
        name: dto.name,
        price: dto.price,
        billingInterval: dto.billingInterval,
        minQuantity: dto.minQuantity || 1,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        endBehavior: dto.endBehavior || "RENEWABLE",
      },
    });
  }

  async listPlans(activeOnly = true) {
    return this.prisma.plan.findMany({
      where: activeOnly ? { active: true } : {},
      orderBy: { createdAt: "desc" },
    });
  }

  async getPlanById(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException("Plan not found.");
    return plan;
  }
}

