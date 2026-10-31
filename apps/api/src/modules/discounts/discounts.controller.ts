import {
  Controller,
  Get,
  Post,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TenantContext } from '../../common/guards/tenant.guard';
import {
  PermissionKey,
  CreateDiscountInput,
} from '@brightloop/contracts';

@ApiTags('Discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  @RequirePermissions(PermissionKey.DISCOUNTS_READ)
  @ApiOperation({ summary: 'List all discount rules in workspace' })
  async findAll(@CurrentTenant() tenant: TenantContext) {
    return this.discountsService.findAll(tenant.id);
  }

  @Get(':id')
  @RequirePermissions(PermissionKey.DISCOUNTS_READ)
  @ApiOperation({ summary: 'Get discount rule details' })
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ) {
    return this.discountsService.findOne(tenant.id, id);
  }

  @Post()
  @RequirePermissions(PermissionKey.DISCOUNTS_MANAGE)
  @ApiOperation({ summary: 'Create a new discount rule (Admin only)' })
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() body: CreateDiscountInput,
  ) {
    return this.discountsService.create(tenant.id, body);
  }

  @Post('validate')
  @RequirePermissions(PermissionKey.DISCOUNTS_APPLY)
  @ApiOperation({ summary: 'Validate discount code eligibility and calculate savings' })
  async validate(
    @CurrentTenant() tenant: TenantContext,
    @Body() body: { code: string; purchaseAmount: number; quantity: number },
  ) {
    return this.discountsService.validateAndCalculate(
      tenant.id,
      body.code,
      body.purchaseAmount,
      body.quantity,
    );
  }
}
