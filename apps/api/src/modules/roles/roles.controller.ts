import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TenantContext } from '../../common/guards/tenant.guard';
import { PermissionKey } from '@brightloop/contracts';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions(PermissionKey.ROLES_MANAGE)
  @ApiOperation({ summary: 'List all roles with their assigned permissions' })
  async listRoles(@CurrentTenant() tenant: TenantContext) {
    return this.rolesService.listRoles(tenant.id);
  }

  @Get('permissions-matrix')
  @RequirePermissions(PermissionKey.ROLES_MANAGE)
  @ApiOperation({ summary: 'Get list of all system permissions' })
  async getPermissionsMatrix() {
    return this.rolesService.getPermissionsMatrix();
  }

  @Post()
  @RequirePermissions(PermissionKey.ROLES_MANAGE)
  @ApiOperation({ summary: 'Create a custom role for the workspace' })
  async createRole(
    @CurrentTenant() tenant: TenantContext,
    @Body() body: { name: string; description?: string; permissions: string[] },
  ) {
    return this.rolesService.createRole(tenant.id, body);
  }

  @Patch(':id')
  @RequirePermissions(PermissionKey.ROLES_MANAGE)
  @ApiOperation({ summary: 'Update a custom role' })
  async updateRole(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') roleId: string,
    @Body() body: { name?: string; description?: string; permissions?: string[] },
  ) {
    return this.rolesService.updateRole(tenant.id, roleId, body);
  }

  @Delete(':id')
  @RequirePermissions(PermissionKey.ROLES_MANAGE)
  @ApiOperation({ summary: 'Delete a custom role' })
  async deleteRole(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') roleId: string,
  ) {
    return this.rolesService.deleteRole(tenant.id, roleId);
  }
}
