import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationType } from '@brightloop/contracts';

@Injectable()
export class NotificationsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async findAll(orgId: string, userId: string, unreadOnly?: boolean) {
    const where: any = {
      organizationId: orgId,
      OR: [{ userId }, { userId: null }],
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const items = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await this.prisma.notification.count({
      where: {
        organizationId: orgId,
        OR: [{ userId }, { userId: null }],
        isRead: false,
      },
    });

    return {
      items: items.map((n) => ({
        id: n.id,
        organizationId: n.organizationId,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type as NotificationType,
        isRead: n.isRead,
        link: n.link,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    };
  }

  async markAsRead(orgId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(orgId: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        organizationId: orgId,
        OR: [{ userId }, { userId: null }],
        isRead: false,
      },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  }

  async remove(orgId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return { message: 'Notification deleted' };
  }
}
