import { Inject, Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query, } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TenantContext } from '../../common/guards/tenant.guard';
import {
  PermissionKey,
  CreateProductInput,
} from '@brightloop/contracts';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(@Inject(ProductsService) private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermissions(PermissionKey.PRODUCTS_READ)
  @ApiOperation({ summary: 'List all products in the workspace (Cost price masked for Staff)' })
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll(tenant.id, tenant.role, search);
  }

  @Get(':id')
  @RequirePermissions(PermissionKey.PRODUCTS_READ)
  @ApiOperation({ summary: 'Get product details by ID' })
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ) {
    return this.productsService.findOne(tenant.id, id, tenant.role);
  }

  @Post()
  @RequirePermissions(PermissionKey.PRODUCTS_CREATE)
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() body: CreateProductInput,
  ) {
    return this.productsService.create(tenant.id, body);
  }

  @Patch(':id')
  @RequirePermissions(PermissionKey.PRODUCTS_UPDATE)
  @ApiOperation({ summary: 'Update product details (Admin only)' })
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() body: Partial<CreateProductInput>,
  ) {
    return this.productsService.update(tenant.id, id, body);
  }
}
