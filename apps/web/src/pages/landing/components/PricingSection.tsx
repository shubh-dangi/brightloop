import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';

export function PricingSection() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      description: 'Ideal for early-stage subscription businesses launching their first recurring tiers.',
      price: '₹3,999',
      interval: '/month',
      badge: 'Early Stage',
      popular: false,
      features: [
        'Up to 250 active subscriptions',
        'Automated monthly recurring billing',
        'Standard catalog products & plan variants',
        'Customer self-service portal',
        'Basic revenue & churn reporting',
        'Standard tax calculations',
      ],
    },
    {
      name: 'Growth',
      description: 'Engineered for scaling SaaS companies requiring multi-interval billing and quotations.',
      price: '₹9,999',
      interval: '/month',
      badge: 'Most Popular',
      popular: true,
      features: [
        'Up to 2,500 active subscriptions',
        'Automated recurring billing (monthly & annual)',
        'Quote-to-subscription pipeline & approvals',
        'Discount codes & promotional schedules',
        'Multi-currency invoice generation',
        'Role-Based Access Control (Admin & Staff)',
        'Detailed MRR / ARR cohort analytics',
      ],
    },
    {
      name: 'Enterprise',
      description: 'For high-volume operations requiring dedicated governance and custom terms.',
      price: 'Custom',
      interval: '',
      badge: 'High Volume',
      popular: false,
      features: [
        'Unlimited active subscriptions',
        'Custom billing frequencies & complex prorations',
        'Enterprise multi-tenant isolation',
        'Audit logs & compliance reporting',
        'Dedicated onboarding & priority SLA',
        'Custom invoice templates & tax jurisdictions',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-background scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Simple Plans for Every Stage of Growth.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Straightforward pricing with zero hidden transaction surcharges. Scale your subscription revenue
            with predictable operations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <Card
              key={idx}
              className={`border transition-all duration-300 flex flex-col justify-between ${
                plan.popular
                  ? 'border-primary shadow-xl bg-card relative lg:-translate-y-2'
                  : 'border-border/80 bg-card/60 hover:bg-card hover:border-primary/40'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1 shadow-sm">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardContent className="p-7 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    {!plan.popular && (
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground font-mono">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">
                      {plan.interval}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-border/60 space-y-2.5">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                      Included in this plan:
                    </span>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={() => navigate('/signup')}
                    variant={plan.popular ? 'default' : 'outline'}
                    className="w-full gap-2 font-medium cursor-pointer"
                  >
                    Get Started with {plan.name}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
