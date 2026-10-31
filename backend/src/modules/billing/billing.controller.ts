import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";
import { BillingService } from "./billing.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

class TriggerBillingDto {
  @ApiPropertyOptional({ example: "2026-11-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  runDate?: string;
}

@ApiTags("Automated Billing Day Engine")
@Controller("billing")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post("run")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({
    summary: "Trigger automated Billing Day execution (Creates invoices from active due subscriptions, zero double billing)",
  })
  @ApiResponse({ status: 200, description: "Billing run completed; invoices generated." })
  async triggerBillingRun(@Body() dto: TriggerBillingDto) {
    const runDate = dto.runDate ? new Date(dto.runDate) : new Date();
    return this.billingService.runBillingEngine(runDate);
  }

  @Get("forecast")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Get upcoming subscriptions due for billing within the next 7 days" })
  async getForecast() {
    return this.billingService.getUpcomingBillingForecast();
  }
}

