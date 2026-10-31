import { Inject, Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
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
  async getOperationalReport(@CurrentTenant() tenant: TenantContext) {
    return this.reportsService.getOperationalReport(tenant.id);
  }

  @Get('financial')
  @RequirePermissions(PermissionKey.REPORTS_FINANCIAL)
  @ApiOperation({ summary: 'Get executive financial reports (MRR, ARR, margins - Admin only)' })
  async getExecutiveFinancialReport(@CurrentTenant() tenant: TenantContext) {
    return this.reportsService.getExecutiveFinancialReport(tenant.id);
  }
}
