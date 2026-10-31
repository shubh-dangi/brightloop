import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  Building,
  Calendar,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { CustomerDto } from '@brightloop/contracts';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { formatDate } from '../../lib/utils';
import { AddCustomerModal } from './AddCustomerModal';

export function CustomersListPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/customers', {
        params: search ? { search } : undefined,
      });
      setCustomers(res.data?.data || []);
    } catch {
      // Demo dataset fallback
      setCustomers([
        {
          id: 'cust-acme-corp-001',
          organizationId: 'org-1',
          name: 'Acme Corporation',
          email: 'procurement@acme-corp.com',
          phone: '+1 (555) 019-9231',
          company: 'Acme Global Holdings',
          address: '100 Enterprise Way, Suite 400, Silicon Valley, CA',
          notes: 'Enterprise account with 100+ seats and dedicated SLA.',
          createdById: 'usr-1',
          createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { subscriptions: 2, quotations: 3, invoices: 4 },
        },
        {
          id: 'cust-apex-retail-002',
          organizationId: 'org-1',
          name: 'Apex Retailers Inc.',
          email: 'billing@apexretail.com',
          phone: '+1 (555) 014-4822',
          company: 'Apex Retail Solutions',
          address: '42 Commerce Blvd, Austin, TX',
          notes: 'B2B boutique retailer scaling into 12 national distribution centers.',
          createdById: 'usr-2',
          createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { subscriptions: 1, quotations: 1, invoices: 2 },
        },
        {
          id: 'cust-solaris-labs-003',
          organizationId: 'org-1',
          name: 'Solaris AI Labs',
          email: 'admin@solaris-ai.io',
          phone: '+1 (555) 832-1109',
          company: 'Solaris Systems Corp',
          address: '77 Innovation Park, Cambridge, MA',
          notes: 'High volume API consumer requiring daily cloud archive backups.',
          createdById: 'usr-1',
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { subscriptions: 1, quotations: 2, invoices: 1 },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Directory"
        description="View and manage subscriber organizations, primary contacts, and commercial contracts."
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Customers' },
        ]}
        actions={
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 cursor-pointer bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Button>
        }
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 w-full bg-card border-border/80"
          />
        </div>
      </div>

      {/* Customers Table / Cards */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : customers.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-semibold">No customers found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by adding your first customer account.
          </p>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" /> Add Customer
          </Button>
        </Card>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-mono uppercase tracking-wider text-[11px] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Contact Email</th>
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold text-center">Subscriptions</th>
                  <th className="px-4 py-3 font-semibold text-center">Invoices</th>
                  <th className="px-4 py-3 font-semibold">Joined Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/customers/${c.id}`)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                        {c.name}
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-0.5">
                          <Phone className="h-3 w-3" /> {c.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-muted-foreground/70" />
                        {c.email}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-foreground/90 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        {c.company || 'Individual'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant="outline" className="font-mono text-[11px]">
                        {c._count?.subscriptions || 0} Active
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant="secondary" className="font-mono text-[11px]">
                        {c._count?.invoices || 0} Bills
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground font-mono">
                      {formatDate(c.createdAt)}
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

      {/* Add Customer Modal */}
      <AddCustomerModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onCustomerCreated={fetchCustomers}
      />
    </div>
  );
}
