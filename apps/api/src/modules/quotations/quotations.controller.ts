import { Inject, Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query, } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QuotationsService } from './quotations.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TenantContext } from '../../common/guards/tenant.guard';
import {
  PermissionKey,
  CreateQuotationInput,
  QuotationStatus,
} from '@brightloop/contracts';

@ApiTags('Quotations')
@Controller('quotations')
export class QuotationsController {
  constructor(@Inject(QuotationsService) private readonly quotationsService: QuotationsService) {}

  @Get()
  @RequirePermissions(PermissionKey.QUOTATIONS_READ)
  @ApiOperation({ summary: 'List all quotations' })
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: any,
    @Query('search') search?: string,
  ) {
    return this.quotationsService.findAll(tenant.id, tenant.role, user?.email, search);
  }

  @Get(':id')
  @RequirePermissions(PermissionKey.QUOTATIONS_READ)
  @ApiOperation({ summary: 'Get quotation details by ID' })
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.quotationsService.findOne(tenant.id, id, tenant.role, user?.email);
  }

  @Post()
  @RequirePermissions(PermissionKey.QUOTATIONS_CREATE)
  @ApiOperation({ summary: 'Create a new quotation' })
  async create(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser('id') userId: string,
    @Body() body: CreateQuotationInput,
  ) {
    return this.quotationsService.create(tenant.id, userId, body);
  }

  @Patch(':id/status')
  @RequirePermissions(PermissionKey.QUOTATIONS_UPDATE)
  @ApiOperation({ summary: 'Update quotation status (Confirm / Cancel)' })
  async updateStatus(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body('status') status: QuotationStatus,
  ) {
    return this.quotationsService.updateStatus(tenant.id, id, status);
  }

  @Post(':id/convert')
  @RequirePermissions(PermissionKey.QUOTATIONS_CONFIRM)
  @ApiOperation({ summary: 'Convert quotation into active subscription' })
  async convertToSubscription(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('planId') planId: string,
  ) {
    return this.quotationsService.convertToSubscription(tenant.id, userId, id, planId);
  }
}
