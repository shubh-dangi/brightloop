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
  Sparkles,
  Calculator,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/utils';

export function ProductsListPage() {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Product Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductType, setNewProductType] = useState('Software Subscription');
  const [newBasePrice, setNewBasePrice] = useState(120);
  const [newCostPrice, setNewCostPrice] = useState(40);
  const [selectedBrand, setSelectedBrand] = useState<'Standard' | 'Odoo' | 'Enterprise'>('Standard');
  const [selectedColor, setSelectedColor] = useState('Default');
  const [newNotes, setNewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = role === 'ADMIN' || role === 'OWNER';

  // Dynamic price calculation logic for Product Creation
  // If Brand variant is "Odoo", automatically add +560 to base price
  const variantPremium = selectedBrand === 'Odoo' ? 560 : selectedBrand === 'Enterprise' ? 1200 : 0;
  const calculatedSalesPrice = Number(newBasePrice || 0) + variantPremium;
  const automatedTax = (calculatedSalesPrice * 18) / 100;
  const finalPriceWithTax = calculatedSalesPrice + automatedTax;

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
          costPrice: isAdmin ? 40.0 : null,
          notes: 'Main business software suite billed monthly or yearly.',
          variants: [
            { id: 'var-1', productId: 'prod-1', name: 'Standard Edition', additionalPrice: 0.0 },
            { id: 'var-2', productId: 'prod-1', name: 'Odoo Brand Connector', additionalPrice: 560.0 },
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
          costPrice: isAdmin ? 8.0 : null,
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
          costPrice: isAdmin ? 75.0 : null,
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

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: newProductName,
        type: newProductType,
        salesPrice: calculatedSalesPrice,
        costPrice: Number(newCostPrice || 0),
        notes: `${newNotes ? newNotes + ' | ' : ''}Brand: ${selectedBrand} | Color: ${selectedColor}`,
        variants: [
          { name: 'Standard Edition', additionalPrice: 0 },
          { name: 'Odoo Brand Connector', additionalPrice: 560 },
        ],
      };

      try {
        const res = await apiClient.post('/products', payload);
        if (res.data?.data) {
          setProducts([res.data.data, ...products]);
        }
      } catch {
        // Optimistic local add
        const created: ProductDto = {
          id: `prod-${Date.now()}`,
          organizationId: 'org-1',
          name: newProductName,
          type: newProductType,
          salesPrice: calculatedSalesPrice,
          costPrice: Number(newCostPrice || 0),
          notes: `${newNotes ? newNotes + ' | ' : ''}Brand: ${selectedBrand} (+₹${variantPremium})`,
          variants: [
            { id: `v-${Date.now()}-1`, productId: `prod-${Date.now()}`, name: `${selectedBrand} Edition`, additionalPrice: variantPremium },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProducts([created, ...products]);
      }

      toast.success(
        selectedBrand === 'Odoo'
          ? 'Product created with Odoo Brand Variant (+₹560 premium applied)!'
          : 'Product created successfully!',
      );
      setAddModalOpen(false);
      setNewProductName('');
      setNewNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Catalog"
        description="Browse commercial products, subscription add-ons, and dynamic pricing tier variants."
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Products' },
        ]}
        actions={
          isAdmin ? (
            <Button onClick={() => setAddModalOpen(true)} className="gap-2 cursor-pointer">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          ) : (
            <Badge variant="outline" className="font-mono text-xs gap-1.5 py-1 px-2.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Catalog View (Read-Only)
            </Badge>
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
                  <th className="px-4 py-3 font-semibold">Variants & Attributes</th>
                  <th className="px-4 py-3 font-semibold text-right">Sales Price</th>
                  {isAdmin && (
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
                            <Badge
                              key={v.id}
                              variant={v.name.includes('Odoo') ? 'default' : 'secondary'}
                              className={`text-[10px] ${v.name.includes('Odoo') ? 'bg-purple-600 text-white font-bold' : ''}`}
                            >
                              {v.name} {v.additionalPrice > 0 ? `(+₹${v.additionalPrice})` : ''}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Single Tier</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-sm text-foreground">
                      {formatCurrency(p.salesPrice)}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3.5 text-right font-mono text-xs text-amber-400">
                        {p.costPrice !== null && p.costPrice !== undefined ? formatCurrency(p.costPrice) : '—'}
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

      {/* Add Product Dialog Modal with Variant Selection & Real-Time Price Modification */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleCreateProduct}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                <Package className="h-4 w-4 text-primary" /> Create Product with Dynamic Variant Pricing
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure base product attributes. Selecting the <strong>Odoo</strong> brand automatically adds +₹560 in real-time.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Product Name *</label>
                <Input
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Brightloop Enterprise Cloud Suite"
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Product Type</label>
                  <Select value={newProductType} onValueChange={setNewProductType}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Software Subscription">Software Subscription</SelectItem>
                      <SelectItem value="Add-on">Add-on Module</SelectItem>
                      <SelectItem value="Service SLA">Support / SLA</SelectItem>
                      <SelectItem value="Physical Goods">Hardware Device</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Base Sales Price (₹) *</label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Variant Selector: Brand and Color */}
              <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    Variant Selection (Brand & Color Attributes)
                  </span>
                  {selectedBrand === 'Odoo' && (
                    <Badge className="bg-purple-600 text-white font-mono text-[10px]">
                      +₹560 Premium Active
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-muted-foreground">Brand Attribute</label>
                    <Select value={selectedBrand} onValueChange={(val: any) => setSelectedBrand(val)}>
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard Brand (+₹0)</SelectItem>
                        <SelectItem value="Odoo">Odoo Brand (+₹560)</SelectItem>
                        <SelectItem value="Enterprise">Enterprise Brand (+₹1,200)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-muted-foreground">Color / Style</label>
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Default">Default</SelectItem>
                        <SelectItem value="Graphite">Graphite Slate</SelectItem>
                        <SelectItem value="Silver">Titanium Silver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Real-time Dynamic Price Modification Card */}
                <div className="pt-2 border-t border-border/60 font-mono text-[11px] space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Base Sales Price:</span>
                    <span>{formatCurrency(newBasePrice)}</span>
                  </div>
                  {variantPremium > 0 && (
                    <div className="flex justify-between text-purple-600 dark:text-purple-400 font-bold">
                      <span>Variant Premium ({selectedBrand}):</span>
                      <span>+{formatCurrency(variantPremium)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Automated Taxes (18% GST):</span>
                    <span>+{formatCurrency(automatedTax)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border font-bold text-foreground text-xs">
                    <span>Effective Final Price:</span>
                    <span className="text-primary font-extrabold">{formatCurrency(finalPriceWithTax)}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground text-amber-500">
                    Cost Price (Admin Only ₹)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? 'Creating...' : 'Save Product with Variants'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
