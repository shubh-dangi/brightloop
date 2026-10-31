import { Inject, Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService, ReportFilterDto } from './reports.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TenantContext } from '../../common/guards/tenant.guard';
import { PermissionKey } from '@brightloop/contracts';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(@Inject(ReportsService) private readonly reportsService: ReportsService) {}

  @Get('operational')
  @RequirePermissions(PermissionKey.REPORTS_OPERATIONAL)
  @ApiOperation({ summary: 'Get operational reports (Active subscriptions, overdue invoices to chase)' })
  async getOperationalReport(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ReportFilterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.reportsService.getOperationalReport(tenant.id, query);
    if (query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="operational-report.csv"');
      return result;
    }
    return result;
  }

  @Get('financial')
  @RequirePermissions(PermissionKey.REPORTS_FINANCIAL)
  @ApiOperation({ summary: 'Get executive financial reports (MRR, ARR, margins - Admin only)' })
  async getExecutiveFinancialReport(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ReportFilterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.reportsService.getExecutiveFinancialReport(tenant.id, query);
    if (query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="financial-report.csv"');
      return result;
    }
    return result;
  }
}
