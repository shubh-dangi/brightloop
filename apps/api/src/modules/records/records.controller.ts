import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecordsService, RecordQueryParams } from './records.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TenantContext } from '../../common/guards/tenant.guard';
import {
  PermissionKey,
  CreateRecordInput,
  UpdateRecordInput,
} from '@unknown/contracts';

@ApiTags('Records (Generic SaaS CRUD)')
@ApiBearerAuth()
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  @RequirePermissions(PermissionKey.RECORDS_READ)
  @ApiOperation({ summary: 'List records with pagination, filtering, search, and sorting' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: RecordQueryParams,
  ) {
    return this.recordsService.findAll(tenant.id, query);
  }

  @Get(':id')
  @RequirePermissions(PermissionKey.RECORDS_READ)
  @ApiOperation({ summary: 'Get a single record by ID' })
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ) {
    return this.recordsService.findOne(tenant.id, id);
  }

  @Post()
  @RequirePermissions(PermissionKey.RECORDS_CREATE)
  @ApiOperation({ summary: 'Create a new record' })
  async create(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser('id') userId: string,
    @Body() input: CreateRecordInput,
  ) {
    return this.recordsService.create(tenant.id, userId, input);
  }

  @Patch(':id')
  @RequirePermissions(PermissionKey.RECORDS_UPDATE)
  @ApiOperation({ summary: 'Update an existing record' })
  async update(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() input: UpdateRecordInput,
  ) {
    return this.recordsService.update(tenant.id, userId, id, input);
  }

  @Delete(':id')
  @RequirePermissions(PermissionKey.RECORDS_DELETE)
  @ApiOperation({ summary: 'Delete a record by ID' })
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.recordsService.remove(tenant.id, userId, id);
  }

  @Post('bulk-delete')
  @RequirePermissions(PermissionKey.RECORDS_DELETE)
  @ApiOperation({ summary: 'Bulk delete records by IDs' })
  async bulkDelete(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser('id') userId: string,
    @Body('ids') ids: string[],
  ) {
    return this.recordsService.bulkDelete(tenant.id, userId, ids);
  }
}
