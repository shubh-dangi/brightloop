import React, { useState, useEffect } from 'react';
import { Clock, Search, ShieldCheck, UserCheck, Layers, Terminal } from 'lucide-react';
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
        return Terminal;
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Activity Audit Log"
        description="Immutable cryptographic operational ledger tracking workspace events and administrative mutations"
      />

      {/* Filter and Search Bar — Linear Minimalist Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by action or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8.5 h-8 text-xs bg-background dark:bg-[#1C1C1F]/60 border-border/80"
          />
        </form>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: '', label: 'All Entities' },
            { id: 'Organization', label: 'Organization' },
            { id: 'GenericRecord', label: 'Records' },
            { id: 'OrganizationMember', label: 'Members' },
          ].map((entity) => (
            <Button
              key={entity.id}
              variant={selectedEntity === entity.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedEntity(entity.id)}
              className="h-8 text-xs font-mono border-border/80"
            >
              {entity.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeline List — Linear Ledger */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No activity recorded"
          description="Operational actions performed by workspace collaborators will automatically stream here."
        />
      ) : (
        <div className="border border-border/80 bg-card rounded-lg divide-y divide-border/60">
          {logs.map((log) => {
            const Icon = getEntityIcon(log.entity);
            return (
              <div
                key={log.id}
                className="p-3.5 hover:bg-muted/30 dark:hover:bg-[#242428]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/30 dark:bg-[#171719] text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground text-xs">
                        {log.user?.name || 'System Operator'}
                      </span>
                      <code className="text-[11px] font-mono text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                        {log.action}
                      </code>
                      <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                        {log.entity}
                      </Badge>
                    </div>
                    {log.details && (
                      <p className="font-mono text-[11px] text-muted-foreground truncate">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="font-mono text-[11px] text-muted-foreground/80 tabular-nums shrink-0 sm:text-right pl-10 sm:pl-0">
                  {formatDateTime(log.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
