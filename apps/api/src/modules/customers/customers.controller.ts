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
import { CustomersService } from './customers.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TenantContext } from '../../common/guards/tenant.guard';
import {
  PermissionKey,
  CreateCustomerInput,
  UpdateCustomerInput,
} from '@brightloop/contracts';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermissions(PermissionKey.CUSTOMERS_READ)
  @ApiOperation({ summary: 'List all customers in the workspace' })
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: any,
    @Query('search') search?: string,
  ) {
    return this.customersService.findAll(tenant.id, tenant.role, user?.email, search);
  }

  @Get(':id')
  @RequirePermissions(PermissionKey.CUSTOMERS_READ)
  @ApiOperation({ summary: 'Get customer details by ID' })
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.customersService.findOne(tenant.id, id, tenant.role, user?.email);
  }

  @Post()
  @RequirePermissions(PermissionKey.CUSTOMERS_CREATE)
  @ApiOperation({ summary: 'Add a new customer' })
  async create(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser('id') userId: string,
    @Body() body: CreateCustomerInput,
  ) {
    return this.customersService.create(tenant.id, userId, body);
  }

  @Patch(':id')
  @RequirePermissions(PermissionKey.CUSTOMERS_UPDATE)
  @ApiOperation({ summary: 'Update customer details' })
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() body: UpdateCustomerInput,
  ) {
    return this.customersService.update(tenant.id, id, body);
  }
}
