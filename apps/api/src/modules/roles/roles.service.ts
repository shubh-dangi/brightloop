import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async listRoles(orgId: string) {
    const roles = await this.prisma.role.findMany({
      where: {
        OR: [{ organizationId: orgId }, { isSystem: true }],
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      memberCount: role._count.members,
      permissions: role.permissions.map((rp) => rp.permission.key),
      createdAt: role.createdAt.toISOString(),
    }));
  }

  async getPermissionsMatrix() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { key: 'asc' }],
    });
  }

  async createRole(
    orgId: string,
    data: { name: string; description?: string; permissions: string[] },
  ) {
    const existing = await this.prisma.role.findFirst({
      where: { organizationId: orgId, name: data.name },
    });

    if (existing) {
      throw new BadRequestException('A role with this name already exists in this workspace');
    }

    return this.prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          organizationId: orgId,
          name: data.name,
          description: data.description,
          isSystem: false,
        },
      });

      if (data.permissions && data.permissions.length > 0) {
        const perms = await tx.permission.findMany({
          where: { key: { in: data.permissions } },
        });

        await tx.rolePermission.createMany({
          data: perms.map((p) => ({
            roleId: role.id,
            permissionId: p.id,
          })),
        });
      }

      return role;
    });
  }

  async updateRole(
    orgId: string,
    roleId: string,
    data: { name?: string; description?: string; permissions?: string[] },
  ) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, organizationId: orgId },
    });

    if (!role) {
      throw new NotFoundException('Role not found or is a system immutable role');
    }

    if (role.isSystem) {
      throw new BadRequestException('Default system roles cannot be modified');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.role.update({
        where: { id: roleId },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
        },
      });

      if (data.permissions !== undefined) {
        await tx.rolePermission.deleteMany({
          where: { roleId },
        });

        if (data.permissions.length > 0) {
          const perms = await tx.permission.findMany({
            where: { key: { in: data.permissions } },
          });

          await tx.rolePermission.createMany({
            data: perms.map((p) => ({
              roleId,
              permissionId: p.id,
            })),
          });
        }
      }

      return updated;
    });
  }

  async deleteRole(orgId: string, roleId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, organizationId: orgId },
      include: { _count: { select: { members: true } } },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted');
    }

    if (role._count.members > 0) {
      throw new BadRequestException(
        `Cannot delete role while ${role._count.members} member(s) are assigned to it`,
      );
    }

    await this.prisma.role.delete({
      where: { id: roleId },
    });

    return { message: 'Role deleted successfully' };
  }
}
