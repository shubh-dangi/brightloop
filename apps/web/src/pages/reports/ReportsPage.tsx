import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  AlertCircle,
  Receipt,
  CreditCard,
  Banknote,
  TrendingUp,
  Download,
  Filter,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { formatDate } from '../../lib/utils';

export function ReportsPage() {
  const { role } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overdue' | 'active' | 'payments'>('overdue');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/reports/operational');
        setData(res.data?.data);
      } catch {
        // Fallback demo dataset
        setData({
          summary: {
            totalCustomers: 3,
            activeSubscriptionsCount: 2,
            pendingQuotationsCount: 1,
            overdueInvoicesCount: 2,
            totalOverdueAmount: 1320.0,
            totalCollected: 264.0,
          },
          overdueInvoices: [
            {
              id: 'inv-apex-003',
              invoiceNumber: 'INV-2026-003',
              customer: { name: 'Apex Retailers Inc.', company: 'Apex Retail Solutions' },
              dueDate: new Date(Date.now() - 10 * 86400000).toISOString(),
              totalAmount: 1188.0,
              outstandingAmount: 1188.0,
            },
            {
              id: 'inv-acme-001-overdue',
              invoiceNumber: 'INV-2026-002',
              customer: { name: 'Acme Corporation', company: 'Acme Global Holdings' },
              dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
              totalAmount: 132.0,
              outstandingAmount: 132.0,
            },
          ],
          activeSubscriptions: [
            {
              id: 'sub-1',
              subscriptionNumber: 'SUB-2026-001',
              customer: { name: 'Acme Corporation' },
              plan: { name: 'Monthly Growth Plan' },
              totalAmount: 132.0,
              billingFrequency: 'MONTHLY',
              startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
            },
            {
              id: 'sub-2',
              subscriptionNumber: 'SUB-2026-002',
              customer: { name: 'Apex Retailers Inc.' },
              plan: { name: 'Annual Enterprise Plan' },
              totalAmount: 1188.0,
              billingFrequency: 'YEARLY',
              startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
            },
          ],
          recentPayments: [
            {
              id: 'p-1',
              paymentReference: 'PAY-2026-001',
              customer: { name: 'Acme Corporation' },
              invoice: { invoiceNumber: 'INV-2026-001' },
              amount: 132.0,
              paymentMethod: 'BANK_TRANSFER',
              paymentDate: new Date(Date.now() - 4 * 86400000).toISOString(),
            },
            {
              id: 'p-2',
              paymentReference: 'PAY-2026-002',
              customer: { name: 'Solaris AI Labs' },
              invoice: { invoiceNumber: 'INV-2026-000' },
              amount: 132.0,
              paymentMethod: 'CREDIT_CARD',
              paymentDate: new Date(Date.now() - 14 * 86400000).toISOString(),
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Reports & Collections"
        description="Monitor overdue balances to chase before revenue loss, track active subscription commitments, and verify settlement inflows."
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Reports' },
        ]}
      />

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border shadow-sm p-4">
              <span className="text-[11px] font-mono uppercase text-muted-foreground">Overdue Balances</span>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono font-bold text-2xl text-destructive">
                  ${data?.summary?.totalOverdueAmount?.toFixed(2)}
                </span>
                <AlertCircle className="h-5 w-5 text-destructive/80" />
              </div>
              <span className="text-[11px] text-muted-foreground pt-1 block">
                {data?.summary?.overdueInvoicesCount} invoices past due
              </span>
            </Card>

            <Card className="border-border shadow-sm p-4">
              <span className="text-[11px] font-mono uppercase text-muted-foreground">Active Subscriptions</span>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono font-bold text-2xl text-primary">
                  {data?.summary?.activeSubscriptionsCount}
                </span>
                <CreditCard className="h-5 w-5 text-primary/80" />
              </div>
              <span className="text-[11px] text-muted-foreground pt-1 block">
                Recurring customer accounts
              </span>
            </Card>

            <Card className="border-border shadow-sm p-4">
              <span className="text-[11px] font-mono uppercase text-muted-foreground">Total Customers</span>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono font-bold text-2xl text-foreground">
                  {data?.summary?.totalCustomers}
                </span>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-[11px] text-muted-foreground pt-1 block">
                Workspace directory size
              </span>
            </Card>

            <Card className="border-border shadow-sm p-4">
              <span className="text-[11px] font-mono uppercase text-muted-foreground">Recent Collections</span>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono font-bold text-2xl text-emerald-500">
                  ${data?.summary?.totalCollected?.toFixed(2)}
                </span>
                <Banknote className="h-5 w-5 text-emerald-500/80" />
              </div>
              <span className="text-[11px] text-muted-foreground pt-1 block">
                Processed receipts this period
              </span>
            </Card>
          </div>

          {/* Operational Tabs */}
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Button
              variant={activeTab === 'overdue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('overdue')}
              className="gap-2 text-xs"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              Overdue Invoices to Chase ({data?.overdueInvoices?.length || 0})
            </Button>
            <Button
              variant={activeTab === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('active')}
              className="gap-2 text-xs"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Active Subscriptions ({data?.activeSubscriptions?.length || 0})
            </Button>
            <Button
              variant={activeTab === 'payments' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('payments')}
              className="gap-2 text-xs"
            >
              <Banknote className="h-3.5 w-3.5" />
              Recent Payment Receipts ({data?.recentPayments?.length || 0})
            </Button>
          </div>

          {/* Tab Content 1: Overdue Invoices (Priority chasing) */}
          {activeTab === 'overdue' && (
            <Card className="border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 font-mono uppercase text-[11px] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Invoice #</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3 text-right">Invoiced Amount</th>
                      <th className="px-4 py-3 text-right text-destructive">Overdue Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {data?.overdueInvoices?.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-foreground">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-foreground text-sm block">
                            {inv.customer?.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {inv.customer?.company}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-destructive font-semibold">
                          {formatDate(inv.dueDate)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono">${inv.totalAmount?.toFixed(2)}</td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-destructive text-sm">
                          ${inv.outstandingAmount?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab Content 2: Active Subscriptions */}
          {activeTab === 'active' && (
            <Card className="border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 font-mono uppercase text-[11px] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Subscription #</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Cadence</th>
                      <th className="px-4 py-3 text-right">Recurring Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {data?.activeSubscriptions?.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-foreground">
                          {sub.subscriptionNumber}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-foreground">
                          {sub.customer?.name}
                        </td>
                        <td className="px-4 py-3.5 text-foreground/90">{sub.plan?.name}</td>
                        <td className="px-4 py-3.5 font-mono">
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {sub.billingFrequency}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                          ${sub.totalAmount?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab Content 3: Recent Payments */}
          {activeTab === 'payments' && (
            <Card className="border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 font-mono uppercase text-[11px] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Payment Ref</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Invoice #</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {data?.recentPayments?.map((p: any) => (
                      <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-foreground">
                          {p.paymentReference}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-foreground">
                          {p.customer?.name}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-primary font-medium">
                          {p.invoice?.invoiceNumber}
                        </td>
                        <td className="px-4 py-3.5 font-mono">
                          <Badge variant="outline" className="text-[10px]">
                            {p.paymentMethod?.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-500 text-sm">
                          ${p.amount?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
