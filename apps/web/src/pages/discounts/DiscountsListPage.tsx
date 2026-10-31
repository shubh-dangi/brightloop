import React, { useState, useEffect } from 'react';
import {
  Percent,
  Search,
  Plus,
  Tag,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { DiscountDto, DiscountType, DiscountScope } from '@brightloop/contracts';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { formatDate } from '../../lib/utils';

export function DiscountsListPage() {
  const { role } = useAuthStore();
  const [discounts, setDiscounts] = useState<DiscountDto[]>([]);
  const [loading, setLoading] = useState(true);
  const isStaff = role === 'MEMBER' || role === 'VIEWER';

  // Calculator test state for Staff
  const [testCode, setTestCode] = useState('VOLUME15');
  const [testAmount, setTestAmount] = useState('500');
  const [testQty, setTestQty] = useState('5');
  const [calcResult, setCalcResult] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const fetchDiscounts = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/discounts');
        setDiscounts(res.data?.data || []);
      } catch {
        // Fallback demo discounts
        setDiscounts([
          {
            id: 'disc-1',
            organizationId: 'org-1',
            name: 'Volume Seat Discount 15%',
            code: 'VOLUME15',
            type: DiscountType.PERCENTAGE,
            value: 15.0,
            minPurchase: 0,
            minQuantity: 5,
            startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
            endDate: new Date(Date.now() + 60 * 86400000).toISOString(),
            maxUsage: 100,
            usedCount: 14,
            scope: DiscountScope.WHOLE_SUBSCRIPTION,
            applicableProductIds: [],
            createdAt: new Date().toISOString(),
          },
          {
            id: 'disc-2',
            organizationId: 'org-1',
            name: 'New Startup Credit (₹50)',
            code: 'STARTUP50',
            type: DiscountType.FIXED,
            value: 50.0,
            minPurchase: 100,
            minQuantity: 1,
            startDate: null,
            endDate: null,
            maxUsage: 250,
            usedCount: 42,
            scope: DiscountScope.WHOLE_SUBSCRIPTION,
            applicableProductIds: [],
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  const handleTestDiscount = async () => {
    setCalculating(true);
    setCalcResult(null);
    try {
      const res = await apiClient.post('/discounts/validate', {
        code: testCode,
        purchaseAmount: Number(testAmount),
        quantity: Number(testQty),
      });
      setCalcResult(res.data?.data);
    } catch (err: any) {
      setCalcResult({
        error: err.response?.data?.message || 'Discount not applicable for these terms.',
      });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotional Discounts"
        description="View approved coupon rules, volume discount thresholds, and validate eligibility terms."
        breadcrumbs={[
          { label: 'Workspace', href: '/dashboard' },
          { label: 'Discounts' },
        ]}
        actions={
          isStaff ? (
            <Badge variant="outline" className="font-mono text-xs gap-1.5 py-1 px-2.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Staff View (View & Apply Only)
            </Badge>
          ) : (
            <Button className="gap-2 cursor-pointer">
              <Plus className="h-4 w-4" /> Create Discount Rule
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discounts List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {discounts.map((disc) => (
                <Card key={disc.id} className="border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="font-mono text-[11px] font-bold text-primary">
                        {disc.code}
                      </Badge>
                      <span className="font-mono font-bold text-base text-foreground">
                        {disc.type === 'PERCENTAGE' ? `${disc.value}% OFF` : `₹${disc.value} OFF`}
                      </span>
                    </div>
                    <CardTitle className="text-sm font-semibold">{disc.name}</CardTitle>
                    <CardDescription className="text-xs">
                      Scope: {disc.scope === 'WHOLE_SUBSCRIPTION' ? 'Whole Subscription' : 'Specific Products'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2.5 pt-2 text-xs border-t border-border/60">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Minimum Seats / Qty:</span>
                      <span className="font-mono font-medium text-foreground">
                        {disc.minQuantity > 0 ? `${disc.minQuantity} items` : 'No minimum'}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Minimum Purchase:</span>
                      <span className="font-mono font-medium text-foreground">
                        {disc.minPurchase > 0 ? `₹${disc.minPurchase.toFixed(2)}` : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Usage Quota:</span>
                      <span className="font-mono font-medium text-foreground">
                        {disc.usedCount} / {disc.maxUsage ? disc.maxUsage : 'Unlimited'}
                      </span>
                    </div>
                    {disc.endDate && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Expires On:</span>
                        <span className="font-mono text-muted-foreground">{formatDate(disc.endDate)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Staff Discount Eligibility Tester */}
        <Card className="shadow-sm border-border h-fit">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" /> Discount Calculator
            </CardTitle>
            <CardDescription className="text-xs">
              Staff tool to verify customer discount eligibility before quotation generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">
                Coupon Code
              </label>
              <Input
                value={testCode}
                onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                className="font-mono uppercase font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">
                Gross Order Amount (₹)
              </label>
              <Input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">
                Allocated Seats / Quantity
              </label>
              <Input
                type="number"
                value={testQty}
                onChange={(e) => setTestQty(e.target.value)}
                className="font-mono"
              />
            </div>

            <Button
              onClick={handleTestDiscount}
              disabled={calculating}
              className="w-full text-xs h-9 gap-1.5"
            >
              {calculating ? <Spinner size="sm" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Validate Eligibility
            </Button>

            {calcResult && (
              <div className="mt-3 p-3 rounded-lg border border-border/80 bg-background/50 space-y-1.5">
                {calcResult.error ? (
                  <div className="flex items-start gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-xs">{calcResult.error}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between font-mono">
                      <span className="text-muted-foreground">Discount Applied:</span>
                      <span className="text-emerald-500 font-bold">
                        -${calcResult.discountAmount?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono pt-1 border-t border-border">
                      <span className="font-semibold text-foreground">Discounted Total:</span>
                      <span className="font-bold text-primary">
                        ${calcResult.finalAmount?.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
