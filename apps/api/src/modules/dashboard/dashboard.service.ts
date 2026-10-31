import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(orgId: string) {
    const [
      totalRecords,
      activeRecords,
      draftRecords,
      archivedRecords,
      highPriorityRecords,
      totalMembers,
      recentActivity,
      recentNotifications,
    ] = await Promise.all([
      this.prisma.genericRecord.count({ where: { organizationId: orgId } }),
      this.prisma.genericRecord.count({
        where: { organizationId: orgId, status: 'ACTIVE' },
      }),
      this.prisma.genericRecord.count({
        where: { organizationId: orgId, status: 'DRAFT' },
      }),
      this.prisma.genericRecord.count({
        where: { organizationId: orgId, status: 'ARCHIVED' },
      }),
      this.prisma.genericRecord.count({
        where: {
          organizationId: orgId,
          priority: { in: ['HIGH', 'CRITICAL'] },
        },
      }),
      this.prisma.organizationMember.count({
        where: { organizationId: orgId },
      }),
      this.prisma.activityLog.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.notification.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Trend chart data (simulated monthly aggregations based on live counts)
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const trendData = months.map((month, index) => {
      const multiplier = (index + 1) / months.length;
      return {
        month,
        records: Math.round(totalRecords * multiplier) || index * 3 + 2,
        activity: Math.round(15 * multiplier + index * 4) || 5,
      };
    });

    const statusDistribution = [
      { name: 'Active', value: activeRecords, color: '#10b981' },
      { name: 'Draft', value: draftRecords, color: '#f59e0b' },
      { name: 'Archived', value: archivedRecords, color: '#6b7280' },
    ];

    const priorityDistribution = [
      { name: 'High / Critical', value: highPriorityRecords, color: '#ef4444' },
      {
        name: 'Medium / Low',
        value: Math.max(0, totalRecords - highPriorityRecords),
        color: '#3b82f6',
      },
    ];

    return {
      stats: {
        totalRecords,
        activeRecords,
        draftRecords,
        archivedRecords,
        totalMembers,
        highPriorityRecords,
        systemHealth: '100% Operational',
      },
      charts: {
        trendData,
        statusDistribution,
        priorityDistribution,
      },
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        entity: a.entity,
        user: a.user?.name || 'System',
        createdAt: a.createdAt.toISOString(),
      })),
      recentNotifications: recentNotifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        createdAt: n.createdAt.toISOString(),
      })),
    };
  }
}
