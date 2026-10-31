import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Receipt,
  Search,
  Filter,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { InvoiceDto, InvoiceStatus } from '@brightloop/contracts';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { formatDate, formatCurrency } from '../../lib/utils';

export function InvoicesListPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/invoices', {
        params: {
          search: search || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        },
      });
      setInvoices(res.data?.data || []);
    } catch {
      // Demo fallback
      setInvoices([
        {
          id: 'inv-acme-001',
          organizationId: 'org-1',
          invoiceNumber: 'INV-2026-001',
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
          invoiceDate: new Date(Date.now() - 30 * 86400000).toISOString(),
          dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
          subtotal: 120.0,
          discountAmount: 0.0,
          taxAmount: 12.0,
          totalAmount: 132.0,
          paidAmount: 132.0,
          outstandingAmount: 0.0,
          status: InvoiceStatus.PAID,
          lines: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'inv-acme-002',
          organizationId: 'org-1',
          invoiceNumber: 'INV-2026-002',
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
          invoiceDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
          subtotal: 120.0,
          discountAmount: 0.0,
          taxAmount: 12.0,
          totalAmount: 132.0,
          paidAmount: 0.0,
          outstandingAmount: 132.0,
          status: InvoiceStatus.CONFIRMED,
          lines: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'inv-apex-003',
          organizationId: 'org-1',
          invoiceNumber: 'INV-2026-003',
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
          invoiceDate: new Date(Date.now() - 40 * 86400000).toISOString(),
          dueDate: new Date(Date.now() - 10 * 86400000).toISOString(),
          subtotal: 1200.0,
          discountAmount: 120.0,
          taxAmount: 108.0,
          totalAmount: 1188.0,
          paidAmount: 0.0,
          outstandingAmount: 1188.0,
          status: InvoiceStatus.CONFIRMED,
          lines: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices & Recurring Billing"
        description="Inspect automated billing day runs, tax computations, outstanding balances, and settlement receipts."
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Invoices' },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice number or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card border-border/80"
          />
        </div>
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'CONFIRMED', 'PAID', 'DRAFT', 'CANCELLED'].map((st) => (
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
      ) : invoices.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-semibold">No invoices found</h3>
          <p className="text-sm text-muted-foreground">Invoices are automatically scheduled from subscriptions.</p>
        </Card>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-mono uppercase tracking-wider text-[11px] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Invoice #</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Due Date</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Total</th>
                  <th className="px-4 py-3 font-semibold text-right">Outstanding</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoices.map((inv: any) => {
                  const invoiceTotal = inv.grandTotal ?? inv.totalAmount ?? 0;
                  const paidAmount =
                    inv.payments?.reduce((acc: number, p: any) => acc + (p.amount || 0), 0) ??
                    inv.paidAmount ??
                    (inv.status === 'PAID' ? invoiceTotal : 0);
                  const outstanding = Math.max(0, invoiceTotal - paidAmount);
                  const isOverdue =
                    inv.status !== 'PAID' &&
                    inv.status !== 'CANCELLED' &&
                    inv.dueDate &&
                    new Date(inv.dueDate) < new Date();

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className="hover:bg-muted/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-foreground text-sm">
                          {inv.customer?.name || 'Customer'}
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {inv.customer?.companyName || inv.customer?.company || ''}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        <span
                          className={
                            isOverdue
                              ? 'text-destructive font-semibold flex items-center gap-1'
                              : 'text-muted-foreground'
                          }
                        >
                          {isOverdue && <AlertCircle className="h-3 w-3" />}
                          {formatDate(inv.dueDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge
                          variant={
                            inv.status === 'PAID'
                              ? 'secondary'
                              : isOverdue
                              ? 'destructive'
                              : 'default'
                          }
                          className="font-mono text-[10px] uppercase"
                        >
                          {isOverdue ? 'OVERDUE' : inv.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-sm text-foreground">
                        {formatCurrency(invoiceTotal)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-sm text-amber-500">
                        {formatCurrency(outstanding)}
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
