import React from 'react';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

export function BenefitsSection() {
  const benefits = [
    {
      title: 'Reduce repetitive billing tasks',
      description: 'Automate renewal notices, scheduled invoicing, and status updates.',
    },
    {
      title: 'Keep subscription records organized',
      description: 'Consolidate multiple plans, tiers, and customer contact histories.',
    },
    {
      title: 'Avoid missed or duplicate invoice generation',
      description: 'Deterministic cron-driven schedules prevent duplicate billing cycles.',
    },
    {
      title: 'Monitor outstanding payments',
      description: 'Instantly view pending settlements, overdue accounts, and aging balances.',
    },
    {
      title: 'Understand revenue performance',
      description: 'Track MRR growth trajectories, realized cash, and churn velocity accurately.',
    },
    {
      title: 'Manage the complete subscription lifecycle',
      description: 'Seamlessly pause, upgrade, downgrade, renew, or terminate subscriptions.',
    },
  ];

  return (
    <section className="py-24 bg-muted/20 border-y border-border/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Benefits Content List */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                Operational ROI
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Less Manual Work. More Control.
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                Billing mistakes destroy customer trust and create operational chaos. Brightloop delivers
                bulletproof precision so finance teams can focus on strategic growth.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {benefits.map((b, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground tracking-tight">
                      {b.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Automation Ledger Card */}
          <div className="lg:col-span-6">
            <Card className="border-border/80 bg-card shadow-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Automated Recurring Execution
                  </h3>
                  <p className="text-xs text-muted-foreground">Active Billing Run Summary</p>
                </div>
                <Badge variant="outline" className="font-mono text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  Zero Errors
                </Badge>
              </div>

              {/* Status Breakdown Indicators */}
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-medium">
                    <span className="text-foreground">Recurring Invoices Generated</span>
                    <span className="font-mono text-foreground font-semibold">1,280 / 1,280</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-full" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-medium">
                    <span className="text-foreground">Payment Reconciliation Settlement</span>
                    <span className="font-mono text-emerald-600 font-semibold">96.8%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[96.8%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-medium">
                    <span className="text-foreground">Taxes & Jurisdiction Calculations</span>
                    <span className="font-mono text-blue-600 font-semibold">100% Compliant</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-full" />
                  </div>
                </div>
              </div>

              {/* Reconciled Cycle Snapshot */}
              <div className="p-4 rounded-xl border border-border/70 bg-muted/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Financial Consistency Guarantee</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every subscription cycle is verified against multi-currency proration rules and tenant-isolated
                  database constraints before invoices are committed.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
