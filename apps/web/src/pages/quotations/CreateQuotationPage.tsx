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
import { toast } from 'sonner';

interface LineItemState {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
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

        // Pre-fill first product line
        if (fetchedProds.length > 0) {
          setLines([
            {
              productId: fetchedProds[0].id,
              quantity: 1,
              unitPrice: fetchedProds[0].salesPrice,
              taxRate: 10,
            },
          ]);
        }
      } catch {
        // Fallback demo options
        setCustomers([
          { id: 'cust-1', name: 'Acme Corporation', email: 'procurement@acme-corp.com', organizationId: '', createdById: '', createdAt: '', updatedAt: '' },
          { id: 'cust-2', name: 'Apex Retailers Inc.', email: 'billing@apexretail.com', organizationId: '', createdById: '', createdAt: '', updatedAt: '' },
        ]);
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
            quantity: 1,
            unitPrice: 120.0,
            taxRate: 10,
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
      setLines([
        ...lines,
        {
          productId: products[0].id,
          quantity: 1,
          unitPrice: products[0].salesPrice,
          taxRate: 10,
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
    updated[index] = { ...updated[index], ...updates };

    // If product changed, update base unit price
    if (updates.productId) {
      const prod = products.find((p) => p.id === updates.productId);
      if (prod) {
        updated[index].unitPrice = prod.salesPrice;
        updated[index].variantId = undefined;
      }
    }

    // If variant changed, adjust price
    if (updates.variantId !== undefined) {
      const prod = products.find((p) => p.id === updated[index].productId);
      if (prod) {
        const variant = prod.variants?.find((v) => v.id === updates.variantId);
        updated[index].unitPrice = prod.salesPrice + (variant?.additionalPrice || 0);
      }
    }

    setLines(updated);
  };

  // Financial totals calculation
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const taxAmount = lines.reduce(
    (sum, l) => sum + (l.unitPrice * l.quantity * l.taxRate) / 100,
    0,
  );
  const grandTotal = subtotal + taxAmount;

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
        notes,
        lines: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId || null,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          taxRate: Number(l.taxRate),
        })),
      };

      const res = await apiClient.post('/quotations', payload);
      toast.success('Quotation created successfully');
      navigate(`/quotations/${res.data?.data?.id || ''}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create quotation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Create Quotation"
        description="Draft a formal commercial offer with customized line items, variant additions, and validity terms."
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Quotations', href: '/quotations' },
          { label: 'New Quotation' },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/quotations">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Cancel
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Metadata Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" /> Offer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Customer *
              </label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
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
              />
            </div>
          </CardContent>
        </Card>

        {/* Product & Plan Line Items Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Products & Variants
              </CardTitle>
              <CardDescription className="text-xs">
                Select line items, choose optional brand/tier variants, and set quantities.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLine}
              className="gap-1.5 text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5" /> Add Line
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {lines.map((line, idx) => {
              const currentProd = products.find((p) => p.id === line.productId);
              const lineTotal =
                line.unitPrice * line.quantity +
                (line.unitPrice * line.quantity * line.taxRate) / 100;

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-border bg-background/50 grid grid-cols-12 gap-3 items-center text-xs"
                >
                  <div className="col-span-4 space-y-1">
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

                  <div className="col-span-3 space-y-1">
                    <label className="text-[10px] uppercase font-mono text-muted-foreground">Variant Tier</label>
                    <Select
                      value={line.variantId || 'none'}
                      onValueChange={(val) =>
                        updateLine(idx, { variantId: val === 'none' ? undefined : val })
                      }
                      disabled={!currentProd?.variants?.length}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Standard" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Standard (+0)</SelectItem>
                        {currentProd?.variants?.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name} (+₹{v.additionalPrice})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-1 space-y-1">
                    <label className="text-[10px] uppercase font-mono text-muted-foreground">Qty</label>
                    <Input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })}
                      className="h-9 text-center font-mono"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-mono text-muted-foreground">Unit Price</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) => updateLine(idx, { unitPrice: Number(e.target.value) })}
                      className="h-9 font-mono"
                    />
                  </div>

                  <div className="col-span-1 text-right space-y-1">
                    <label className="text-[10px] uppercase font-mono text-muted-foreground block">Total</label>
                    <span className="font-mono font-bold text-foreground block pt-1.5">
                      ₹{lineTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="col-span-1 flex justify-end pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(idx)}
                      disabled={lines.length === 1}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Financial Summary */}
            <div className="pt-4 border-t border-border/80 flex flex-col items-end space-y-1.5 font-mono text-xs">
              <div className="flex justify-between w-64 text-muted-foreground">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-muted-foreground">
                <span>Taxes (Estimated 10%):</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 pt-2 border-t border-border font-bold text-sm text-foreground">
                <span>Grand Total:</span>
                <span className="text-primary text-base">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optional Notes */}
        <Card className="shadow-sm">
          <CardContent className="pt-5 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Special Quotation Notes / Commercial Terms
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Price locked for 30 days upon customer confirmation."
              className="resize-none h-20 text-xs"
            />
          </CardContent>
        </Card>

        {/* Submission Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button asChild type="button" variant="outline">
            <Link to="/quotations">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting} className="gap-2">
            {submitting && <Spinner size="sm" />}
            Create Quotation Offer
          </Button>
        </div>
      </form>
    </div>
  );
}
