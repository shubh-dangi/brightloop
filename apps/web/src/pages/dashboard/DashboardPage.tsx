import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpRight,
  Shield,
  Bell,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuthStore } from '../../stores/authStore';
import { apiClient } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { PageHeader } from '../../components/layout/PageHeader';
import { formatDate } from '../../lib/utils';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const LinearChartTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border/80 bg-[#1C1C1F] p-3 text-xs shadow-xl backdrop-blur-md">
        <p className="font-mono text-[11px] text-muted-foreground pb-1 border-b border-border/40 mb-1.5">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-foreground/80">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color || entry.stroke }}
              />
              {entry.name}:
            </span>
            <span className="font-mono font-medium text-foreground tabular-nums">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const { user, currentOrganization } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isDemoData, setIsDemoData] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/dashboard/summary');
      setData(res.data?.data);
      setIsDemoData(false);
    } catch {
      // Fallback demo dataset with rich statistics
      setIsDemoData(true);
      setData({
        stats: {
          totalRecords: 24,
          activeRecords: 18,
          draftRecords: 4,
          archivedRecords: 2,
          totalMembers: 3,
          highPriorityRecords: 5,
          systemHealth: '100% Operational',
        },
        charts: {
          trendData: [
            { month: 'May', records: 4, activity: 8 },
            { month: 'Jun', records: 9, activity: 14 },
            { month: 'Jul', records: 13, activity: 22 },
            { month: 'Aug', records: 17, activity: 28 },
            { month: 'Sep', records: 21, activity: 36 },
            { month: 'Oct', records: 24, activity: 45 },
          ],
          statusDistribution: [
            { name: 'Active', value: 18, color: '#22C55E' },
            { name: 'Draft', value: 4, color: '#F59E0B' },
            { name: 'Archived', value: 2, color: '#71717A' },
          ],
        },
        recentActivity: [
          {
            id: '1',
            action: 'record:created',
            entity: 'GenericRecord',
            user: 'Taylor Reed',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            action: 'member:invited',
            entity: 'OrganizationMember',
            user: 'Taylor Reed',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: '3',
            action: 'settings:updated',
            entity: 'Organization',
            user: 'Morgan Blake',
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          },
        ],
        recentNotifications: [
          {
            id: '1',
            title: 'Workspace Initialized',
            message: 'Default enterprise RBAC roles and policies active.',
            type: 'SUCCESS',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Security Notice',
            message: 'Session refreshed with cryptographic Argon2 validation.',
            type: 'SECURITY',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = data?.stats || {};
  const charts = data?.charts || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'User'}`}
        description={`Overview for ${currentOrganization?.name || 'Brightloop Workspace'} • ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      >
        <div className="flex items-center gap-2">
          {isDemoData && (
            <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10 font-mono text-[11px]">
              Demo Data Mode
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
            className="gap-1.5 h-8 text-xs border-border/80"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => navigate('/records')} className="gap-1.5 h-8 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New Record
          </Button>
        </div>
      </PageHeader>

      {/* Summary KPI Cards — Linear Minimalist Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 bg-card hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
            <CardTitle className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/80 font-medium">
              Total Records
            </CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-foreground">
              {stats.totalRecords ?? 0}
            </div>
            <p className="text-[11px] font-mono text-muted-foreground mt-1 flex items-center gap-1.5 tabular-nums">
              <span className="text-emerald-500 font-medium">{stats.activeRecords ?? 0} active</span>
              <span className="text-muted-foreground/40">•</span>
              <span>{stats.draftRecords ?? 0} drafts</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
            <CardTitle className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/80 font-medium">
              Collaborators
            </CardTitle>
            <Users className="h-4 w-4 text-primary/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-foreground">
              {stats.totalMembers ?? 1}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Active tenant members
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
            <CardTitle className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/80 font-medium">
              Critical Attention
            </CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-foreground">
              {stats.highPriorityRecords ?? 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              High-priority items
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
            <CardTitle className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/80 font-medium">
              Platform Status
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tracking-tight text-emerald-500">
              {stats.systemHealth || 'Healthy'}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              API & DB Operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts — Linear Styling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/80 bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                  Activity & Growth Trajectory
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Monthly volume and operational throughput over past 6 months
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-border/60 bg-muted/30 text-[11px] font-mono text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span>+32% MoM</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-68 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={charts.trendData || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="linearPrimaryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B7CF6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8B7CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
                  <XAxis
                    dataKey="month"
                    stroke="#92929B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#92929B', fontFamily: 'JetBrains Mono, monospace' }}
                  />
                  <YAxis
                    stroke="#92929B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#92929B', fontFamily: 'JetBrains Mono, monospace' }}
                  />
                  <RechartsTooltip content={<LinearChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="records"
                    name="Records"
                    stroke="#8B7CF6"
                    strokeWidth={1.75}
                    fillOpacity={1}
                    fill="url(#linearPrimaryGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Status Allocation
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Current state distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-50 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.statusDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {(charts.statusDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<LinearChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-3 text-xs">
              {(charts.statusDistribution || []).map((entry: any) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-muted-foreground font-mono">{entry.name}:</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Recent Notifications — Ledger Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/80 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2.5">
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                Recent Workspace Activity
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Audit events in this organization
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/activity')}
              className="gap-1 text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              View ledger <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {data?.recentActivity?.length > 0 ? (
                data.recentActivity.map((item: any) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-[10px] font-semibold">
                        {item.user?.slice(0, 2).toUpperCase() || 'OP'}
                      </div>
                      <div className="truncate">
                        <span className="font-medium text-foreground">{item.user}</span>{' '}
                        <code className="text-[11px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                          {item.action}
                        </code>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground shrink-0 tabular-nums">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center font-mono">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2.5">
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                Security & System Alerts
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Workspace event logs
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notifications')}
              className="gap-1 text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {data?.recentNotifications?.length > 0 ? (
                data.recentNotifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    className="flex items-start gap-2.5 rounded-md border border-border/70 p-2.5 bg-card/60 hover:bg-muted/20 transition-colors"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{notif.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{notif.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center font-mono">No new notifications</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
