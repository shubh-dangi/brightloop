import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface ActivityQueryParams {
  page?: number;
  limit?: number;
  entity?: string;
  search?: string;
}

@Injectable()
export class ActivityService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async findAll(orgId: string, query: ActivityQueryParams) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: orgId,
    };

    if (query.entity) {
      where.entity = query.entity;
    }

    if (query.search) {
      where.OR = [
        { action: { contains: query.search, mode: 'insensitive' } },
        { entity: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.activityLog.count({ where }),
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: items.map((a) => ({
        id: a.id,
        organizationId: a.organizationId,
        userId: a.userId,
        user: a.user,
        action: a.action,
        entity: a.entity,
        entityId: a.entityId,
        details: a.details,
        createdAt: a.createdAt.toISOString(),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
