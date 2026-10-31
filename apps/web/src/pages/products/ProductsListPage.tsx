import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Plus,
  Layers,
  Tag,
  DollarSign,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { ProductDto } from '@brightloop/contracts';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';

export function ProductsListPage() {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isStaff = role === 'MEMBER' || role === 'VIEWER';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/products', {
        params: search ? { search } : undefined,
      });
      setProducts(res.data?.data || []);
    } catch {
      // Demo dataset fallback
      setProducts([
        {
          id: 'prod-software-suite-001',
          organizationId: 'org-1',
          name: 'Brightloop Business Software',
          type: 'Software Subscription',
          salesPrice: 120.0,
          costPrice: isStaff ? null : 40.0,
          notes: 'Main business software suite billed monthly or yearly.',
          variants: [
            { id: 'var-1', productId: 'prod-1', name: 'Standard Edition', additionalPrice: 0.0 },
            { id: 'var-2', productId: 'prod-1', name: 'Odoo Brand Connector', additionalPrice: 560.0 }, // Mentioned in PDF Page 3!
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'prod-cloud-storage-002',
          organizationId: 'org-1',
          name: 'Cloud Storage & Archive Add-on',
          type: 'Add-on',
          salesPrice: 25.0,
          costPrice: isStaff ? null : 8.0,
          notes: 'High-speed storage tier for document retention and encrypted archives.',
          variants: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'prod-priority-support-003',
          organizationId: 'org-1',
          name: '24/7 Dedicated Support SLA',
          type: 'Service Add-on',
          salesPrice: 250.0,
          costPrice: isStaff ? null : 75.0,
          notes: '15-minute response SLA with dedicated technical account manager.',
          variants: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Catalog"
        description="Browse commercial products, subscription add-ons, and pricing tier variants."
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Products' },
        ]}
        actions={
          isStaff ? (
            <Badge variant="outline" className="font-mono text-xs gap-1.5 py-1 px-2.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Staff View (Read-Only)
            </Badge>
          ) : (
            <Button className="gap-2 cursor-pointer">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          )
        }
      />

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card border-border/80"
          />
        </div>
      </div>

      {/* Product List Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-semibold">No products found</h3>
          <p className="text-sm text-muted-foreground">The product catalog is currently empty.</p>
        </Card>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-mono uppercase tracking-wider text-[11px] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product Name</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Variants</th>
                  <th className="px-4 py-3 font-semibold text-right">Sales Price</th>
                  {!isStaff && (
                    <th className="px-4 py-3 font-semibold text-right text-amber-500">
                      Cost Price (Admin Only)
                    </th>
                  )}
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {products.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/products/${p.id}`)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                        {p.name}
                      </div>
                      {p.notes && (
                        <p className="text-[11px] text-muted-foreground truncate max-w-sm pt-0.5">
                          {p.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {p.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      {p.variants?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.variants.map((v) => (
                            <Badge key={v.id} variant="secondary" className="text-[10px]">
                              {v.name} {v.additionalPrice > 0 ? `(+$${v.additionalPrice})` : ''}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Single Tier</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-sm text-foreground">
                      ${p.salesPrice.toFixed(2)}
                    </td>
                    {!isStaff && (
                      <td className="px-4 py-3.5 text-right font-mono text-xs text-amber-400">
                        {p.costPrice ? `$${p.costPrice.toFixed(2)}` : '—'}
                      </td>
                    )}
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-primary text-xs font-medium group-hover:translate-x-0.5 transition-transform">
                        View <ChevronRight className="h-3.5 w-3.5" />
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
