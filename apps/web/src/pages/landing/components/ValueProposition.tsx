import React from 'react';
import { Layers, RefreshCw, Eye, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';

export function ValueProposition() {
  const propositions = [
    {
      icon: Layers,
      title: 'One Centralized Platform',
      description:
        'Manage customers, plans, subscriptions, and invoices in one place without switching tools.',
      badge: 'Unified Core',
    },
    {
      icon: RefreshCw,
      title: 'Automated Recurring Billing',
      description:
        'Reduce manual overhead with scheduled invoice generation tailored to customer billing cycles.',
      badge: 'Zero Manual Work',
    },
    {
      icon: Eye,
      title: 'Complete Payment Visibility',
      description:
        'Track settled receipts, pending balances, and overdue invoices with comprehensive audit logs.',
      badge: 'Real-Time Reconciliation',
    },
    {
      icon: BarChart3,
      title: 'Clear Revenue Insights',
      description:
        'Understand subscription velocity, MRR changes, and cohort retention through executive dashboards.',
      badge: 'Actionable Intelligence',
    },
  ];

  return (
    <section className="py-20 bg-muted/20 border-y border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Everything Your Subscription Business Needs.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Purpose-built architectural simplicity to eliminate billing fragmentation, reduce revenue leakage,
            and maintain total financial control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {propositions.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                className="border-border/80 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-md group"
              >
                <CardContent className="pt-6 pb-6 px-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
