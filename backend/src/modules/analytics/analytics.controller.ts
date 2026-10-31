import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Finance Lead Analytics & Revenue")
@Controller("analytics")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("finance")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({
    summary: "Finance Lead Real-time Dashboard: MRR, ARR, Active Subs, Revenue Collected vs Owed, and Overdue Debt (<2s performance)",
  })
  @ApiResponse({ status: 200, description: "Finance summary analytics returned." })
  async getFinanceDashboard() {
    return this.analyticsService.getFinanceDashboard();
  }

  @Get("summary")
  @ApiOperation({ summary: "Get executive dashboard summary for frontend UI" })
  async getDashboardSummary() {
    const data = await this.analyticsService.getFinanceDashboard();
    return {
      kpis: data.overview,
      overdueInvoices: data.overdueInvoices,
      activity: [],
    };
  }
}

