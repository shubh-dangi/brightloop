import { Inject, Controller,
  Get,
  Post,
  Patch,
  Param,
  Body, } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TenantContext } from '../../common/guards/tenant.guard';
import {
  PermissionKey,
  CreatePlanInput,
} from '@brightloop/contracts';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(@Inject(PlansService) private readonly plansService: PlansService) {}

  @Get()
  @RequirePermissions(PermissionKey.PLANS_READ)
  @ApiOperation({ summary: 'List all subscription plans (Read-only for Staff)' })
  async findAll(@CurrentTenant() tenant: TenantContext) {
    return this.plansService.findAll(tenant.id);
  }

  @Get(':id')
  @RequirePermissions(PermissionKey.PLANS_READ)
  @ApiOperation({ summary: 'Get subscription plan details' })
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ) {
    return this.plansService.findOne(tenant.id, id);
  }

  @Post()
  @RequirePermissions(PermissionKey.PLANS_CREATE)
  @ApiOperation({ summary: 'Create a new subscription plan (Admin only)' })
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() body: CreatePlanInput,
  ) {
    return this.plansService.create(tenant.id, body);
  }

  @Patch(':id')
  @RequirePermissions(PermissionKey.PLANS_UPDATE)
  @ApiOperation({ summary: 'Update a subscription plan (Admin only)' })
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.plansService.update(tenant.id, id, body);
  }
}
