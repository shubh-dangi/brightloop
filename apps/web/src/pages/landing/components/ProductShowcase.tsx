import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Users,
  Settings,
  Bell,
  Search,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '../../../components/ui/badge';

export function ProductShowcase() {
  return (
    <section className="py-24 bg-muted/20 border-y border-border/70 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Workspace Experience
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Your Entire Subscription Workflow. One Dashboard.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            A cohesive operational command center designed for revenue teams, billing operators, and system
            administrators.
          </p>

          {/* Explanatory Callout Pills around the mockup */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" /> Track subscriptions
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3 w-3" /> Monitor recurring revenue
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/5 text-xs font-medium text-blue-600">
              <FileText className="h-3 w-3" /> Manage invoices
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-xs font-medium text-amber-600">
              <Clock className="h-3 w-3" /> View payment status
            </span>
          </div>
        </div>

        {/* Large Realistic Interactive Application Mockup */}
        <div className="rounded-2xl border border-border/90 bg-card shadow-2xl overflow-hidden transition-all duration-300">
          {/* Top Window Chrome */}
          <div className="flex items-center justify-between border-b border-border/80 px-4 py-3 bg-muted/40">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1 rounded-md bg-background border border-border/60 text-xs text-muted-foreground w-72">
                <Search className="h-3.5 w-3.5" />
                <span>Search subscriptions, invoices, customers...</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-muted-foreground font-mono">System Operational</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                BL
              </div>
            </div>
          </div>

          {/* App Body (Sidebar + Content Area) */}
          <div className="flex flex-col md:flex-row min-h-[520px]">
            {/* Sidebar Mockup */}
            <div className="hidden md:flex flex-col w-56 border-r border-border/70 bg-muted/20 p-4 space-y-6">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                  Core Management
                </div>
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Overview</span>
                </div>
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-muted-foreground hover:bg-muted text-xs font-medium">
                  <CreditCard className="h-4 w-4" />
                  <span>Subscriptions</span>
                </div>
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-muted-foreground hover:bg-muted text-xs font-medium">
                  <FileText className="h-4 w-4" />
                  <span>Invoices</span>
                </div>
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-muted-foreground hover:bg-muted text-xs font-medium">
                  <Users className="h-4 w-4" />
                  <span>Customers</span>
                </div>
              </div>

              <div className="space-y-1 pt-4 border-t border-border/60">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                  Configuration
                </div>
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-muted-foreground hover:bg-muted text-xs font-medium">
                  <Settings className="h-4 w-4" />
                  <span>Fiscal Settings</span>
                </div>
              </div>

              <div className="mt-auto p-3 rounded-lg bg-card border border-border/80 text-xs space-y-1">
                <div className="font-semibold text-foreground">Workspace Tier</div>
                <div className="text-[11px] text-muted-foreground">Enterprise Multi-Tenant</div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-5 sm:p-7 space-y-6 bg-background/50">
              {/* Metrics Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Annual Run Rate</span>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">$579,000</div>
                  <div className="text-[11px] text-emerald-600 font-medium">+$42,100 this quarter</div>
                </div>
                <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Active Subscriptions</span>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">1,280</div>
                  <div className="text-[11px] text-emerald-600 font-medium">99.4% retention rate</div>
                </div>
                <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Collected Cash (MTD)</span>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">$41,830</div>
                  <div className="text-[11px] text-muted-foreground">87% settled automatically</div>
                </div>
                <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">Open Balance</span>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">$6,420</div>
                  <div className="text-[11px] text-amber-600 font-medium">14 pending invoices</div>
                </div>
              </div>

              {/* Graphical Overview & Real-time Ledger */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Visual Revenue Trajectory */}
                <div className="lg:col-span-7 rounded-xl border border-border/80 bg-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Recurring Revenue Velocity</h4>
                      <p className="text-xs text-muted-foreground">Calculated across 12 consecutive months</p>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs text-emerald-600 bg-emerald-500/10">
                      +18.4% YoY
                    </Badge>
                  </div>

                  {/* High visual bar graphic */}
                  <div className="h-36 flex items-end gap-2 pt-4">
                    {[
                      { m: 'Jan', val: 35 },
                      { m: 'Feb', val: 42 },
                      { m: 'Mar', val: 48 },
                      { m: 'Apr', val: 51 },
                      { m: 'May', val: 56 },
                      { m: 'Jun', val: 62 },
                      { m: 'Jul', val: 68 },
                      { m: 'Aug', val: 71 },
                      { m: 'Sep', val: 77 },
                      { m: 'Oct', val: 84 },
                      { m: 'Nov', val: 89 },
                      { m: 'Dec', val: 98 },
                    ].map((item, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div
                          style={{ height: `${item.val}%` }}
                          className={`w-full rounded-xs transition-all ${
                            i >= 10 ? 'bg-primary' : 'bg-primary/35 hover:bg-primary/50'
                          }`}
                        />
                        <span className="text-[10px] font-mono text-muted-foreground">{item.m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Billing Ledger Table */}
                <div className="lg:col-span-5 rounded-xl border border-border/80 bg-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">Live Subscription Activity</h4>
                    <span className="text-[11px] text-muted-foreground">Auto-reconciled</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-foreground">Acme Global</div>
                        <div className="text-[11px] text-muted-foreground">INV-2026-0891 • Annual</div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className="font-mono font-bold text-foreground">$12,000</div>
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          Paid
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-foreground">Northwind Labs</div>
                        <div className="text-[11px] text-muted-foreground">INV-2026-0892 • Pro Tier</div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className="font-mono font-bold text-foreground">$240</div>
                        <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20">
                          Active
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-foreground">Vanguard AI</div>
                        <div className="text-[11px] text-muted-foreground">INV-2026-0893 • Custom Plan</div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className="font-mono font-bold text-foreground">$4,500</div>
                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                          Pending
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
