import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("Dashboard Summary")
@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("summary")
  @ApiOperation({ summary: "Get executive dashboard summary for frontend UI" })
  async getSummary() {
    const data = await this.analyticsService.getFinanceDashboard();
    return {
      kpis: data.overview,
      overdueInvoices: data.overdueInvoices,
      activity: [],
    };
  }
}

