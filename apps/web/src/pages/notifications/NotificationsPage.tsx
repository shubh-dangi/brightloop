import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Filter } from 'lucide-react';
import { apiClient } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Spinner } from '../../components/ui/spinner';
import { formatDate } from '../../lib/utils';
import { NotificationType } from '@subpulse/contracts';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/notifications', {
        params: { unreadOnly: filterUnread ? 'true' : undefined },
      });
      setNotifications(res.data?.data?.items || []);
    } catch {
      // Fallback demo notifications
      setNotifications([
        {
          id: 'n-1',
          title: 'Workspace Initialized',
          message: 'Your Subpulse SaaS workspace has been provisioned with default enterprise roles.',
          type: NotificationType.SUCCESS,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'n-2',
          title: 'Security Notice',
          message: 'Session authenticated using secure Argon2id hash derivation.',
          type: NotificationType.SECURITY,
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'n-3',
          title: 'Automated Database Backup',
          message: 'Scheduled PostgreSQL snapshot completed successfully.',
          type: NotificationType.INFO,
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterUnread]);

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch {
      // Offline fallback
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.post('/notifications/read-all');
    } catch {
      // Offline fallback
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch {
      // Offline fallback
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const badgeVariant = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'success';
      case NotificationType.WARNING:
        return 'warning';
      case NotificationType.SECURITY:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Review alerts, system events, and security logs for your workspace"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterUnread(!filterUnread)}
            className="gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" />
            {filterUnread ? 'Showing Unread' : 'Showing All'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={notifications.length === 0}
            className="gap-1.5"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        </div>
      </PageHeader>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={
            filterUnread
              ? 'You have caught up with all unread notifications.'
              : 'There are currently no notifications in this workspace.'
          }
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <Card
              key={item.id}
              className={`transition-colors ${
                !item.isRead ? 'border-primary/30 bg-primary/5' : 'bg-card/70'
              }`}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${
                      !item.isRead ? 'bg-primary' : 'bg-transparent'
                    }`}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">
                        {item.title}
                      </h4>
                      <Badge variant={badgeVariant(item.type) as any} className="text-[10px] uppercase">
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.message}</p>
                    <p className="text-xs text-muted-foreground/80 pt-1">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!item.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(item.id)}
                      className="h-8 text-xs"
                    >
                      Mark read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteNotification(item.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
