import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Banknote,
  Search,
  Plus,
  Calendar,
  Building,
  Receipt,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { PaymentDto, PaymentMethod } from '@brightloop/contracts';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { formatDate } from '../../lib/utils';
import { RecordPaymentModal } from './RecordPaymentModal';

export function PaymentsListPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/payments', {
        params: search ? { search } : undefined,
      });
      setPayments(res.data?.data || []);
    } catch {
      // Demo fallback
      setPayments([
        {
          id: 'pay-acme-001',
          organizationId: 'org-1',
          paymentReference: 'PAY-2026-001',
          invoiceId: 'inv-1',
          invoice: {
            id: 'inv-1',
            invoiceNumber: 'INV-2026-001',
            totalAmount: 132.0,
          } as any,
          customerId: 'cust-1',
          customer: {
            id: 'cust-1',
            name: 'Acme Corporation',
            company: 'Acme Global Holdings',
          } as any,
          amount: 132.0,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          paymentDate: new Date(Date.now() - 4 * 86400000).toISOString(),
          note: 'Settlement confirmed via ACH batch #9182.',
          recordedById: 'usr-3',
          recordedBy: { name: 'Jordan Hayes (Staff)', email: 'member@brightloop.local' },
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Settlements"
        description="Review all recorded payment receipts, methods, allocation to invoices, and staff attribution."
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Payments' },
        ]}
        actions={
          <Button
            onClick={() => setIsRecordModalOpen(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            <Banknote className="h-4 w-4" /> Record Payment
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by payment ref, customer, or invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card border-border/80"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : payments.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <Banknote className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-semibold">No payments recorded</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Record funds collected against open invoices.
          </p>
          <Button onClick={() => setIsRecordModalOpen(true)} className="gap-2">
            <Banknote className="h-4 w-4" /> Record Payment
          </Button>
        </Card>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-mono uppercase tracking-wider text-[11px] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Receipt Ref</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Invoice #</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Settled Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-foreground">
                      {p.paymentReference}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground text-sm">{p.customer?.name}</div>
                      <span className="text-[11px] text-muted-foreground">{p.customer?.company}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-primary font-medium">
                      {p.invoice?.invoiceNumber}
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <Badge variant="outline" className="text-[10px]">
                        {p.paymentMethod.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-muted-foreground">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-sm text-emerald-500">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-muted-foreground text-[11px]">
                      {p.recordedBy?.name || 'Staff'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        open={isRecordModalOpen}
        onOpenChange={setIsRecordModalOpen}
        onPaymentRecorded={fetchPayments}
      />
    </div>
  );
}
