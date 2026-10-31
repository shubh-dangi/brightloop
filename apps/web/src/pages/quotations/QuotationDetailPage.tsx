import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  CreditCard,
  Building,
  Calendar,
  Printer,
  Send,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { QuotationDto, QuotationStatus, PlanDto } from '@brightloop/contracts';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { formatDate, formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';

export function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<any>(null);
  const [plans, setPlans] = useState<PlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [converting, setConverting] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const [qRes, pRes] = await Promise.all([
        apiClient.get(`/quotations/${id}`),
        apiClient.get('/plans'),
      ]);
      setQuotation(qRes.data?.data);
      const fetchedPlans = pRes.data?.data || [];
      setPlans(fetchedPlans);
      if (fetchedPlans.length > 0) setSelectedPlanId(fetchedPlans[0].id);
    } catch {
      // Fallback demo quote
      setQuotation({
        id: id || 'qt-2026-001',
        quotationNumber: 'QT-2026-001',
        customer: {
          id: 'cust-1',
          name: 'Acme Corporation',
          email: 'procurement@acme-corp.com',
          company: 'Acme Global Holdings',
          address: '100 Enterprise Way, Silicon Valley, CA',
        },
        templateName: 'Standard SaaS Enterprise Template',
        validDays: 15,
        expiryDate: new Date(Date.now() + 10 * 86400000).toISOString(),
        subtotal: 680.0,
        discountAmount: 0.0,
        taxAmount: 68.0,
        totalAmount: 748.0,
        status: QuotationStatus.QUOTATION,
        notes: 'Commercial terms approved by operations desk; valid for 15 days.',
        lines: [
          {
            id: 'l-1',
            productName: 'Brightloop Business Software',
            variantName: 'Odoo Brand Connector',
            quantity: 1,
            unitPrice: 680.0,
            taxRate: 10,
            taxAmount: 68.0,
            lineTotal: 748.0,
          },
        ],
        createdAt: new Date().toISOString(),
      });
      setPlans([
        {
          id: 'plan-1',
          name: 'Monthly Growth Plan (₹120/mo)',
          price: 120,
          billingFrequency: 'MONTHLY' as any,
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
      ]);
      setSelectedPlanId('plan-1');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleConfirmQuote = async () => {
    try {
      await apiClient.patch(`/quotations/${id}/status`, { status: QuotationStatus.CONFIRMED });
      toast.success('Quotation confirmed by customer');
      fetchDetail();
    } catch {
      toast.error('Failed to update quotation');
    }
  };

  const handleConvertSubscription = async () => {
    if (!selectedPlanId) return;
    setConverting(true);
    try {
      const res = await apiClient.post(`/quotations/${id}/convert`, { planId: selectedPlanId });
      toast.success('Quotation successfully converted to active subscription!');
      setConvertModalOpen(false);
      navigate(`/subscriptions/${res.data?.data?.id || ''}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold">Quotation Not Found</h2>
        <Button asChild variant="outline">
          <Link to="/quotations">Back to Quotations</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Quotation ${quotation.quotationNumber}`}
        description={`Commercial offer issued for ${quotation.customer?.name} (${quotation.customer?.company}).`}
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Quotations', href: '/quotations' },
          { label: quotation.quotationNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/quotations">
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5"
            >
              <Printer className="h-4 w-4" /> Print Offer
            </Button>
            {quotation.status === 'QUOTATION' && (
              <Button size="sm" onClick={handleConfirmQuote} className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Confirm Quote
              </Button>
            )}
            {quotation.status === 'CONFIRMED' && (
              <Button
                size="sm"
                onClick={() => setConvertModalOpen(true)}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CreditCard className="h-4 w-4" /> Convert to Subscription
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer & Quote Header Details */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" /> Recipient Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Customer</span>
              <span className="font-semibold text-sm text-foreground">{quotation.customer?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Company</span>
              <span className="text-foreground">{quotation.customer?.company || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Offer Status</span>
              <Badge variant="outline" className="mt-1 font-mono uppercase text-[10px]">
                {quotation.status}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Expires On</span>
              <span className="font-mono text-muted-foreground">{formatDate(quotation.expiryDate)}</span>
            </div>
            {quotation.notes && (
              <div className="pt-2 border-t border-border/60">
                <span className="text-muted-foreground block text-[11px] font-mono uppercase">Offer Notes</span>
                <p className="text-muted-foreground text-[11px] italic pt-1">{quotation.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Items & Calculations */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Offer Line Items
            </CardTitle>
            <CardDescription className="text-xs">
              Configured products, tier variants, and tax computations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border text-[11px] font-mono text-muted-foreground uppercase">
                  <tr>
                    <th className="pb-2">Item & Variant</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {quotation.lines?.map((line: any) => (
                    <tr key={line.id}>
                      <td className="py-2.5">
                        <span className="font-semibold text-foreground">{line.productName || 'Product'}</span>
                        {line.variantName && (
                          <Badge variant="secondary" className="ml-2 text-[10px]">
                            {line.variantName}
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 text-center font-mono">{line.quantity || 1}</td>
                      <td className="py-2.5 text-right font-mono">{formatCurrency(line.unitPrice)}</td>
                      <td className="py-2.5 text-right font-mono font-bold">{formatCurrency(line.lineTotal ?? line.amount ?? ((line.unitPrice || 0) * (line.quantity || 1)))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total breakdown */}
            <div className="pt-3 border-t border-border flex flex-col items-end space-y-1 font-mono text-xs">
              <div className="flex justify-between w-56 text-muted-foreground">
                <span>Subtotal:</span>
                <span>{formatCurrency(quotation.subtotal)}</span>
              </div>
              <div className="flex justify-between w-56 text-muted-foreground">
                <span>Tax Amount:</span>
                <span>{formatCurrency(quotation.taxAmount ?? quotation.taxTotal)}</span>
              </div>
              <div className="flex justify-between w-56 pt-2 border-t border-border font-bold text-sm text-foreground">
                <span>Grand Total:</span>
                <span className="text-primary text-base font-bold">{formatCurrency(quotation.totalAmount ?? quotation.grandTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Convert to Subscription Modal */}
      <Dialog open={convertModalOpen} onOpenChange={setConvertModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convert Quotation to Subscription</DialogTitle>
            <DialogDescription>
              Select the billing frequency plan to initialize the customer's recurring contract and first invoice.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Subscription Plan *
            </label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose plan..." />
              </SelectTrigger>
              <SelectContent>
                {plans.map((pl) => (
                  <SelectItem key={pl.id} value={pl.id}>
                    {pl.name} (₹{pl.price}/{pl.billingFrequency.toLowerCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConvertSubscription}
              disabled={converting}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {converting && <Spinner size="sm" />}
              Provision Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
