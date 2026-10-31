import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  Calendar,
  Building,
  Layers,
  PauseCircle,
  PlayCircle,
  XCircle,
  RotateCw,
  Receipt,
  FileText,
  Clock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { formatDate, formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';

export function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const isCustomer = role === 'CUSTOMER';

  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/subscriptions/${id}`);
      setSubscription(res.data?.data);
    } catch {
      // Fallback demo subscription
      setSubscription({
        id: id || 'sub-acme-001',
        subscriptionNumber: 'SUB-2026-0001',
        customer: {
          id: 'cust-1',
          name: 'John Miller',
          email: 'customer1@gmail.com',
          companyName: 'Miller Artisan Bakery',
        },
        plan: {
          id: 'plan-1',
          name: 'SME Monthly Plan',
          price: 199.0,
          billingInterval: 'MONTHLY',
        },
        startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
        expiryDate: null,
        nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        paymentTerms: 'Net 15',
        totalAmount: 1416.0,
        status: 'ACTIVE',
        lines: [
          {
            id: 'sl-1',
            quantity: 1,
            unitPrice: 1200.0,
            taxRate: 18,
            amount: 1416.0,
            product: {
              name: 'Brightloop ERP Cloud',
              notes: 'Core business ERP system with inventory, finance and sales modules.',
            },
            variant: null,
          },
        ],
        invoices: [
          {
            id: 'inv-1',
            invoiceNumber: 'INV-2026-0001',
            grandTotal: 1416.0,
            status: 'PAID',
            dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleAction = async (action: 'pause' | 'resume' | 'close' | 'renew') => {
    setActionLoading(true);
    try {
      const endpointAction = action === 'resume' ? 'renew' : action;
      await apiClient.patch(`/subscriptions/${id}/${endpointAction}`);
      toast.success(`Subscription ${action} action applied successfully`);
      fetchDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action} subscription`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold">Subscription Not Found</h2>
        <Button asChild variant="outline">
          <Link to="/subscriptions">Back to Subscriptions</Link>
        </Button>
      </div>
    );
  }

  const customerName = subscription.customer?.name || 'Customer';
  const customerCompany = subscription.customer?.companyName || subscription.customer?.company || '';
  const planName = subscription.plan?.name || 'Subscription Plan';
  const billingCadence = subscription.plan?.billingInterval || subscription.billingFrequency || 'MONTHLY';
  const status = (subscription.status || 'ACTIVE').toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Subscription ${subscription.subscriptionNumber || ''}`}
        description={`Recurring contract provisioning for ${customerName}${customerCompany ? ` (${customerCompany})` : ''}.`}
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Subscriptions', href: '/subscriptions' },
          { label: subscription.subscriptionNumber || 'Details' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/subscriptions">
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
              </Link>
            </Button>

            {!isCustomer && (
              <>
                {status === 'ACTIVE' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction('pause')}
                    disabled={actionLoading}
                    className="gap-1.5 cursor-pointer"
                  >
                    <PauseCircle className="h-4 w-4 text-amber-500" /> Pause
                  </Button>
                )}

                {status === 'PAUSED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction('resume')}
                    disabled={actionLoading}
                    className="gap-1.5 text-emerald-500 cursor-pointer"
                  >
                    <PlayCircle className="h-4 w-4" /> Resume
                  </Button>
                )}

                {status !== 'CLOSED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction('close')}
                    disabled={actionLoading}
                    className="gap-1.5 text-destructive cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" /> Close
                  </Button>
                )}

                {status !== 'CLOSED' && (
                  <Button
                    size="sm"
                    onClick={() => handleAction('renew')}
                    disabled={actionLoading}
                    className="gap-1.5 cursor-pointer"
                  >
                    <RotateCw className="h-4 w-4" /> Advance Renewal
                  </Button>
                )}
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contract Meta Card */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Contract Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Customer</span>
              <span className="font-semibold text-sm text-foreground">{customerName}</span>
              {customerCompany && (
                <span className="text-muted-foreground block text-[11px]">{customerCompany}</span>
              )}
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Assigned Plan</span>
              <span className="text-foreground font-medium">{planName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Current Status</span>
              <Badge
                variant={
                  status === 'ACTIVE'
                    ? 'secondary'
                    : status === 'PAUSED'
                    ? 'default'
                    : 'outline'
                }
                className="mt-1 font-mono uppercase text-[10px]"
              >
                {status}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Billing Cadence</span>
              <span className="font-mono text-foreground">{billingCadence}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Payment Terms</span>
              <span className="font-mono text-muted-foreground">{subscription.paymentTerms || 'Net 30'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Next Billing Date</span>
              <span className="font-mono text-foreground font-semibold">
                {formatDate(subscription.nextBillingDate)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Renewal Expiry</span>
              <span className="font-mono text-muted-foreground">
                {subscription.expiryDate ? formatDate(subscription.expiryDate) : 'Auto-Renewing'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Commercial Lines & Invoices */}
        <div className="md:col-span-2 space-y-6">
          {/* Line items */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Contracted Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border text-[11px] font-mono text-muted-foreground uppercase">
                    <tr>
                      <th className="pb-2">Product Line</th>
                      <th className="pb-2 text-center">Qty</th>
                      <th className="pb-2 text-right">Base Price</th>
                      <th className="pb-2 text-right">Variant Extra</th>
                      <th className="pb-2 text-right">Unit Price</th>
                      <th className="pb-2 text-right">Recurring Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(subscription.lines || []).map((line: any) => {
                      const productName =
                        line.product?.name || line.productName || 'Software License';
                      const variantName = line.variant?.name ? ` (${line.variant.name})` : '';
                      const variantExtra = line.variant?.additionalPrice ?? line.variantPremium ?? 0;
                      const rawBase = line.product?.salesPrice ?? (line.basePrice ?? (line.unitPrice > variantExtra ? line.unitPrice - variantExtra : line.unitPrice));
                      const basePrice = Math.max(0, rawBase);
                      const unitPrice = line.unitPrice ?? (basePrice + variantExtra);
                      const lineAmount =
                        line.amount ?? line.lineTotal ?? unitPrice * (line.quantity || 1);

                      return (
                        <tr key={line.id}>
                          <td className="py-2.5 font-semibold text-foreground">
                            {productName}
                            {variantName}
                          </td>
                          <td className="py-2.5 text-center font-mono">{line.quantity || 1}</td>
                          <td className="py-2.5 text-right font-mono text-muted-foreground">{formatCurrency(basePrice)}</td>
                          <td className="py-2.5 text-right font-mono text-purple-500">
                            {variantExtra > 0 ? `+${formatCurrency(variantExtra)}` : '—'}
                          </td>
                          <td className="py-2.5 text-right font-mono font-semibold">{formatCurrency(unitPrice)}</td>
                          <td className="py-2.5 text-right font-mono font-bold">
                            {formatCurrency(lineAmount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 border-t border-border flex justify-between font-mono text-xs font-bold">
                <span className="text-foreground">Total Recurring Rate:</span>
                <span className="text-primary text-sm font-bold">
                  {formatCurrency(subscription.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Related Invoices */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" /> Invoices Issued
                </CardTitle>
                <CardDescription className="text-xs">Generated for this subscription</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {!subscription.invoices || subscription.invoices.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 font-mono">No invoices generated yet.</p>
              ) : (
                <div className="space-y-2">
                  {subscription.invoices.map((inv: any) => {
                    const invoiceAmount = inv.grandTotal ?? inv.totalAmount ?? 0;
                    return (
                      <div
                        key={inv.id}
                        onClick={() => navigate(`/invoices/${inv.id}`)}
                        className="p-3 rounded-lg border border-border/80 bg-background/50 hover:bg-muted/40 transition-colors flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-foreground">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-muted-foreground block text-[11px]">
                            Due {formatDate(inv.dueDate)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-foreground">
                            {formatCurrency(invoiceAmount)}
                          </span>
                          <Badge
                            variant={inv.status === 'PAID' ? 'secondary' : 'default'}
                            className="ml-2 text-[10px] font-mono"
                          >
                            {inv.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
