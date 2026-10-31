import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  CreditCard,
  Users,
  FileCheck2,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

export function HeroSection() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Subtle Background Lighting & Mesh (Following THEME.md) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Value Prop */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            {/* Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary select-none">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Subscription Lifecycle Engine</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.12]">
              Subscription Management,{' '}
              <span className="text-primary block mt-1">Without the Complexity.</span>
            </h1>

            {/* Supporting Description */}
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              Manage plans, automate recurring billing, track payments, and understand your
              revenue — all from one powerful platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto h-12 px-7 text-base font-medium shadow-md hover:shadow-lg cursor-pointer gap-2"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToFeatures}
                className="w-full sm:w-auto h-12 px-7 text-base font-medium hover:bg-muted/80 cursor-pointer"
              >
                Explore Features
              </Button>
            </div>

            {/* Small Supporting Text */}
            <p className="text-xs text-muted-foreground/90 font-medium">
              Everything you need to manage your subscription business.
            </p>

            {/* Trust Highlights */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Zero complex manual setups</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Automated tax & prorations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Enterprise multi-tenancy & RBAC</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Realistic SaaS Dashboard Mockup */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none rounded-2xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-md p-5 sm:p-6 space-y-5 transition-all duration-300 hover:border-primary/40">
              {/* Dashboard Preview Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="ml-2 text-xs font-semibold text-foreground/80 tracking-tight">
                    Brightloop Command Center
                  </span>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono bg-muted/60 text-muted-foreground">
                  Demo Preview
                </Badge>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Metric 1: MRR */}
                <div className="rounded-xl border border-border/60 bg-background/60 p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Monthly Recurring</span>
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
                    ₹48,250
                  </div>
                  <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                    <span>+14.2%</span>
                    <span className="text-muted-foreground font-normal">vs last month</span>
                  </div>
                </div>

                {/* Metric 2: Active Subscriptions */}
                <div className="rounded-xl border border-border/60 bg-background/60 p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Active Plans</span>
                    <CreditCard className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
                    1,280
                  </div>
                  <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                    <span>+8.4%</span>
                    <span className="text-muted-foreground font-normal">net growth</span>
                  </div>
                </div>

                {/* Metric 3: Total Customers */}
                <div className="rounded-xl border border-border/60 bg-background/60 p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Subscribers</span>
                    <Users className="h-3.5 w-3.5 text-indigo-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
                    940
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Across 18 enterprise tiers
                  </div>
                </div>

                {/* Metric 4: Invoices Due */}
                <div className="rounded-xl border border-border/60 bg-background/60 p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[11px] font-medium uppercase tracking-wider">Pending Invoices</span>
                    <FileCheck2 className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
                    ₹6,420
                  </div>
                  <div className="text-[11px] text-amber-600 font-medium">
                    14 invoices due for renewal
                  </div>
                </div>
              </div>

              {/* Mini Sparkline Chart Preview */}
              <div className="rounded-xl border border-border/60 bg-background/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Revenue Run Rate (ARR Trajectory)</span>
                  <span className="text-emerald-600 font-medium font-mono">₹579,000 ARR</span>
                </div>
                {/* SVG Visual Bars */}
                <div className="h-14 flex items-end gap-1.5 pt-2">
                  {[38, 42, 45, 52, 49, 58, 64, 60, 72, 78, 85, 96].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        style={{ height: `${val}%` }}
                        className={`w-full rounded-xs transition-all ${
                          idx === 11 ? 'bg-primary' : 'bg-primary/30 hover:bg-primary/50'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Subscription Activity Stream */}
              <div className="rounded-xl border border-border/60 bg-background/60 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span>Recent Lifecycle Activity</span>
                  <span className="text-[11px] text-muted-foreground font-normal">Real-time sync</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="font-medium text-foreground">Apex Dynamics</span>
                      <span className="text-muted-foreground">• Enterprise Plan</span>
                    </div>
                    <span className="font-mono text-foreground font-medium">+₹2,400/yr</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="font-medium text-foreground">Horizon Cloud</span>
                      <span className="text-muted-foreground">• Pro Monthly</span>
                    </div>
                    <span className="font-mono text-foreground font-medium">+₹180/mo</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-indigo-500" />
                      <span className="font-medium text-foreground">Kestrel Logic</span>
                      <span className="text-muted-foreground">• Quote Approved</span>
                    </div>
                    <span className="text-emerald-600 font-medium text-[11px]">Active</span>
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
