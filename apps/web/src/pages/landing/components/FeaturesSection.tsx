import React from 'react';
import {
  CreditCard,
  FileText,
  Package,
  Users,
  Percent,
  Receipt,
  FileSpreadsheet,
  LineChart,
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';

export function FeaturesSection() {
  const features = [
    {
      icon: CreditCard,
      title: 'Subscription Management',
      description:
        'Create, manage, pause, renew, and close subscriptions according to flexible plan policies.',
      tag: 'Lifecycle Engine',
    },
    {
      icon: FileText,
      title: 'Recurring Invoicing',
      description:
        'Generate invoices automatically based on subscription billing cycles with prorations and PDF exports.',
      tag: 'Automated Billing',
    },
    {
      icon: Package,
      title: 'Product & Plan Management',
      description:
        'Manage catalog products, variants, recurring prices, and multi-interval billing frequencies.',
      tag: 'Catalog Architecture',
    },
    {
      icon: Users,
      title: 'Customer Management',
      description:
        'Keep customer records, assigned tier levels, and complete subscription history organized.',
      tag: 'Account Records',
    },
    {
      icon: Percent,
      title: 'Discounts & Taxes',
      description:
        'Configure percentage and fixed discount schedules alongside jurisdiction-specific tax calculations.',
      tag: 'Fiscal Rules',
    },
    {
      icon: Receipt,
      title: 'Payment Tracking',
      description:
        'Record settled payments and monitor paid, outstanding, and overdue amounts with clear ledger states.',
      tag: 'Cash Realization',
    },
    {
      icon: FileSpreadsheet,
      title: 'Quotations',
      description:
        'Draft quotations using reusable pricing templates and seamlessly convert approved quotes into active subscriptions.',
      tag: 'CPQ Pipeline',
    },
    {
      icon: LineChart,
      title: 'Finance Dashboard',
      description:
        'Monitor monthly recurring revenue (MRR), subscriber growth, payment velocity, and aging invoices in real-time.',
      tag: 'Executive Intelligence',
    },
  ];

  return (
    <section id="features" className="py-24 bg-background scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Powerful Features. Simple Management.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Engineered to handle every stage of recurring commerce without the bloat of legacy billing suites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-border/70 bg-card/60 hover:bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group"
              >
                <CardContent className="pt-6 pb-6 px-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-foreground tracking-tight pt-1">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
