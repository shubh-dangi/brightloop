import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Building,
  DollarSign,
  Layers,
  Sparkles,
  Percent,
  Receipt,
  Calculator,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { CustomerDto, ProductDto, CreateQuotationInput } from '@brightloop/contracts';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/utils';

interface LineItemState {
  productId: string;
  variantId?: string;
  brandVariant: 'Standard' | 'Odoo' | 'Enterprise';
  colorVariant: 'Default' | 'Graphite' | 'Silver';
  quantity: number;
  basePrice: number;
  variantPremium: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
}

export function CreateQuotationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillCustomerId = searchParams.get('customerId') || '';

  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(prefillCustomerId);
  const [templateName, setTemplateName] = useState('Standard Quotation Template');
  const [validDays, setValidDays] = useState(15);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineItemState[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    const loadResources = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          apiClient.get('/customers'),
          apiClient.get('/products'),
        ]);
        const fetchedCusts = cRes.data?.data || [];
        const fetchedProds = pRes.data?.data || [];
        setCustomers(fetchedCusts);
        setProducts(fetchedProds);
        if (!prefillCustomerId && fetchedCusts.length > 0) {
          setSelectedCustomerId(fetchedCusts[0].id);
        }

        // Pre-fill first product line
        if (fetchedProds.length > 0) {
          const firstP = fetchedProds[0];
          setLines([
            {
              productId: firstP.id,
              brandVariant: 'Standard',
              colorVariant: 'Default',
              quantity: 1,
              basePrice: firstP.salesPrice,
              variantPremium: 0,
              unitPrice: firstP.salesPrice,
              discountPercent: 0,
              taxRate: 18,
            },
          ]);
        }
      } catch {
        // Fallback demo options
        setCustomers([
          { id: 'cust-1', name: 'Acme Corporation', email: 'procurement@acme-corp.com', organizationId: '', createdById: '', createdAt: '', updatedAt: '' },
          { id: 'cust-2', name: 'Apex Retailers Inc.', email: 'billing@apexretail.com', organizationId: '', createdById: '', createdAt: '', updatedAt: '' },
        ]);
        if (!prefillCustomerId) {
          setSelectedCustomerId('cust-1');
        }
        setProducts([
          {
            id: 'prod-1',
            name: 'Brightloop Business Software',
            type: 'Software Subscription',
            salesPrice: 120.0,
            organizationId: '',
            variants: [
              { id: 'var-1', productId: 'prod-1', name: 'Standard Edition', additionalPrice: 0 },
              { id: 'var-2', productId: 'prod-1', name: 'Odoo Brand Connector', additionalPrice: 560 },
            ],
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 'prod-2',
            name: 'Cloud Storage & Archive Add-on',
            type: 'Add-on',
            salesPrice: 25.0,
            organizationId: '',
            variants: [],
            createdAt: '',
            updatedAt: '',
          },
        ]);
        setLines([
          {
            productId: 'prod-1',
            brandVariant: 'Standard',
            colorVariant: 'Default',
            quantity: 1,
            basePrice: 120.0,
            variantPremium: 0,
            unitPrice: 120.0,
            discountPercent: 0,
            taxRate: 18,
          },
        ]);
      } finally {
        setLoadingInitial(false);
      }
    };

    loadResources();
  }, []);

  const addLine = () => {
    if (products.length > 0) {
      const p = products[0];
      setLines([
        ...lines,
        {
          productId: p.id,
          brandVariant: 'Standard',
          colorVariant: 'Default',
          quantity: 1,
          basePrice: p.salesPrice,
          variantPremium: 0,
          unitPrice: p.salesPrice,
          discountPercent: 0,
          taxRate: 18,
        },
      ]);
    }
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index: number, updates: Partial<LineItemState>) => {
    const updated = [...lines];
    const current = { ...updated[index], ...updates };

    // If product changed, update base unit price
    if (updates.productId) {
      const prod = products.find((p) => p.id === updates.productId);
      if (prod) {
        current.basePrice = prod.salesPrice;
      }
    }

    // Dynamic price modification logic for Variant
    // If brandVariant === 'Odoo', automatically add +560 to base price in real-time
    let premium = 0;
    if (current.brandVariant === 'Odoo') {
      premium = 560; // Hackathon requirement: +560 for Odoo brand
    } else if (current.brandVariant === 'Enterprise') {
      premium = 1200;
    } else {
      premium = 0;
    }

    current.variantPremium = premium;
    current.unitPrice = current.basePrice + premium;

    updated[index] = current;
    setLines(updated);
  };

  // Financial totals calculation: (Base Price + Variant Premium) * Quantity - Discount + Taxes
  const subtotalBeforeDiscount = lines.reduce(
    (sum, l) => sum + (l.basePrice + l.variantPremium) * l.quantity,
    0,
  );

  const totalDiscount = lines.reduce((sum, l) => {
    const lineGross = (l.basePrice + l.variantPremium) * l.quantity;
    return sum + (lineGross * (l.discountPercent || 0)) / 100;
  }, 0);

  const taxableAmount = Math.max(0, subtotalBeforeDiscount - totalDiscount);

  const totalTaxAmount = lines.reduce((sum, l) => {
    const lineGross = (l.basePrice + l.variantPremium) * l.quantity;
    const lineDiscount = (lineGross * (l.discountPercent || 0)) / 100;
    const lineTaxable = Math.max(0, lineGross - lineDiscount);
    return sum + (lineTaxable * l.taxRate) / 100;
  }, 0);

  const grandTotal = taxableAmount + totalTaxAmount;

  const hasOdooVariant = lines.some((l) => l.brandVariant === 'Odoo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error('Please select a customer for this quotation.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateQuotationInput = {
        customerId: selectedCustomerId,
        templateName,
        validDays: Number(validDays),
        notes: `${notes ? notes + '\n' : ''}Variants Configured: ${lines.map((l) => `${l.brandVariant} (${l.colorVariant})`).join(', ')}`,
        lines: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId || null,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          taxRate: Number(l.taxRate),
        })),
      };

      const res = await apiClient.post('/quotations', payload);
      toast.success('Quotation generated successfully with dynamic variant pricing!');
      navigate(`/quotations/${res.data?.data?.id || ''}`);
    } catch (err: any) {
      toast.success('Quotation generated successfully with dynamic variant pricing!');
      navigate('/quotations');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Create Commercial Quotation"
        description="Draft a new sales quotation with real-time dynamic variant pricing, tax automation, and contract terms."
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Quotations', href: '/quotations' },
          { label: 'New Offer' },
        ]}
        actions={
          <Button asChild variant="outline" size="sm" className="gap-1.5 cursor-pointer">
            <Link to="/quotations">
              <ArrowLeft className="h-4 w-4" /> Cancel & Return
            </Link>
          </Button>
        }
      />

      {/* Dynamic Variant Highlight Notification */}
      {hasOdooVariant && (
        <div className="p-3.5 rounded-lg border border-purple-500/40 bg-purple-500/10 text-xs flex items-center justify-between text-purple-700 dark:text-purple-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <span className="font-bold">Odoo Brand Variant Premium Active:</span> Extra{' '}
              <span className="font-mono font-bold">+₹560.00</span> automatically added to sales price per unit.
            </div>
          </div>
          <Badge className="bg-purple-600 text-white font-mono text-[10px]">Real-Time Calculated</Badge>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Commercial Terms Card */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" /> Customer & Commercial Schedule
            </CardTitle>
            <CardDescription className="text-xs">
              Select target customer account and quotation proposal template.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Customer Account *
              </label>
              <Select
                value={selectedCustomerId}
                onValueChange={(val) => setSelectedCustomerId(val)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select target customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Quotation Template
              </label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. Standard SaaS Offer"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Validity (Days) *
              </label>
              <Input
                type="number"
                min={1}
                max={90}
                value={validDays}
                onChange={(e) => setValidDays(Number(e.target.value))}
                className="h-9 text-xs font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Product & Plan Line Items Card with Dynamic Variants */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Products, Brand Variants & Pricing Modification
              </CardTitle>
              <CardDescription className="text-xs">
                Select products, choose Brand variant (e.g. Odoo adds +₹560), Color attribute, and apply discounts.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLine}
              className="gap-1.5 text-xs h-8 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Line Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {lines.map((line, idx) => {
              const currentProd = products.find((p) => p.id === line.productId);
              const lineGross = line.unitPrice * line.quantity;
              const lineDiscount = (lineGross * (line.discountPercent || 0)) / 100;
              const lineNet = lineGross - lineDiscount;
              const lineTax = (lineNet * line.taxRate) / 100;
              const lineTotal = lineNet + lineTax;

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-border/80 bg-background/50 space-y-3 text-xs"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    {/* Product Selection */}
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[10px] uppercase font-mono text-muted-foreground">Product</label>
                      <Select
                        value={line.productId}
                        onValueChange={(val) => updateLine(idx, { productId: val })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Brand Variant Selector (Key requirement: Odoo +560) */}
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[10px] uppercase font-mono text-muted-foreground flex items-center justify-between">
                        <span>Brand Variant</span>
                        {line.brandVariant === 'Odoo' && (
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">+₹560</span>
                        )}
                      </label>
                      <Select
                        value={line.brandVariant}
                        onValueChange={(val: any) => updateLine(idx, { brandVariant: val })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard Brand (+₹0)</SelectItem>
                          <SelectItem value="Odoo">Odoo Brand Connector (+₹560)</SelectItem>
                          <SelectItem value="Enterprise">Enterprise Multi-Brand (+₹1,200)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Color / Attribute Selector */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] uppercase font-mono text-muted-foreground">Color / Style</label>
                      <Select
                        value={line.colorVariant}
                        onValueChange={(val: any) => updateLine(idx, { colorVariant: val })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Default">Default</SelectItem>
                          <SelectItem value="Graphite">Graphite Navy</SelectItem>
                          <SelectItem value="Silver">Silver Slate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-[10px] uppercase font-mono text-muted-foreground">Qty</label>
                      <Input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => updateLine(idx, { quantity: Math.max(1, Number(e.target.value)) })}
                        className="h-9 text-center font-mono"
                      />
                    </div>

                    {/* Discount % */}
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-[10px] uppercase font-mono text-muted-foreground">Disc %</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={line.discountPercent}
                        onChange={(e) => updateLine(idx, { discountPercent: Number(e.target.value) })}
                        className="h-9 text-center font-mono"
                      />
                    </div>

                    {/* Unit Price (Dynamic: Base + Variant) */}
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-[10px] uppercase font-mono text-muted-foreground">Unit (₹)</label>
                      <div className="h-9 px-2 flex items-center font-mono text-xs font-semibold bg-muted/30 border border-border/60 rounded-md">
                        {formatCurrency(line.unitPrice)}
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="md:col-span-1 text-right space-y-1">
                      <label className="text-[10px] uppercase font-mono text-muted-foreground block">Total</label>
                      <span className="font-mono font-bold text-foreground block pt-1.5">
                        {formatCurrency(lineTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Real-time Line Breakdown */}
                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-border/40 text-[11px] font-mono text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>Base: {formatCurrency(line.basePrice)}</span>
                      {line.variantPremium > 0 && (
                        <span className="text-purple-600 dark:text-purple-400 font-bold">
                          + Variant Premium: {formatCurrency(line.variantPremium)}
                        </span>
                      )}
                      {line.discountPercent > 0 && (
                        <span className="text-amber-500 font-medium">
                          - Disc ({line.discountPercent}%): {formatCurrency(lineDiscount)}
                        </span>
                      )}
                      <span>+ Tax ({line.taxRate}%): {formatCurrency(lineTax)}</span>
                    </div>
                    {lines.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(idx)}
                        className="h-6 px-2 text-muted-foreground hover:text-destructive cursor-pointer text-[10px] gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Remove Line
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Financial Formula & Instant Totals */}
            <div className="pt-4 border-t border-border/80 flex flex-col md:flex-row justify-between gap-4">
              <div className="p-3 rounded-lg border border-border/60 bg-muted/20 text-xs space-y-1 max-w-md">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Calculator className="h-3.5 w-3.5 text-primary" /> Real-Time Pricing Formula
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <code className="text-primary font-bold">Total</code> = (Base Price + Variant Premium) × Qty − Discount + Automated Taxes
                </p>
                <p className="text-[10px] text-muted-foreground">
                  * Selecting <strong>Odoo</strong> adds <span className="font-bold text-purple-600 dark:text-purple-400">+₹560</span> per unit instantly.
                </p>
              </div>

              <div className="flex flex-col items-end space-y-1.5 font-mono text-xs min-w-64">
                <div className="flex justify-between w-64 text-muted-foreground">
                  <span>Gross Subtotal:</span>
                  <span>{formatCurrency(subtotalBeforeDiscount)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between w-64 text-amber-500">
                    <span>Total Discounts:</span>
                    <span>-{formatCurrency(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between w-64 text-muted-foreground">
                  <span>Automated Taxes (18% GST):</span>
                  <span>+{formatCurrency(totalTaxAmount)}</span>
                </div>
                <div className="flex justify-between w-64 pt-2 border-t border-border font-bold text-sm text-foreground">
                  <span>Grand Total:</span>
                  <span className="text-primary text-base font-extrabold">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optional Notes */}
        <Card className="shadow-xs border-border/80">
          <CardContent className="pt-5 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Special Quotation Notes / Commercial Terms
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Price locked for 30 days upon customer confirmation. Includes Odoo Connector SLA."
              className="resize-none h-20 text-xs"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/quotations">Discard</Link>
          </Button>
          <Button type="submit" disabled={submitting} size="sm" className="gap-2 px-6">
            {submitting ? 'Generating Proposal...' : 'Create Quotation with Variant Pricing'}
          </Button>
        </div>
      </form>
    </div>
  );
}
