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
import { Spinner } from '../../components/ui/spinner';
import { formatDate } from '../../lib/utils';

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
            { name: 'Active', value: 18, color: '#10b981' },
            { name: 'Draft', value: 4, color: '#f59e0b' },
            { name: 'Archived', value: 2, color: '#6b7280' },
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
            <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-500/10">
              Demo Data Mode
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => navigate('/records')} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New Record
          </Button>
        </div>
      </PageHeader>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Records
            </CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium">{stats.activeRecords ?? 0} active</span>
              <span>•</span>
              <span>{stats.draftRecords ?? 0} drafts</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Workspace Members
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers ?? 1}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active multi-tenant collaborators
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Critical Priority
            </CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriorityRecords ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires administrative attention
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Infrastructure Status
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.systemHealth || 'Healthy'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              PostgreSQL & API Operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Activity & Record Growth</CardTitle>
            <CardDescription>
              Cumulative volume and operational activity over the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={charts.trendData || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRecords" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="records"
                    name="Records"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRecords)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Status Breakdown</CardTitle>
            <CardDescription>Distribution of records across lifecycle stages</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.statusDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(charts.statusDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              {(charts.statusDistribution || []).map((entry: any) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground">{entry.name}:</span>
                  <span className="font-semibold">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Workspace Activity</CardTitle>
              <CardDescription>Audit timeline of actions performed in this organization</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/activity')}
              className="gap-1 text-xs"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentActivity?.length > 0 ? (
                data.recentActivity.map((item: any) => (
                  <div key={item.id} className="flex items-start gap-3 text-sm">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground mt-0.5">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 space-y-0.5 overflow-hidden">
                      <p className="font-medium text-foreground truncate">
                        <span className="text-primary font-semibold">{item.user}</span> performed{' '}
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.action}</code>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Notifications</CardTitle>
              <CardDescription>System alerts, security events, and updates</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notifications')}
              className="gap-1 text-xs"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.recentNotifications?.length > 0 ? (
                data.recentNotifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    className="flex items-start gap-3 rounded-lg border border-border/60 p-3 bg-card/60"
                  >
                    <Bell className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-sm font-medium text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{notif.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No new notifications</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
