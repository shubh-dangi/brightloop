import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Finance Lead Analytics & Revenue")
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("analytics/finance")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({
    summary: "Finance Lead Real-time Dashboard: MRR, ARR, Active Subs, Revenue Collected vs Owed, and Overdue Debt (<2s performance)",
  })
  @ApiResponse({ status: 200, description: "Finance summary analytics returned." })
  async getFinanceDashboard() {
    return this.analyticsService.getFinanceDashboard();
  }

  @Get("analytics/summary")
  @ApiOperation({ summary: "Get executive dashboard summary for frontend UI" })
  async getDashboardSummary() {
    const data = await this.analyticsService.getFinanceDashboard();
    return {
      kpis: data.overview,
      overdueInvoices: data.overdueInvoices,
      activity: [],
    };
  }

  @Get("reports/operational")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Get operational reports data for ReportsPage" })
  async getOperationalReport() {
    const data = await this.analyticsService.getFinanceDashboard();
    return {
      summary: {
        totalOverdueAmount: data.overview.totalRevenueOutstanding || 0,
        overdueInvoicesCount: data.overview.overdueInvoicesCount || 0,
        activeSubscriptionsCount: data.overview.activeSubscriptions || 0,
        totalCustomers: data.overview.totalCustomers || 0,
        totalCollected: data.overview.totalRevenueCollected || 0,
      },
      overdueInvoices: data.overdueInvoices || [],
      activeSubscriptions: [],
      recentPayments: [],
    };
  }
}
