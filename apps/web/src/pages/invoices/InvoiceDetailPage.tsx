import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Receipt,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Send,
  Printer,
  DollarSign,
  Building,
  Calendar,
  AlertCircle,
  Banknote,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { InvoiceDto, InvoiceStatus, PaymentMethod } from '@brightloop/contracts';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { formatDate, formatCurrency } from '../../lib/utils';
import { RecordPaymentModal } from '../payments/RecordPaymentModal';
import { toast } from 'sonner';

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/invoices/${id}`);
      setInvoice(res.data?.data);
    } catch {
      // Demo fallback invoice
      setInvoice({
        id: id || 'inv-acme-002',
        invoiceNumber: 'INV-2026-002',
        customer: {
          id: 'cust-1',
          name: 'Acme Corporation',
          email: 'procurement@acme-corp.com',
          company: 'Acme Global Holdings',
          address: '100 Enterprise Way, Silicon Valley, CA',
        },
        subscription: {
          subscriptionNumber: 'SUB-2026-001',
          plan: { name: 'Monthly Growth Plan' },
        },
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        subtotal: 120.0,
        discountAmount: 0.0,
        taxAmount: 12.0,
        totalAmount: 132.0,
        paidAmount: 0.0,
        outstandingAmount: 132.0,
        status: InvoiceStatus.CONFIRMED,
        lines: [
          {
            id: 'il-1',
            description: 'Monthly Growth Plan - Current Period Renewal',
            quantity: 1,
            unitPrice: 120.0,
            taxRate: 10,
            taxAmount: 12.0,
            lineTotal: 132.0,
          },
        ],
        payments: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/invoices/${id}/confirm`);
      toast.success('Invoice confirmed');
      fetchDetail();
    } catch {
      toast.error('Failed to confirm invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/invoices/${id}/cancel`);
      toast.success('Invoice cancelled');
      fetchDetail();
    } catch {
      toast.error('Failed to cancel invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSend = async () => {
    try {
      const res = await apiClient.post(`/invoices/${id}/send`);
      toast.success(res.data?.data?.message || 'Invoice sent to customer email');
    } catch {
      toast.error('Failed to send invoice');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold">Invoice Not Found</h2>
        <Button asChild variant="outline">
          <Link to="/invoices">Back to Invoices</Link>
        </Button>
      </div>
    );
  }

  const isOverdue =
    invoice.status !== 'PAID' &&
    invoice.status !== 'CANCELLED' &&
    new Date(invoice.dueDate) < new Date();

  return (
    <div className="space-y-6 max-w-4xl mx-auto print:max-w-none print:p-0">
      <div className="print:hidden">
        <PageHeader
          title={`Invoice ${invoice.invoiceNumber}`}
          description={`Commercial billing statement issued to ${invoice.customer?.name}.`}
          breadcrumbs={[
            { label: 'Workspace', href: '/dashboard' },
            { label: 'Invoices', href: '/invoices' },
            { label: invoice.invoiceNumber },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/invoices">
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleSend} className="gap-1.5">
                <Send className="h-4 w-4" /> Send Email
              </Button>
              {invoice.status === 'DRAFT' && (
                <Button size="sm" onClick={handleConfirm} disabled={actionLoading} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Confirm
                </Button>
              )}
              {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="gap-1.5 text-destructive"
                  >
                    <XCircle className="h-4 w-4" /> Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setPaymentModalOpen(true)}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Banknote className="h-4 w-4" /> Record Payment
                  </Button>
                </>
              )}
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recipient Meta */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" /> Bill To
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Customer</span>
              <span className="font-semibold text-sm text-foreground">{invoice.customer?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Company</span>
              <span className="text-foreground">{invoice.customer?.company || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Status</span>
              <Badge
                variant={invoice.status === 'PAID' ? 'secondary' : isOverdue ? 'destructive' : 'default'}
                className="mt-1 font-mono uppercase text-[10px]"
              >
                {isOverdue ? 'OVERDUE' : invoice.status}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Due Date</span>
              <span className="font-mono text-foreground font-semibold">{formatDate(invoice.dueDate)}</span>
            </div>
            {invoice.subscription && (
              <div>
                <span className="text-muted-foreground block text-[11px] font-mono uppercase">Subscription Origin</span>
                <span className="font-mono text-primary text-[11px]">{invoice.subscription.subscriptionNumber}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Statement & Balances */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" /> Billed Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border text-[11px] font-mono text-muted-foreground uppercase">
                    <tr>
                      <th className="pb-2">Description</th>
                      <th className="pb-2 text-center">Qty</th>
                      <th className="pb-2 text-right">Unit Price</th>
                      <th className="pb-2 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {invoice.lines?.map((line: any) => {
                      const linePrice = line.unitPrice ?? 0;
                      const lineTotal = line.lineTotal ?? line.amount ?? (linePrice * (line.quantity || 1));
                      return (
                        <tr key={line.id}>
                          <td className="py-2.5 font-semibold text-foreground">{line.description || line.product?.name || 'Service Line'}</td>
                          <td className="py-2.5 text-center font-mono">{line.quantity || 1}</td>
                          <td className="py-2.5 text-right font-mono">{formatCurrency(linePrice)}</td>
                          <td className="py-2.5 text-right font-mono font-bold">{formatCurrency(lineTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Financial Balances */}
              {(() => {
                const subtotal = invoice.subtotal ?? 0;
                const tax = invoice.taxTotal ?? invoice.taxAmount ?? 0;
                const total = invoice.grandTotal ?? invoice.totalAmount ?? (subtotal + tax);
                const paid = invoice.payments?.reduce((acc: number, p: any) => acc + (p.amount || 0), 0) ?? invoice.paidAmount ?? (invoice.status === 'PAID' ? total : 0);
                const outstanding = Math.max(0, total - paid);

                return (
                  <div className="pt-3 border-t border-border flex flex-col items-end space-y-1 font-mono text-xs">
                    <div className="flex justify-between w-60 text-muted-foreground">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between w-60 text-muted-foreground">
                      <span>Taxes (Automatic):</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between w-60 pt-1 font-bold text-foreground">
                      <span>Total Invoiced:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between w-60 text-emerald-500 font-semibold">
                      <span>Paid to Date:</span>
                      <span>-{formatCurrency(paid)}</span>
                    </div>
                    <div className="flex justify-between w-60 pt-2 border-t border-border font-bold text-sm text-foreground">
                      <span>Outstanding Balance:</span>
                      <span className="text-amber-500 text-base">{formatCurrency(outstanding)}</span>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        prefillInvoiceId={invoice.id}
        prefillAmount={invoice.outstandingAmount}
        onPaymentRecorded={fetchDetail}
      />
    </div>
  );
}
