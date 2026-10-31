import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TenantContext } from '../../common/guards/tenant.guard';
import {
  PermissionKey,
  CreateSubscriptionInput,
} from '@brightloop/contracts';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @RequirePermissions(PermissionKey.SUBSCRIPTIONS_READ)
  @ApiOperation({ summary: 'List all subscriptions' })
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.subscriptionsService.findAll(tenant.id, status, search);
  }

  @Get(':id')
  @RequirePermissions(PermissionKey.SUBSCRIPTIONS_READ)
  @ApiOperation({ summary: 'Get subscription details by ID' })
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ) {
    return this.subscriptionsService.findOne(tenant.id, id);
  }

  @Post()
  @RequirePermissions(PermissionKey.SUBSCRIPTIONS_CREATE)
  @ApiOperation({ summary: 'Create a new subscription' })
  async create(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser('id') userId: string,
    @Body() body: CreateSubscriptionInput,
  ) {
    return this.subscriptionsService.create(tenant.id, userId, body);
  }

  @Patch(':id/pause')
  @RequirePermissions(PermissionKey.SUBSCRIPTIONS_PAUSE)
  @ApiOperation({ summary: 'Pause subscription (if plan allows)' })
  async pause(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ) {
    return this.subscriptionsService.pause(tenant.id, id);
  }

  @Patch(':id/resume')
  @RequirePermissions(PermissionKey.SUBSCRIPTIONS_PAUSE)
  @ApiOperation({ summary: 'Resume subscription' })
  async resume(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ) {
    return this.subscriptionsService.resume(tenant.id, id);
  }

  @Patch(':id/close')
  @RequirePermissions(PermissionKey.SUBSCRIPTIONS_CLOSE)
  @ApiOperation({ summary: 'Close subscription (if plan allows early close)' })
  async close(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ) {
    return this.subscriptionsService.close(tenant.id, id);
  }

  @Patch(':id/renew')
  @RequirePermissions(PermissionKey.SUBSCRIPTIONS_RENEW)
  @ApiOperation({ summary: 'Renew subscription for next cycle' })
  async renew(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ) {
    return this.subscriptionsService.renew(tenant.id, id);
  }
}
