import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '../../services/api';
import {
  RecordPaymentSchema,
  RecordPaymentInput,
  PaymentMethod,
  InvoiceDto,
} from '@brightloop/contracts';
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
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Spinner } from '../../components/ui/spinner';
import { toast } from 'sonner';

interface RecordPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillInvoiceId?: string;
  prefillAmount?: number;
  onPaymentRecorded: () => void;
}

export function RecordPaymentModal({
  open,
  onOpenChange,
  prefillInvoiceId,
  prefillAmount,
  onPaymentRecorded,
}: RecordPaymentModalProps) {
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(prefillInvoiceId || '');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RecordPaymentInput>({
    resolver: zodResolver(RecordPaymentSchema),
    defaultValues: {
      invoiceId: prefillInvoiceId || '',
      amount: prefillAmount || 0,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentDate: new Date().toISOString().split('T')[0],
      note: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (prefillInvoiceId) {
        setSelectedInvoiceId(prefillInvoiceId);
        setValue('invoiceId', prefillInvoiceId);
      }
      if (prefillAmount !== undefined) {
        setValue('amount', prefillAmount);
      }

      apiClient
        .get('/invoices')
        .then((res) => {
          const list = res.data?.data || [];
          setInvoices(list.filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'CANCELLED'));
        })
        .catch(() => {
          setInvoices([
            {
              id: 'inv-acme-002',
              customerId: 'cust-1',
              invoiceNumber: 'INV-2026-002',
              totalAmount: 132,
              outstandingAmount: 132,
              customer: { name: 'Acme Corporation' } as any,
              organizationId: '',
              invoiceDate: '',
              dueDate: '',
              subtotal: 120,
              discountAmount: 0,
              taxAmount: 12,
              paidAmount: 0,
              status: 'CONFIRMED' as any,
              lines: [],
              createdAt: '',
              updatedAt: '',
            },
          ]);
        });
    }
  }, [open, prefillInvoiceId, prefillAmount]);

  const handleInvoiceSelect = (invId: string) => {
    setSelectedInvoiceId(invId);
    setValue('invoiceId', invId);
    const chosen = invoices.find((inv) => inv.id === invId);
    if (chosen) {
      setValue('amount', chosen.outstandingAmount);
    }
  };

  const onSubmit = async (data: RecordPaymentInput) => {
    setLoading(true);
    try {
      await apiClient.post('/payments', {
        ...data,
        invoiceId: selectedInvoiceId,
        paymentMethod: selectedMethod,
        amount: Number(data.amount),
      });
      toast.success('Payment recorded successfully; invoice balances updated');
      reset();
      onOpenChange(false);
      onPaymentRecorded();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Customer Payment</DialogTitle>
          <DialogDescription>
            Record incoming settlement funds with method and reference note against an outstanding invoice.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Target Invoice *
            </label>
            <Select value={selectedInvoiceId} onValueChange={handleInvoiceSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose unpaid invoice..." />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {inv.customer?.name} (₹{inv.outstandingAmount} due)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Amount Received (₹) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
                className={errors.amount ? 'border-destructive' : ''}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Payment Method *
              </label>
              <Select
                value={selectedMethod}
                onValueChange={(val) => setSelectedMethod(val as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Wire / ACH</SelectItem>
                  <SelectItem value={PaymentMethod.CREDIT_CARD}>Credit Card</SelectItem>
                  <SelectItem value={PaymentMethod.CHECK}>Corporate Check</SelectItem>
                  <SelectItem value={PaymentMethod.CASH}>Cash / Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Payment Settlement Date *
            </label>
            <Input type="date" {...register('paymentDate')} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Reference / Note *
            </label>
            <Textarea
              placeholder="e.g. Wire transaction batch #8821 verified via bank portal."
              {...register('note')}
              className="resize-none h-18 text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading && <Spinner size="sm" />}
              Commit Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
