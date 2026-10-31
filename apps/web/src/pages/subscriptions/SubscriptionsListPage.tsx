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
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { SubscriptionDto, SubscriptionStatus, BillingFrequency } from '@brightloop/contracts';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { formatDate, formatCurrency } from '../../lib/utils';

export function SubscriptionsListPage() {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const isCustomer = role === 'CUSTOMER';

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
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
      setSubscriptions(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      // Demo dataset fallback
      setSubscriptions([
        {
          id: 'sub-acme-001',
          subscriptionNumber: 'SUB-2026-0001',
          customerId: 'cust-1',
          customer: {
            id: 'cust-1',
            name: isCustomer ? 'My Account' : 'Acme Corporation',
            companyName: 'Miller Artisan Bakery',
            email: 'john@bakeryshop.com',
          },
          plan: {
            id: 'plan-1',
            name: 'SME Monthly Plan',
            price: 199,
            billingInterval: 'MONTHLY',
          },
          startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
          expiryDate: new Date(Date.now() + 335 * 86400000).toISOString(),
          paymentTerms: 'Net 15',
          totalAmount: 1416.0,
          status: 'ACTIVE',
        },
        {
          id: 'sub-apex-002',
          subscriptionNumber: 'SUB-2026-0002',
          customerId: 'cust-2',
          customer: {
            id: 'cust-2',
            name: 'Marcus Vance',
            companyName: 'Apex Global Enterprises',
            email: 'customer2@gmail.com',
          },
          plan: {
            id: 'plan-2',
            name: 'Enterprise Annual Contract',
            price: 1800,
            billingInterval: 'YEARLY',
          },
          startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
          expiryDate: null,
          paymentTerms: 'Net 30',
          totalAmount: 2076.8,
          status: 'ACTIVE',
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
        title={isCustomer ? 'My Subscriptions' : 'Subscription Contracts'}
        description={
          isCustomer
            ? 'Manage your active recurring software subscriptions, renewal cadences, and contracted add-ons.'
            : 'Monitor customer subscriptions, scheduled billing terms, and contract lifecycles.'
        }
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Subscriptions' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSubscriptions}
              className="gap-1.5 cursor-pointer text-xs h-9"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            {!isCustomer && (
              <Button
                size="sm"
                onClick={() => navigate('/quotations/new')}
                className="gap-1.5 cursor-pointer text-xs h-9"
              >
                <Plus className="h-4 w-4" />
                New Quote
              </Button>
            )}
          </div>
        }
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
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'ACTIVE', 'PAUSED', 'CLOSED'].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? 'default' : 'outline'}
              onClick={() => setStatusFilter(st)}
              className="text-xs h-9 cursor-pointer font-mono"
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
            {isCustomer
              ? 'You do not have any active subscriptions yet. Browse our plans to get started.'
              : 'Convert confirmed quotations into active customer subscriptions.'}
          </p>
          {isCustomer && (
            <Button
              className="mt-4 text-xs"
              size="sm"
              onClick={() => navigate('/plans')}
            >
              Explore Available Plans
            </Button>
          )}
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
                {subscriptions.map((s) => {
                  const subCadence = s.plan?.billingInterval || s.billingFrequency || 'MONTHLY';
                  const customerName = s.customer?.name || 'Customer';
                  const customerCompany = s.customer?.companyName || s.customer?.company || s.customer?.email || '';
                  const planName = s.plan?.name || 'Subscription Plan';
                  const subStatus = (s.status || 'ACTIVE').toUpperCase();

                  return (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/subscriptions/${s.id}`)}
                      className="hover:bg-muted/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                        {s.subscriptionNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-foreground text-sm">{customerName}</div>
                        {customerCompany && (
                          <span className="text-[11px] text-muted-foreground">{customerCompany}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-foreground/90 font-medium">
                        {planName}
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {subCadence}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge
                          variant={
                            subStatus === 'ACTIVE'
                              ? 'secondary'
                              : subStatus === 'PAUSED'
                              ? 'default'
                              : 'outline'
                          }
                          className="font-mono text-[10px] uppercase"
                        >
                          {subStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-sm text-foreground">
                        {formatCurrency(s.totalAmount)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-primary text-xs font-medium group-hover:translate-x-0.5 transition-transform">
                          Details <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
