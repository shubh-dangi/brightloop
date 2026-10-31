import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser, UserPayload } from "../../common/decorators/current-user.decorator";

@ApiTags("Dashboard Summary")
@Controller("dashboard")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("summary")
  @ApiOperation({ summary: "Get role-aware dashboard summary with KPIs and charts for frontend UI" })
  async getSummary(@CurrentUser() user: UserPayload) {
    return this.analyticsService.getDashboardSummary(user);
  }
}
