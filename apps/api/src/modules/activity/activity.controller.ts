import { Inject, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivityService, ActivityQueryParams } from './activity.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TenantContext } from '../../common/guards/tenant.guard';
import { PermissionKey } from '@brightloop/contracts';

@ApiTags('Activity / Audit Logs')
@ApiBearerAuth()
@Controller('activity')
export class ActivityController {
  constructor(@Inject(ActivityService) private readonly activityService: ActivityService) {}

  @Get()
  @RequirePermissions(PermissionKey.AUDIT_READ)
  @ApiOperation({ summary: 'List workspace activity timeline with audit details' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'entity', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ActivityQueryParams,
  ) {
    return this.activityService.findAll(tenant.id, query);
  }
}
