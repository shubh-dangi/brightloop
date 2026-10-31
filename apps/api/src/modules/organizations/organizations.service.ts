import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MemberStatus, SystemRole } from '@unknown/contracts';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async getCurrent(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        settings: true,
        _count: {
          select: {
            members: true,
            records: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async updateSettings(orgId: string, data: any) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    if (data.name && data.name !== org.name) {
      await this.prisma.organization.update({
        where: { id: orgId },
        data: { name: data.name },
      });
    }

    return this.prisma.organizationSetting.upsert({
      where: { organizationId: orgId },
      create: {
        organizationId: orgId,
        displayName: data.displayName || data.name || org.name,
        supportEmail: data.supportEmail,
        timezone: data.timezone || 'UTC',
        dateFormat: data.dateFormat || 'YYYY-MM-DD',
        allowMemberInvites: data.allowMemberInvites ?? true,
        enforce2FA: data.enforce2FA ?? false,
      },
      update: {
        ...(data.displayName ? { displayName: data.displayName } : {}),
        ...(data.supportEmail !== undefined ? { supportEmail: data.supportEmail } : {}),
        ...(data.timezone ? { timezone: data.timezone } : {}),
        ...(data.dateFormat ? { dateFormat: data.dateFormat } : {}),
        ...(data.allowMemberInvites !== undefined ? { allowMemberInvites: data.allowMemberInvites } : {}),
        ...(data.enforce2FA !== undefined ? { enforce2FA: data.enforce2FA } : {}),
      },
    });
  }

  async getMembers(orgId: string) {
    const members = await this.prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            isSystem: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      user: m.user,
      roleId: m.roleId,
      roleName: m.role.name,
      status: m.status,
      joinedAt: m.joinedAt.toISOString(),
    }));
  }

  async inviteMember(
    orgId: string,
    inviterId: string,
    email: string,
    roleId?: string,
  ) {
    const normalizedEmail = email.toLowerCase().trim();

    // Find role or default to MEMBER
    let targetRoleId = roleId;
    if (!targetRoleId) {
      const defaultRole = await this.prisma.role.findFirst({
        where: {
          OR: [
            { organizationId: orgId, name: SystemRole.MEMBER },
            { name: SystemRole.MEMBER, isSystem: true },
          ],
        },
      });
      targetRoleId = defaultRole?.id;
    }

    if (!targetRoleId) {
      throw new BadRequestException('Role not found for invitation');
    }

    // Check if user already exists
    let user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Create user placeholder for invited member
      user = await this.prisma.user.create({
        data: {
          name: normalizedEmail.split('@')[0],
          email: normalizedEmail,
          passwordHash: 'INVITED_PENDING_ACTIVATION',
          isEmailVerified: false,
        },
      });
    }

    // Check if membership already exists
    const existingMember = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member or invited to this workspace');
    }

    const membership = await this.prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        userId: user.id,
        roleId: targetRoleId,
        status: 'INVITED',
      },
      include: {
        user: true,
        role: true,
      },
    });

    // Activity log
    await this.prisma.activityLog.create({
      data: {
        organizationId: orgId,
        userId: inviterId,
        action: 'member:invited',
        entity: 'OrganizationMember',
        entityId: membership.id,
        details: { email: normalizedEmail, role: membership.role.name },
      },
    });

    return membership;
  }

  async updateMemberRole(orgId: string, memberId: string, roleId: string) {
    const member = await this.prisma.organizationMember.findFirst({
      where: { id: memberId, organizationId: orgId },
      include: { role: true },
    });

    if (!member) {
      throw new NotFoundException('Organization member not found');
    }

    return this.prisma.organizationMember.update({
      where: { id: memberId },
      data: { roleId },
      include: { role: true, user: true },
    });
  }

  async removeMember(orgId: string, memberId: string, currentUserId: string) {
    const member = await this.prisma.organizationMember.findFirst({
      where: { id: memberId, organizationId: orgId },
      include: { role: true },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Protect last OWNER from being deleted
    if (member.role.name === SystemRole.OWNER) {
      const ownerCount = await this.prisma.organizationMember.count({
        where: {
          organizationId: orgId,
          role: { name: SystemRole.OWNER },
        },
      });

      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the last remaining Owner from the organization',
        );
      }
    }

    await this.prisma.organizationMember.delete({
      where: { id: memberId },
    });

    await this.prisma.activityLog.create({
      data: {
        organizationId: orgId,
        userId: currentUserId,
        action: 'member:removed',
        entity: 'OrganizationMember',
        entityId: memberId,
        details: { removedUserId: member.userId },
      },
    });

    return { message: 'Member removed successfully' };
  }

  async getRoles(orgId: string) {
    return this.prisma.role.findMany({
      where: {
        OR: [
          { organizationId: orgId },
          { isSystem: true, organizationId: null },
        ],
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
