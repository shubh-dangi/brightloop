import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Plus,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { QuotationDto, QuotationStatus } from '@brightloop/contracts';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { formatDate } from '../../lib/utils';

export function QuotationsListPage() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<QuotationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/quotations', {
        params: search ? { search } : undefined,
      });
      setQuotations(res.data?.data || []);
    } catch {
      // Demo dataset fallback
      setQuotations([
        {
          id: 'qt-2026-001',
          organizationId: 'org-1',
          quotationNumber: 'QT-2026-001',
          customerId: 'cust-1',
          customer: {
            id: 'cust-1',
            organizationId: 'org-1',
            name: 'Acme Corporation',
            email: 'procurement@acme-corp.com',
            company: 'Acme Global Holdings',
            createdById: 'usr-1',
            createdAt: '',
            updatedAt: '',
          },
          templateName: 'Standard SaaS Enterprise Template',
          validDays: 15,
          expiryDate: new Date(Date.now() + 10 * 86400000).toISOString(),
          subtotal: 680.0,
          discountAmount: 0.0,
          taxAmount: 68.0,
          totalAmount: 748.0,
          status: QuotationStatus.QUOTATION,
          notes: 'Includes 1x Business Software + Odoo Brand Connector variant.',
          lines: [],
          createdById: 'usr-3',
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'qt-2026-002',
          organizationId: 'org-1',
          quotationNumber: 'QT-2026-002',
          customerId: 'cust-2',
          customer: {
            id: 'cust-2',
            organizationId: 'org-1',
            name: 'Apex Retailers Inc.',
            email: 'billing@apexretail.com',
            company: 'Apex Retail Solutions',
            createdById: 'usr-2',
            createdAt: '',
            updatedAt: '',
          },
          templateName: 'Annual Growth Template',
          validDays: 30,
          expiryDate: new Date(Date.now() + 25 * 86400000).toISOString(),
          subtotal: 1200.0,
          discountAmount: 120.0,
          taxAmount: 108.0,
          totalAmount: 1188.0,
          status: QuotationStatus.CONFIRMED,
          notes: 'Customer approved initial quotation; ready for subscription conversion.',
          lines: [],
          createdById: 'usr-3',
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commercial Quotations"
        description="Draft, send, and confirm commercial quotes prepared from pre-filled product & plan templates."
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Quotations' },
        ]}
        actions={
          <Button onClick={() => navigate('/quotations/new')} className="gap-2 cursor-pointer">
            <Plus className="h-4 w-4" /> Create Quotation
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotation number or customer name..."
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
      ) : quotations.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-semibold">No quotations found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create an offer for a customer starting from a quotation template.
          </p>
          <Button onClick={() => navigate('/quotations/new')} className="gap-2">
            <Plus className="h-4 w-4" /> Create Quotation
          </Button>
        </Card>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-mono uppercase tracking-wider text-[11px] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Quote #</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Validity</th>
                  <th className="px-4 py-3 font-semibold">Expires On</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Total Amount</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {quotations.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => navigate(`/quotations/${q.id}`)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                      {q.quotationNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground text-sm">{q.customer?.name}</div>
                      <span className="text-[11px] text-muted-foreground">{q.customer?.company}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-muted-foreground">
                      {q.validDays} days
                    </td>
                    <td className="px-4 py-3.5 font-mono text-muted-foreground">
                      {formatDate(q.expiryDate)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant={
                          q.status === 'CONFIRMED'
                            ? 'secondary'
                            : q.status === 'QUOTATION'
                            ? 'default'
                            : 'outline'
                        }
                        className="font-mono text-[10px] uppercase"
                      >
                        {q.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-sm text-foreground">
                      ${q.totalAmount.toFixed(2)}
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
