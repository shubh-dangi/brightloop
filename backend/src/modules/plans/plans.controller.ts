import { Controller, Post, Get, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { PlansService } from "./plans.service";
import { CreatePlanDto } from "./dto/create-plan.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Plans & Billing Frequencies")
@Controller("plans")
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a recurring plan with frequency and end-behavior rules (Admin only)" })
  @ApiResponse({ status: 201, description: "Plan created." })
  async createPlan(@Body() dto: CreatePlanDto) {
    return this.plansService.createPlan(dto);
  }

  @Get()
  @ApiOperation({ summary: "List all subscription plans" })
  @ApiQuery({ name: "activeOnly", required: false, type: Boolean })
  async listPlans(@Query("activeOnly") activeOnly?: boolean) {
    return this.plansService.listPlans(activeOnly !== false);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get plan details by ID" })
  async getPlanById(@Param("id") id: string) {
    return this.plansService.getPlanById(id);
  }
}

