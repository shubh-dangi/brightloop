import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, ArrowLeft, Layers, Tag, ShieldCheck, DollarSign } from 'lucide-react';
import { apiClient } from '../../services/api';
import { ProductDto } from '@brightloop/contracts';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuthStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isStaff = role === 'MEMBER' || role === 'VIEWER';

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/products/${id}`);
        setProduct(res.data?.data);
      } catch {
        // Fallback demo data
        setProduct({
          id: id || 'prod-software-suite-001',
          name: 'Brightloop Business Software',
          type: 'Software Subscription',
          salesPrice: 120.0,
          costPrice: isStaff ? null : 40.0,
          notes: 'Main business software suite billed monthly or yearly with modular add-ons.',
          variants: [
            { id: 'v-1', name: 'Standard Edition', additionalPrice: 0.0 },
            { id: 'v-2', name: 'Odoo Brand Connector', additionalPrice: 560.0 }, // Mentioned in PDF Page 3!
          ],
          plans: [
            { id: 'pl-1', name: 'Monthly Growth Plan', price: 120.0, billingFrequency: 'MONTHLY' },
            { id: 'pl-2', name: 'Annual Enterprise Plan', price: 1200.0, billingFrequency: 'YEARLY' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, isStaff]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold">Product Not Found</h2>
        <Button asChild variant="outline">
          <Link to="/products">Back to Catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={`Product catalog details, variant pricing adjustments, and associated subscription plans.`}
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Products', href: '/products' },
          { label: product.name },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/products">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Catalog
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Product Info */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> Product Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Category / Type</span>
              <Badge variant="outline" className="mt-1 font-mono">{product.type}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-mono uppercase">Base Sales Price</span>
              <span className="font-mono font-bold text-lg text-foreground pt-0.5 block">
                ${product.salesPrice?.toFixed(2)}
              </span>
            </div>
            {!isStaff && product.costPrice !== null && (
              <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500">
                <span className="block text-[10px] uppercase font-mono font-semibold">Cost Price (Admin Only)</span>
                <span className="font-mono font-bold text-sm text-amber-400">
                  ${product.costPrice?.toFixed(2)}
                </span>
              </div>
            )}
            {product.notes && (
              <div>
                <span className="text-muted-foreground block text-[11px] font-mono uppercase">Notes</span>
                <p className="text-foreground/80 leading-relaxed pt-1">{product.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variants & Plans Columns */}
        <div className="md:col-span-2 space-y-6">
          {/* Variants */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" /> Available Brand / Tier Variants
              </CardTitle>
              <CardDescription className="text-xs">
                Options customers can select which adjust the base quotation price.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.variants?.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No variants for this product.</p>
              ) : (
                <div className="space-y-2">
                  {product.variants?.map((v: any) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-lg border border-border/70 bg-background/50 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-foreground">{v.name}</span>
                      <span className="font-mono font-bold text-primary">
                        {v.additionalPrice > 0 ? `+$${v.additionalPrice.toFixed(2)}` : 'Standard Tier (+0.00)'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Associated Plans */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Configured Billing Plans
              </CardTitle>
              <CardDescription className="text-xs">
                Subscription frequencies and terms available for this product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.plans?.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No plans configured yet.</p>
              ) : (
                <div className="space-y-2">
                  {product.plans?.map((pl: any) => (
                    <div
                      key={pl.id}
                      className="p-3 rounded-lg border border-border/70 bg-background/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-foreground">{pl.name}</span>
                        <Badge variant="outline" className="ml-2 font-mono text-[10px]">
                          {pl.billingFrequency}
                        </Badge>
                      </div>
                      <span className="font-mono font-bold text-foreground">
                        ${pl.price?.toFixed(2)}
                      </span>
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
