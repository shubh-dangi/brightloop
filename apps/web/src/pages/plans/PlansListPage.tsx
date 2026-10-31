import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  CreditCard,
  PauseCircle,
  RotateCw,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { PlanDto, BillingFrequency } from '@brightloop/contracts';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';

export function PlansListPage() {
  const { role } = useAuthStore();
  const [plans, setPlans] = useState<PlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const isStaff = role === 'MEMBER' || role === 'VIEWER';

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/plans');
        setPlans(res.data?.data || []);
      } catch {
        // Fallback demo plans
        setPlans([
          {
            id: 'plan-monthly-growth-001',
            organizationId: 'org-1',
            productId: 'prod-1',
            name: 'Monthly Growth Plan',
            price: 120.0,
            billingFrequency: BillingFrequency.MONTHLY,
            minQuantity: 1,
            autoCloseOnEnd: false,
            allowEarlyClose: true,
            allowPause: true,
            allowRenewal: true,
            product: {
              id: 'prod-1',
              organizationId: 'org-1',
              name: 'Brightloop Business Software',
              type: 'Software Subscription',
              salesPrice: 120.0,
              variants: [],
              createdAt: '',
              updatedAt: '',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'plan-annual-enterprise-002',
            organizationId: 'org-1',
            productId: 'prod-1',
            name: 'Annual Enterprise Plan',
            price: 1200.0,
            billingFrequency: BillingFrequency.YEARLY,
            minQuantity: 5,
            autoCloseOnEnd: false,
            allowEarlyClose: false,
            allowPause: true,
            allowRenewal: true,
            product: {
              id: 'prod-1',
              organizationId: 'org-1',
              name: 'Brightloop Business Software',
              type: 'Software Subscription',
              salesPrice: 120.0,
              variants: [],
              createdAt: '',
              updatedAt: '',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'plan-daily-metered-003',
            organizationId: 'org-1',
            productId: 'prod-2',
            name: 'Daily Metered Storage Archive',
            price: 1.5,
            billingFrequency: BillingFrequency.DAILY,
            minQuantity: 1,
            autoCloseOnEnd: true,
            allowEarlyClose: true,
            allowPause: false,
            allowRenewal: false,
            product: {
              id: 'prod-2',
              organizationId: 'org-1',
              name: 'Cloud Storage & Archive Add-on',
              type: 'Add-on',
              salesPrice: 25.0,
              variants: [],
              createdAt: '',
              updatedAt: '',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Plans"
        description="Review billing frequencies (daily, weekly, monthly, yearly) and plan lifecycle behaviour policies."
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Subscription Plans' },
        ]}
        actions={
          isStaff ? (
            <Badge variant="outline" className="font-mono text-xs gap-1.5 py-1 px-2.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Staff View (Read-Only)
            </Badge>
          ) : (
            <Button className="gap-2 cursor-pointer">
              <Plus className="h-4 w-4" /> Create Plan
            </Button>
          )
        }
      />

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <Card key={plan.id} className="border-border shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="secondary" className="font-mono uppercase text-[10px]">
                    {plan.billingFrequency}
                  </Badge>
                  <span className="font-mono font-bold text-lg text-foreground">
                    ${plan.price.toFixed(2)}
                    <span className="text-xs text-muted-foreground font-normal">
                      /{plan.billingFrequency.toLowerCase()}
                    </span>
                  </span>
                </div>
                <CardTitle className="text-base text-foreground font-semibold">{plan.name}</CardTitle>
                <CardDescription className="text-xs">{plan.product?.name}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-2 text-xs border-t border-border/60">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Minimum Seats / Qty</span>
                  <span className="font-mono font-bold text-foreground">{plan.minQuantity} unit(s)</span>
                </div>

                {/* Plan Behaviour Badges (As detailed in PDF Page 3) */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-mono font-semibold text-muted-foreground block">
                    Lifecycle Policies
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {plan.allowPause ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span>Pause allowed</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {plan.allowEarlyClose ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span>Early close</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {plan.allowRenewal ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span>Auto-renew</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {plan.autoCloseOnEnd ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span>Auto-close end</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
