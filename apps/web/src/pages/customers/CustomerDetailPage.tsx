import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  CreditCard,
  FileText,
  Receipt,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { CustomerDto, SubscriptionDto, InvoiceDto, QuotationDto } from '@brightloop/contracts';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { formatDate } from '../../lib/utils';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/customers/${id}`);
        setCustomer(res.data?.data);
      } catch {
        // Demo detail fallback
        setCustomer({
          id: id || 'cust-acme-corp-001',
          name: 'Acme Corporation',
          email: 'procurement@acme-corp.com',
          phone: '+1 (555) 019-9231',
          company: 'Acme Global Holdings',
          address: '100 Enterprise Way, Suite 400, Silicon Valley, CA',
          notes: 'Enterprise account with 100+ seats and dedicated SLA.',
          createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
          subscriptions: [
            {
              id: 'sub-acme-001',
              subscriptionNumber: 'SUB-2026-001',
              status: 'ACTIVE',
              billingFrequency: 'MONTHLY',
              totalAmount: 132.0,
              startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
              plan: { name: 'Monthly Growth Plan' },
            },
          ],
          quotations: [
            {
              id: 'qt-acme-001',
              quotationNumber: 'QT-2026-001',
              status: 'CONFIRMED',
              totalAmount: 132.0,
              expiryDate: new Date(Date.now() + 15 * 86400000).toISOString(),
            },
          ],
          invoices: [
            {
              id: 'inv-acme-001',
              invoiceNumber: 'INV-2026-001',
              status: 'PAID',
              totalAmount: 132.0,
              paidAmount: 132.0,
              outstandingAmount: 0.0,
              dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
            },
            {
              id: 'inv-acme-002',
              invoiceNumber: 'INV-2026-002',
              status: 'CONFIRMED',
              totalAmount: 132.0,
              paidAmount: 0.0,
              outstandingAmount: 132.0,
              dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold">Customer Not Found</h2>
        <Button asChild variant="outline">
          <Link to="/customers">Back to Customers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description={`Customer record and commercial contract history for ${customer.company || customer.name}.`}
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Customers', href: '/customers' },
          { label: customer.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/customers">
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
              </Link>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/quotations/new?customerId=${customer.id}`)}
              className="gap-1.5"
            >
              <FileText className="h-4 w-4" /> Create Quotation
            </Button>
          </div>
        }
      />

      {/* Customer Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Email</span>
              <span className="font-mono text-foreground font-medium text-sm flex items-center gap-1.5 pt-0.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {customer.email}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Company</span>
              <span className="text-foreground font-medium flex items-center gap-1.5 pt-0.5">
                <Building className="h-3.5 w-3.5 text-muted-foreground" /> {customer.company || 'N/A'}
              </span>
            </div>
            {customer.phone && (
              <div>
                <span className="text-muted-foreground block text-[11px] font-mono uppercase">Phone</span>
                <span className="text-foreground font-medium flex items-center gap-1.5 pt-0.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {customer.phone}
                </span>
              </div>
            )}
            {customer.address && (
              <div>
                <span className="text-muted-foreground block text-[11px] font-mono uppercase">Billing Address</span>
                <p className="text-foreground/80 pt-0.5 leading-relaxed">{customer.address}</p>
              </div>
            )}
            {customer.notes && (
              <div className="pt-2 border-t border-border/60">
                <span className="text-muted-foreground block text-[11px] font-mono uppercase">Internal Notes</span>
                <p className="text-muted-foreground italic pt-1 text-[11px] leading-relaxed">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commercial Overview Columns */}
        <div className="md:col-span-2 space-y-6">
          {/* Subscriptions */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" /> Active Subscriptions
                </CardTitle>
                <CardDescription className="text-xs">Recurring provisioning contracts</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline" className="text-xs h-8">
                <Link to="/subscriptions">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {customer.subscriptions?.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No active subscriptions yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {customer.subscriptions?.map((sub: any) => (
                    <div
                      key={sub.id}
                      onClick={() => navigate(`/subscriptions/${sub.id}`)}
                      className="p-3 rounded-lg border border-border/80 bg-background/50 hover:bg-muted/40 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-foreground">
                            {sub.subscriptionNumber}
                          </span>
                          <Badge variant="outline" className="text-[10px] uppercase font-mono">
                            {sub.billingFrequency}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{sub.plan?.name}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-foreground">
                          ₹{sub.totalAmount?.toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-emerald-500 font-semibold uppercase">
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" /> Invoices & Billing
                </CardTitle>
                <CardDescription className="text-xs">Invoice generation and payment settlements</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline" className="text-xs h-8">
                <Link to="/invoices">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {customer.invoices?.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No invoices generated yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {customer.invoices?.map((inv: any) => (
                    <div
                      key={inv.id}
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className="p-3 rounded-lg border border-border/80 bg-background/50 hover:bg-muted/40 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-foreground">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Due {formatDate(inv.dueDate)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-foreground">
                          ₹{inv.totalAmount?.toFixed(2)}
                        </span>
                        <Badge
                          variant={inv.status === 'PAID' ? 'secondary' : 'default'}
                          className="ml-2 text-[10px] font-mono"
                        >
                          {inv.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
