import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TenantContext } from '../../common/guards/tenant.guard';
import { SystemRole, PermissionKey } from '@unknown/contracts';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current organization details & settings' })
  async getCurrent(@CurrentTenant() tenant: TenantContext) {
    return this.orgsService.getCurrent(tenant.id);
  }

  @Patch('settings')
  @RequirePermissions(PermissionKey.SETTINGS_UPDATE)
  @ApiOperation({ summary: 'Update organization settings' })
  async updateSettings(
    @CurrentTenant() tenant: TenantContext,
    @Body() body: any,
  ) {
    return this.orgsService.updateSettings(tenant.id, body);
  }

  @Get('members')
  @RequirePermissions(PermissionKey.MEMBERS_READ)
  @ApiOperation({ summary: 'List all members in the current organization' })
  async getMembers(@CurrentTenant() tenant: TenantContext) {
    return this.orgsService.getMembers(tenant.id);
  }

  @Post('members/invite')
  @RequirePermissions(PermissionKey.MEMBERS_INVITE)
  @ApiOperation({ summary: 'Invite a new member to the organization' })
  async inviteMember(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser('id') userId: string,
    @Body() body: { email: string; roleId?: string },
  ) {
    return this.orgsService.inviteMember(
      tenant.id,
      userId,
      body.email,
      body.roleId,
    );
  }

  @Patch('members/:id/role')
  @RequirePermissions(PermissionKey.MEMBERS_UPDATE)
  @ApiOperation({ summary: 'Update member role in the organization' })
  async updateMemberRole(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') memberId: string,
    @Body() body: { roleId: string },
  ) {
    return this.orgsService.updateMemberRole(tenant.id, memberId, body.roleId);
  }

  @Delete('members/:id')
  @RequirePermissions(PermissionKey.MEMBERS_REMOVE)
  @ApiOperation({ summary: 'Remove a member from the organization' })
  async removeMember(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser('id') currentUserId: string,
    @Param('id') memberId: string,
  ) {
    return this.orgsService.removeMember(tenant.id, memberId, currentUserId);
  }

  @Get('roles')
  @RequirePermissions(PermissionKey.ROLES_MANAGE)
  @ApiOperation({ summary: 'List roles available in organization' })
  async getRoles(@CurrentTenant() tenant: TenantContext) {
    return this.orgsService.getRoles(tenant.id);
  }
}
