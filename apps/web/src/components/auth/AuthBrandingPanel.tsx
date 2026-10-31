import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CreditCard,
  FileCheck2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { BrightloopLogo } from '../common/BrightloopLogo';

interface AuthBrandingPanelProps {
  heading: string;
  subheading: string;
  type?: 'login' | 'signup' | 'reset';
  benefits?: string[];
}

export function AuthBrandingPanel({
  heading,
  subheading,
  type = 'login',
  benefits,
}: AuthBrandingPanelProps) {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-1/2 p-12 bg-slate-950 text-white overflow-hidden border-r border-border/40 select-none">
      {/* Background radial accent glow per THEME.md */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10">
        <Link to="/" className="inline-block" aria-label="Brightloop Home">
          <BrightloopLogo size="lg" className="text-white" />
        </Link>
      </div>

      {/* Center Branding Content */}
      <div className="relative z-10 space-y-8 my-auto py-8">
        <div className="space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs font-semibold text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Recurring Revenue Infrastructure</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {heading}
          </h2>

          <p className="text-slate-400 text-base leading-relaxed">
            {subheading}
          </p>
        </div>

        {/* Dynamic Visual Content */}
        {type === 'login' ? (
          /* Live Dashboard Preview Card */
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 space-y-4 shadow-2xl backdrop-blur-md max-w-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono text-slate-300">Live Workspace Pulse</span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Active Cycle
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[10px] text-slate-400 font-medium">Subscriptions</div>
                <div className="text-lg font-bold font-mono text-white">1,280</div>
                <div className="text-[10px] text-emerald-400 font-medium">+8% MoM</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[10px] text-slate-400 font-medium">Monthly MRR</div>
                <div className="text-lg font-bold font-mono text-white">$48.2k</div>
                <div className="text-[10px] text-emerald-400 font-medium">+14.2%</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[10px] text-slate-400 font-medium">Pending Inv.</div>
                <div className="text-lg font-bold font-mono text-amber-400">14</div>
                <div className="text-[10px] text-slate-400">Auto-dunning</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-white/5">
              <span>Tenant Security Isolation</span>
              <span className="text-white font-mono font-medium">Argon2id + JWT</span>
            </div>
          </div>
        ) : (
          /* Benefits List Card */
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-4 shadow-2xl backdrop-blur-md max-w-md">
            <div className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
              Core Capabilities Included
            </div>
            <div className="space-y-3">
              {(
                benefits || [
                  'Automate recurring billing & invoice generation',
                  'Centralized catalog & customer subscription tracking',
                  'Real-time cash flow & MRR analytics',
                ]
              ).map((benefit, bIdx) => (
                <div key={bIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Note */}
      <div className="relative z-10 text-xs text-slate-400 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <span>Enterprise-grade security and role-based data isolation.</span>
      </div>
    </div>
  );
}
