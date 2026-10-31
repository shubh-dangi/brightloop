import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  RecordStatus,
  RecordPriority,
  CreateRecordInput,
  UpdateRecordInput,
  GenericRecordDto,
} from '@subpulse/contracts';

export interface RecordQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, query: RecordQueryParams) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: orgId, // Tenant isolation mandatory!
    };

    if (query.status) {
      where.status = query.status as RecordStatus;
    }

    if (query.priority) {
      where.priority = query.priority as RecordPriority;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [total, records] = await Promise.all([
      this.prisma.genericRecord.count({ where }),
      this.prisma.genericRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: records.map((r) => this.toDto(r)),
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

  async findOne(orgId: string, id: string): Promise<GenericRecordDto> {
    const record = await this.prisma.genericRecord.findFirst({
      where: {
        id,
        organizationId: orgId, // Tenant-scoped
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found in this organization`);
    }

    return this.toDto(record);
  }

  async create(
    orgId: string,
    userId: string,
    input: CreateRecordInput,
  ): Promise<GenericRecordDto> {
    const record = await this.prisma.genericRecord.create({
      data: {
        organizationId: orgId,
        createdById: userId,
        title: input.title,
        description: input.description,
        status: input.status || RecordStatus.DRAFT,
        priority: input.priority || RecordPriority.MEDIUM,
        category: input.category,
        tags: input.tags || [],
        metadata: (input.metadata as any) || {},
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Record activity
    await this.prisma.activityLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: 'record:created',
        entity: 'GenericRecord',
        entityId: record.id,
        details: { title: record.title, category: record.category },
      },
    });

    return this.toDto(record);
  }

  async update(
    orgId: string,
    userId: string,
    id: string,
    input: UpdateRecordInput,
  ): Promise<GenericRecordDto> {
    // Verify existence within tenant
    await this.findOne(orgId, id);

    const updated = await this.prisma.genericRecord.update({
      where: { id },
      data: {
        ...(input.title ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.priority ? { priority: input.priority } : {}),
        ...(input.category ? { category: input.category } : {}),
        ...(input.tags ? { tags: input.tags } : {}),
        ...(input.metadata !== undefined ? { metadata: input.metadata as any } : {}),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Record activity
    await this.prisma.activityLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: 'record:updated',
        entity: 'GenericRecord',
        entityId: id,
        details: { changes: Object.keys(input) },
      },
    });

    return this.toDto(updated);
  }

  async remove(orgId: string, userId: string, id: string): Promise<{ message: string }> {
    // Verify existence within tenant
    await this.findOne(orgId, id);

    await this.prisma.genericRecord.delete({
      where: { id },
    });

    // Record activity
    await this.prisma.activityLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: 'record:deleted',
        entity: 'GenericRecord',
        entityId: id,
      },
    });

    return { message: 'Record deleted successfully' };
  }

  async bulkDelete(
    orgId: string,
    userId: string,
    ids: string[],
  ): Promise<{ message: string; count: number }> {
    const result = await this.prisma.genericRecord.deleteMany({
      where: {
        id: { in: ids },
        organizationId: orgId, // Tenant isolation on bulk deletes
      },
    });

    await this.prisma.activityLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: 'records:bulk_deleted',
        entity: 'GenericRecord',
        details: { count: result.count, ids },
      },
    });

    return {
      message: `Successfully deleted ${result.count} record(s)`,
      count: result.count,
    };
  }

  private toDto(record: any): GenericRecordDto {
    return {
      id: record.id,
      organizationId: record.organizationId,
      title: record.title,
      description: record.description,
      status: record.status as RecordStatus,
      priority: record.priority as RecordPriority,
      category: record.category,
      tags: record.tags || [],
      metadata: record.metadata,
      createdById: record.createdById,
      creator: record.creator,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
