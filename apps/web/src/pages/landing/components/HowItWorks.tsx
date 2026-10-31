import React from 'react';
import { Building2, Sliders, LineChart, ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Set Up Your Business',
      description: 'Add your customers, products, and subscription plans with custom billing intervals.',
      icon: Building2,
      details: 'Configure products, plan tiers, and default tax rules in minutes.',
    },
    {
      number: '02',
      title: 'Manage Subscriptions',
      description: 'Create quotations, confirm subscriptions, and manage their complete lifecycle.',
      icon: Sliders,
      details: 'Seamlessly transition quotes to active subscriptions with proration support.',
    },
    {
      number: '03',
      title: 'Track Billing & Revenue',
      description: 'Automate recurring invoices and monitor payments, cash collection, and MRR.',
      icon: LineChart,
      details: 'Real-time ledgers, aging invoice summaries, and financial reports.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-background scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Operational Flow
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Get Started in Three Simple Steps.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            A frictionless deployment path designed to get your subscription billing operational without weeks of integration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Subtle Horizontal Connecting Bar on Desktop */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-border/80 -translate-y-8 z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative z-10 rounded-2xl border border-border/80 bg-card p-7 space-y-5 transition-all duration-300 hover:border-primary/50 hover:shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm group-hover:scale-105 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-bold font-mono text-muted-foreground/30 group-hover:text-primary/40 transition-colors">
                    {step.number}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 text-xs text-muted-foreground">
                  {step.details}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
