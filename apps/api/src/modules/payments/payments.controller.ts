import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TenantContext } from '../../common/guards/tenant.guard';
import {
  PermissionKey,
  RecordPaymentInput,
} from '@brightloop/contracts';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @RequirePermissions(PermissionKey.PAYMENTS_READ)
  @ApiOperation({ summary: 'List all recorded payments' })
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: any,
    @Query('search') search?: string,
  ) {
    return this.paymentsService.findAll(tenant.id, tenant.role, user?.email, search);
  }

  @Get(':id')
  @RequirePermissions(PermissionKey.PAYMENTS_READ)
  @ApiOperation({ summary: 'Get payment details by ID' })
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.paymentsService.findOne(tenant.id, id, tenant.role, user?.email);
  }

  @Post()
  @RequirePermissions(PermissionKey.PAYMENTS_RECORD)
  @ApiOperation({ summary: 'Record an incoming customer payment against an invoice' })
  async record(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser('id') userId: string,
    @Body() body: RecordPaymentInput,
  ) {
    return this.paymentsService.record(tenant.id, userId, body);
  }
}
