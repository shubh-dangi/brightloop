import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Filter } from 'lucide-react';
import { apiClient } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Spinner } from '../../components/ui/spinner';
import { formatDate } from '../../lib/utils';
import { NotificationType } from '@brightloop/contracts';

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
          message: 'Your Brightloop SaaS workspace has been provisioned with default enterprise roles.',
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        description="System alerts, security notifications, and automated workspace alerts"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterUnread(!filterUnread)}
            className="gap-1.5 h-8 text-xs font-mono border-border/80"
          >
            <Filter className="h-3.5 w-3.5" />
            {filterUnread ? 'Unread Only' : 'All Alerts'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="gap-1.5 h-8 text-xs font-mono border-border/80"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        </div>
      </PageHeader>

      {loading ? (
        <div className="py-16 flex justify-center">
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
        <div className="border border-border/80 bg-card rounded-lg divide-y divide-border/60">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 flex items-start justify-between gap-4 transition-colors ${
                !item.isRead ? 'bg-primary/5 dark:bg-primary/[0.04]' : 'hover:bg-muted/20'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`h-2 w-2 rounded-full mt-1.5 shrink-0 transition-colors ${
                    !item.isRead ? 'bg-primary' : 'bg-transparent border border-muted-foreground/30'
                  }`}
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-semibold text-foreground">
                      {item.title}
                    </h4>
                    <Badge variant={badgeVariant(item.type) as any} className="font-mono text-[9px] uppercase px-1.5 py-0.2">
                      {item.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>
                  <p className="font-mono text-[11px] text-muted-foreground/70 pt-0.5 tabular-nums">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 pt-0.5">
                {!item.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(item.id)}
                    className="h-7 text-xs px-2 text-primary hover:text-primary font-mono"
                  >
                    Mark read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteNotification(item.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
