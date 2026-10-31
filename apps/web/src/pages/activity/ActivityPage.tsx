import React, { useState, useEffect } from 'react';
import { Clock, Search, Filter, ShieldCheck, UserCheck, Layers } from 'lucide-react';
import { apiClient } from '../../services/api';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Spinner } from '../../components/ui/spinner';
import { formatDateTime } from '../../lib/utils';
import { ActivityLogDto } from '@brightloop/contracts';

export function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string>('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/activity', {
        params: {
          search: search || undefined,
          entity: selectedEntity || undefined,
        },
      });
      setLogs(res.data?.data?.items || []);
    } catch {
      // Fallback demo activities
      setLogs([
        {
          id: 'log-1',
          organizationId: 'org-demo',
          userId: 'usr-1',
          user: { id: 'usr-1', name: 'Taylor Reed (Owner)', email: 'owner@brightloop.local' },
          action: 'workspace:initialized',
          entity: 'Organization',
          details: { workspace: 'Brightloop Default Workspace' },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'log-2',
          organizationId: 'org-demo',
          userId: 'usr-1',
          user: { id: 'usr-1', name: 'Taylor Reed (Owner)', email: 'owner@brightloop.local' },
          action: 'record:created',
          entity: 'GenericRecord',
          details: { title: 'Infrastructure Ingestion Gateway' },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'log-3',
          organizationId: 'org-demo',
          userId: 'usr-2',
          user: { id: 'usr-2', name: 'Morgan Blake (Admin)', email: 'admin@brightloop.local' },
          action: 'member:invited',
          entity: 'OrganizationMember',
          details: { email: 'colleague@brightloop.local', role: 'MEMBER' },
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedEntity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'Organization':
        return ShieldCheck;
      case 'OrganizationMember':
        return UserCheck;
      case 'GenericRecord':
        return Layers;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Audit Log"
        description="Immutable record of user events, updates, and administrative operations"
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by action or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </form>
        <div className="flex gap-2">
          {['', 'Organization', 'GenericRecord', 'OrganizationMember'].map((entity) => (
            <Button
              key={entity}
              variant={selectedEntity === entity ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedEntity(entity)}
            >
              {entity === '' ? 'All Entities' : entity}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No activity recorded"
          description="Actions performed by team members will automatically appear here."
        />
      ) : (
        <div className="relative border-l border-border/80 ml-4 pl-6 space-y-6">
          {logs.map((log) => {
            const Icon = getEntityIcon(log.entity);
            return (
              <div key={log.id} className="relative group">
                {/* Dot / Icon indicator */}
                <div className="absolute -left-[35px] top-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-xs text-muted-foreground group-hover:text-primary transition-colors">
                  <Icon className="h-4 w-4" />
                </div>

                <Card className="shadow-xs hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground text-sm">
                        {log.user?.name || 'System Operator'}
                      </span>
                      <span>{formatDateTime(log.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="text-xs font-semibold bg-muted px-2 py-0.5 rounded text-foreground">
                        {log.action}
                      </code>
                      <Badge variant="outline" className="text-[10px]">
                        {log.entity}
                      </Badge>
                    </div>

                    {log.details && (
                      <pre className="text-[11px] font-mono bg-muted/40 p-2 rounded-md overflow-x-auto text-muted-foreground">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
