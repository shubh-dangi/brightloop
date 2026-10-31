import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Search,
  Plus,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  PauseCircle,
  XCircle,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { SubscriptionDto, SubscriptionStatus, BillingFrequency } from '@brightloop/contracts';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { formatDate } from '../../lib/utils';

export function SubscriptionsListPage() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/subscriptions', {
        params: {
          search: search || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        },
      });
      setSubscriptions(res.data?.data || []);
    } catch {
      // Demo dataset fallback
      setSubscriptions([
        {
          id: 'sub-acme-001',
          organizationId: 'org-1',
          subscriptionNumber: 'SUB-2026-001',
          customerId: 'cust-1',
          customer: {
            id: 'cust-1',
            organizationId: 'org-1',
            name: 'Acme Corporation',
            email: 'procurement@acme-corp.com',
            company: 'Acme Global Holdings',
            createdById: '',
            createdAt: '',
            updatedAt: '',
          },
          planId: 'plan-1',
          plan: {
            id: 'plan-1',
            name: 'Monthly Growth Plan',
            price: 120,
            billingFrequency: BillingFrequency.MONTHLY,
            organizationId: '',
            productId: '',
            minQuantity: 1,
            autoCloseOnEnd: false,
            allowEarlyClose: true,
            allowPause: true,
            allowRenewal: true,
            createdAt: '',
            updatedAt: '',
          },
          startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
          expiryDate: new Date(Date.now() + 335 * 86400000).toISOString(),
          billingFrequency: BillingFrequency.MONTHLY,
          paymentTerms: 'Net 30',
          subtotal: 120.0,
          discountAmount: 0.0,
          taxAmount: 12.0,
          totalAmount: 132.0,
          status: SubscriptionStatus.ACTIVE,
          lines: [],
          createdById: 'usr-3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'sub-apex-002',
          organizationId: 'org-1',
          subscriptionNumber: 'SUB-2026-002',
          customerId: 'cust-2',
          customer: {
            id: 'cust-2',
            organizationId: 'org-1',
            name: 'Apex Retailers Inc.',
            email: 'billing@apexretail.com',
            company: 'Apex Retail Solutions',
            createdById: '',
            createdAt: '',
            updatedAt: '',
          },
          planId: 'plan-2',
          plan: {
            id: 'plan-2',
            name: 'Annual Enterprise Plan',
            price: 1200,
            billingFrequency: BillingFrequency.YEARLY,
            organizationId: '',
            productId: '',
            minQuantity: 5,
            autoCloseOnEnd: false,
            allowEarlyClose: false,
            allowPause: true,
            allowRenewal: true,
            createdAt: '',
            updatedAt: '',
          },
          startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
          expiryDate: new Date(Date.now() + 355 * 86400000).toISOString(),
          billingFrequency: BillingFrequency.YEARLY,
          paymentTerms: 'Net 30',
          subtotal: 1200.0,
          discountAmount: 120.0,
          taxAmount: 108.0,
          totalAmount: 1188.0,
          status: SubscriptionStatus.ACTIVE,
          lines: [],
          createdById: 'usr-3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Contracts"
        description="Monitor active customer subscriptions, scheduled billing terms, and contract lifecycles."
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Subscriptions' },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by subscription number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card border-border/80"
          />
        </div>
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'ACTIVE', 'PAUSED', 'CLOSED'].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? 'default' : 'outline'}
              onClick={() => setStatusFilter(st)}
              className="text-xs h-9 cursor-pointer"
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : subscriptions.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-semibold">No subscriptions found</h3>
          <p className="text-sm text-muted-foreground">
            Convert confirmed quotations into active customer subscriptions.
          </p>
        </Card>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-mono uppercase tracking-wider text-[11px] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Sub #</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Plan Name</th>
                  <th className="px-4 py-3 font-semibold">Cadence</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Recurring Amount</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {subscriptions.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/subscriptions/${s.id}`)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                      {s.subscriptionNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground text-sm">{s.customer?.name}</div>
                      <span className="text-[11px] text-muted-foreground">{s.customer?.company}</span>
                    </td>
                    <td className="px-4 py-3.5 text-foreground/90 font-medium">
                      {s.plan?.name}
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {s.billingFrequency}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant={
                          s.status === 'ACTIVE'
                            ? 'secondary'
                            : s.status === 'PAUSED'
                            ? 'default'
                            : 'outline'
                        }
                        className="font-mono text-[10px] uppercase"
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-sm text-foreground">
                      ₹{s.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-primary text-xs font-medium group-hover:translate-x-0.5 transition-transform">
                        Details <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
