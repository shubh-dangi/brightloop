import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CreditCard,
  FileText,
  Receipt,
  Banknote,
  AlertCircle,
  Clock,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  Package,
  Layers,
  ShieldCheck,
  ExternalLink,
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
import { formatDate, formatCurrency } from '../../lib/utils';
import { Spinner } from '../../components/ui/spinner';

const LinearChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 text-xs shadow-xl backdrop-blur-md">
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
              ₹{entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const { user, currentOrganization, role, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const isCustomer = role === 'CUSTOMER';
  const isStaff = role === 'MEMBER' || role === 'STAFF';
  const isAdmin = role === 'ADMIN' || role === 'OWNER';

  const fetchDashboardData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get('/dashboard/summary');
      setData(res.data?.data);
    } catch {
      // Fallback demo operational data
      setData({
        stats: {
          totalCustomers: 3,
          activeSubscriptions: 2,
          quotationsPending: 1,
          invoicesDue: 1,
          invoicesOverdue: 0,
          paymentsCollectedThisMonth: 132.0,
          mrr: 232.0,
          systemHealth: '100% Operational',
        },
        charts: {
          trendData: [
            { month: 'May', revenue: 120, activity: 8 },
            { month: 'Jun', revenue: 240, activity: 14 },
            { month: 'Jul', revenue: 360, activity: 22 },
            { month: 'Aug', revenue: 480, activity: 28 },
            { month: 'Sep', revenue: 600, activity: 36 },
            { month: 'Oct', revenue: 748, activity: 45 },
          ],
          statusDistribution: [
            { name: 'Monthly Plan', value: 1, color: '#A5D8FF' },
            { name: 'Yearly Plan', value: 1, color: '#34D399' },
          ],
        },
        recentActivity: [
          {
            id: '1',
            action: 'payment:recorded',
            entity: 'Payment',
            user: 'Staff Member',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            action: 'quotation:confirmed',
            entity: 'Quotation',
            user: 'Staff Member',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
        recentNotifications: [
          {
            id: '1',
            title: 'Billing Cycle Dispatched',
            message: 'Automated recurring billing run completed for October.',
            type: 'SUCCESS',
            createdAt: new Date().toISOString(),
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const stats = data?.stats || {};
  const charts = data?.charts || {};

  // =========================================================================
  // VIEW 1: CUSTOMER SELF-SERVICE PORTAL DASHBOARD
  // =========================================================================
  if (isCustomer) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Customer Self-Service Portal"
          description={`Welcome back, ${user?.name || 'Customer'}. Manage your active subscriptions, review upcoming renewals, and download invoices.`}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                className="gap-1.5 cursor-pointer text-xs h-9"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/products')}
                className="gap-1.5 cursor-pointer text-xs h-9"
              >
                <Package className="h-4 w-4" />
                Browse Catalog
              </Button>
            </div>
          }
        />

        {/* Customer KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/80 bg-card p-4 hover:border-emerald-500/40 transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Active Subscriptions
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
                <CreditCard className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
                1
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">active service</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-500 font-mono">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Full SLA access active</span>
            </div>
          </Card>

          <Card className="border-border/80 bg-card p-4 hover:border-primary/40 transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Unpaid Invoices Due
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
                <Receipt className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
                0
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">due bills</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
              <span>Account in good standing</span>
            </div>
          </Card>

          <Card className="border-border/80 bg-card p-4 hover:border-primary/40 transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Total Realized Paid
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
                <Banknote className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-blue-500 tabular-nums">
                {formatCurrency(stats.totalRealizedPaid ?? stats.paymentsCollectedThisMonth ?? 1120)}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
              <span>Lifetime settlement history</span>
            </div>
          </Card>

          <Card className="border-border/80 bg-card p-4 hover:border-primary/40 transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Next Renewal Date
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-500">
                <Clock className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-lg font-bold tracking-tight text-foreground">
                30 Nov 2026
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
              <span>Auto-renewal active</span>
            </div>
          </Card>
        </div>

        {/* Quick Customer Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/subscriptions')}
            className="h-14 flex items-center justify-start gap-3 p-3 bg-card border-border/80 hover:bg-muted/40 cursor-pointer text-left"
          >
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <CreditCard className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold block text-foreground">My Subscriptions</span>
              <span className="text-[10px] text-muted-foreground truncate block">View active contracts</span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/invoices')}
            className="h-14 flex items-center justify-start gap-3 p-3 bg-card border-border/80 hover:bg-muted/40 cursor-pointer text-left"
          >
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Receipt className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold block text-foreground">My Invoices</span>
              <span className="text-[10px] text-muted-foreground truncate block">Receipts & billing</span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/plans')}
            className="h-14 flex items-center justify-start gap-3 p-3 bg-card border-border/80 hover:bg-muted/40 cursor-pointer text-left"
          >
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold block text-foreground">Available Plans</span>
              <span className="text-[10px] text-muted-foreground truncate block">Upgrade or switch</span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/payments')}
            className="h-14 flex items-center justify-start gap-3 p-3 bg-card border-border/80 hover:bg-muted/40 cursor-pointer text-left"
          >
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Banknote className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold block text-foreground">Payment History</span>
              <span className="text-[10px] text-muted-foreground truncate block">Verified settlements</span>
            </div>
          </Button>
        </div>

        {/* Customer Subscriptions & Invoices Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Subscriptions Card */}
          <Card className="border-border/80 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                  My Active Subscription
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Recurring service agreement details
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5 text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                ACTIVE
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/70 p-4 space-y-3 bg-background/40">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">Brightloop Enterprise SaaS</span>
                  <span className="font-mono text-sm font-bold text-primary">₹560.00 / mo</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Subscription Code:</span>
                    <span className="font-mono font-medium text-foreground">SUB-2026-0001</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Variant:</span>
                    <span className="font-medium text-foreground">Odoo Brand Edition (+₹560)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Billing Cadence:</span>
                    <span className="font-medium text-foreground">Monthly Recurring</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Auto-Bill Date:</span>
                    <span className="font-mono font-medium text-foreground">30 Nov 2026</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/50 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/subscriptions')}
                    className="text-xs h-7 text-primary hover:text-primary/80 gap-1 cursor-pointer"
                  >
                    Manage Subscription <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices Card */}
          <Card className="border-border/80 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                  Recent Billing Invoices
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Tax invoices and receipts for your account
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/invoices')}
                className="gap-1 text-xs h-7 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/60">
                <div className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-mono font-medium text-foreground">INV-2026-0001</p>
                    <p className="text-[11px] text-muted-foreground">Monthly Recurring Subscription</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-foreground">₹560.00</p>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                      PAID
                    </Badge>
                  </div>
                </div>
                <div className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-mono font-medium text-foreground">INV-2026-0002</p>
                    <p className="text-[11px] text-muted-foreground">Odoo Brand Edition Add-on</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-foreground">₹560.00</p>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                      PAID
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Self-Service Info Banner */}
        <div className="p-4 rounded-xl border border-border/80 bg-muted/20 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-foreground">Need to change your plan or payment method?</span>{' '}
            <span className="text-muted-foreground">
              You can explore our available subscription plans or request add-on modules at any time from your portal.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/plans')}
            className="ml-auto text-xs h-8 shrink-0 cursor-pointer"
          >
            Explore Plans
          </Button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: STAFF OPERATIONS DASHBOARD
  // =========================================================================
  if (isStaff) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Staff Operations Control Plane"
          description={`Commercial operational desk for ${currentOrganization?.name || 'Workspace'}. Manage quotes, subscriptions, and daily customer payments.`}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                className="gap-1.5 cursor-pointer text-xs h-9"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/quotations/new')}
                className="gap-1.5 cursor-pointer text-xs h-9"
              >
                <Plus className="h-4 w-4" />
                Create Quotation
              </Button>
            </div>
          }
        />

        {/* Staff Operations KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/80 bg-card p-4 hover:border-primary/40 transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Active Subscriptions
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <CreditCard className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {stats.activeSubscriptions ?? 2}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">contracts</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-500 font-mono">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Active billing pipeline</span>
            </div>
          </Card>

          <Card className="border-border/80 bg-card p-4 hover:border-primary/40 transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Customer Accounts
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
                <UserCheck className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {stats.totalCustomers ?? 3}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">registered</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
              <span>Customer billing directory</span>
            </div>
          </Card>

          <Card className="border-border/80 bg-card p-4 hover:border-primary/40 transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Due / Pending Invoices
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
                <Receipt className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-amber-500 tabular-nums">
                {stats.invoicesDue ?? 1}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">open invoices</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
              <span>Payment collection queue</span>
            </div>
          </Card>

          <Card className="border-border/80 bg-card p-4 hover:border-primary/40 transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Quotes Pending
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-500">
                <FileText className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {stats.quotationsPending ?? 1}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">pending offers</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
              <span>Ready for conversion</span>
            </div>
          </Card>
        </div>

        {/* Operational Actions Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/customers')}
            className="h-14 flex items-center justify-start gap-3 p-3 bg-card border-border/80 hover:bg-muted/40 cursor-pointer text-left"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserCheck className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold block text-foreground">Customers</span>
              <span className="text-[10px] text-muted-foreground truncate block">Manage directory</span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/quotations/new')}
            className="h-14 flex items-center justify-start gap-3 p-3 bg-card border-border/80 hover:bg-muted/40 cursor-pointer text-left"
          >
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold block text-foreground">New Quote</span>
              <span className="text-[10px] text-muted-foreground truncate block">Draft pricing offer</span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/payments')}
            className="h-14 flex items-center justify-start gap-3 p-3 bg-card border-border/80 hover:bg-muted/40 cursor-pointer text-left"
          >
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Banknote className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold block text-foreground">Record Payment</span>
              <span className="text-[10px] text-muted-foreground truncate block">Settle customer bill</span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/invoices')}
            className="h-14 flex items-center justify-start gap-3 p-3 bg-card border-border/80 hover:bg-muted/40 cursor-pointer text-left"
          >
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Receipt className="h-4 w-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold block text-foreground">Invoices</span>
              <span className="text-[10px] text-muted-foreground truncate block">Track settlements</span>
            </div>
          </Button>
        </div>

        {/* Recent Operations Log & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/80 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2.5">
              <div>
                <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                  Recent Operations Log
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Audit events across subscriptions and invoices
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/activity')}
                className="gap-1 text-xs h-7 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
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
                          OP
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
                  Billing Alerts & Notifications
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Automated recurring cycle triggers
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notifications')}
                className="gap-1 text-xs h-7 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {data?.recentNotifications?.length > 0 ? (
                  data.recentNotifications.map((notif: any) => (
                    <div key={notif.id} className="p-2.5 rounded-lg border border-border/70 bg-background/50 text-xs flex items-start gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">{notif.title}</p>
                        <p className="text-[11px] text-muted-foreground pt-0.5">{notif.message}</p>
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

  // =========================================================================
  // VIEW 3: EXECUTIVE ADMIN CONTROL PLANE
  // =========================================================================
  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Operations Control Plane"
        description={`Commercial and recurring revenue overview for ${currentOrganization?.name || 'Workspace'}. Executive metrics, subscriber counts, and cash realizations.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              className="gap-1.5 cursor-pointer text-xs h-9"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/quotations/new')}
              className="gap-1.5 cursor-pointer text-xs h-9"
            >
              <Plus className="h-4 w-4" />
              Create Quotation
            </Button>
          </div>
        }
      />

      {/* KPI Cards — Operational Domain Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Subscriptions */}
        <Card className="border-border/80 bg-card p-4 hover:border-primary/40 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Active Subscriptions
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <CreditCard className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {stats.activeSubscriptions ?? '—'}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">contracts</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-500 font-mono">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Recurring monthly pipeline</span>
          </div>
        </Card>

        {/* Total Customers */}
        <Card className="border-border/80 bg-card p-4 hover:border-primary/40 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Customer Accounts
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {stats.totalCustomers ?? '—'}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">registered</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <span>Primary billing directory</span>
          </div>
        </Card>

        {/* Invoices Due & Overdue */}
        <Card className="border-border/80 bg-card p-4 hover:border-primary/40 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Due / Overdue Invoices
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
              <Receipt className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-amber-500 tabular-nums">
              {stats.invoicesDue ?? 0}
            </span>
            {stats.invoicesOverdue > 0 && (
              <Badge variant="destructive" className="font-mono text-[10px] px-1 py-0">
                {stats.invoicesOverdue} Overdue
              </Badge>
            )}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <span>Requires settlement chasing</span>
          </div>
        </Card>

        {/* Monthly Collections / MRR */}
        <Card className="border-border/80 bg-card p-4 hover:border-primary/40 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Monthly Cash Realized
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
              <Banknote className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-emerald-500 tabular-nums">
              {formatCurrency(stats.paymentsCollectedThisMonth ?? 132)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <span>MRR Rate: {formatCurrency(stats.mrr ?? 232)}/mo</span>
          </div>
        </Card>
      </div>

      {/* Operational Quick Actions Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('/customers')}
          className="h-14 flex items-center justify-start gap-3 p-3 bg-card border-border/80 hover:bg-muted/40 cursor-pointer text-left"
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="truncate">
            <span className="text-xs font-semibold block text-foreground">Customers</span>
            <span className="text-[10px] text-muted-foreground truncate block">View & add accounts</span>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/quotations/new')}
          className="h-14 flex items-center justify-start gap-3 p-3 bg-card border-border/80 hover:bg-muted/40 cursor-pointer text-left"
        >
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <div className="truncate">
            <span className="text-xs font-semibold block text-foreground">New Quote</span>
            <span className="text-[10px] text-muted-foreground truncate block">Draft pricing offer</span>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/payments')}
          className="h-14 flex items-center justify-start gap-3 p-3 bg-card border-border/80 hover:bg-muted/40 cursor-pointer text-left"
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Banknote className="h-4 w-4" />
          </div>
          <div className="truncate">
            <span className="text-xs font-semibold block text-foreground">Record Payment</span>
            <span className="text-[10px] text-muted-foreground truncate block">Settle open bill</span>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/settings/team')}
          className="h-14 flex items-center justify-start gap-3 p-3 bg-card border-border/80 hover:bg-muted/40 cursor-pointer text-left"
        >
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div className="truncate">
            <span className="text-xs font-semibold block text-foreground">Team & Roles</span>
            <span className="text-[10px] text-muted-foreground truncate block">Manage staff access</span>
          </div>
        </Button>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/80 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                Recurring Revenue Inflow Trend
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Monthly subscription volume realization
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5">
              MRR Pace
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.trendData || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="linearPrimaryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A5D8FF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#A5D8FF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3C52" vertical={false} />
                  <XAxis dataKey="month" stroke="#778BA3" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#778BA3" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<LinearChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#A5D8FF" strokeWidth={2} fill="url(#linearPrimaryGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Cadence Distribution */}
        <Card className="border-border/80 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Subscription Cadence
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Active plan frequency allocation
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.statusDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
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
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-muted-foreground font-mono">{entry.name}:</span>
                  <span className="font-mono font-medium text-foreground">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/80 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2.5">
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                Recent Operations Log
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Audit events across subscriptions and invoices
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/activity')}
              className="gap-1 text-xs h-7 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
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
                        OP
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
                Billing Alerts & System Notifications
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Automated recurring cycle notifications
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notifications')}
              className="gap-1 text-xs h-7 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {data?.recentNotifications?.length > 0 ? (
                data.recentNotifications.map((notif: any) => (
                  <div key={notif.id} className="p-2.5 rounded-lg border border-border/70 bg-background/50 text-xs flex items-start gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{notif.title}</p>
                      <p className="text-[11px] text-muted-foreground pt-0.5">{notif.message}</p>
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
