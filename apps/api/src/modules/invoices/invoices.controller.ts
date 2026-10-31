import { Inject, Controller,
  Get,
  Post,
  Patch,
  Param,
  Query, } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TenantContext } from '../../common/guards/tenant.guard';
import { PermissionKey } from '@brightloop/contracts';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(@Inject(InvoicesService) private readonly invoicesService: InvoicesService) {}

  @Get()
  @RequirePermissions(PermissionKey.INVOICES_READ)
  @ApiOperation({ summary: 'List all recurring & generated invoices' })
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.invoicesService.findAll(tenant.id, tenant.role, user?.email, status, search);
  }

  @Get(':id')
  @RequirePermissions(PermissionKey.INVOICES_READ)
  @ApiOperation({ summary: 'Get invoice details by ID' })
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.invoicesService.findOne(tenant.id, id, tenant.role, user?.email);
  }

  @Patch(':id/confirm')
  @RequirePermissions(PermissionKey.INVOICES_CONFIRM)
  @ApiOperation({ summary: 'Confirm a draft invoice' })
  async confirm(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ) {
    return this.invoicesService.confirm(tenant.id, id);
  }

  @Patch(':id/cancel')
  @RequirePermissions(PermissionKey.INVOICES_CANCEL)
  @ApiOperation({ summary: 'Cancel an invoice' })
  async cancel(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ) {
    return this.invoicesService.cancel(tenant.id, id);
  }

  @Post(':id/send')
  @RequirePermissions(PermissionKey.INVOICES_SEND)
  @ApiOperation({ summary: 'Send invoice to customer email' })
  async send(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ) {
    return this.invoicesService.send(tenant.id, id);
  }
}
