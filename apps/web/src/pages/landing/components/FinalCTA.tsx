import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl border border-primary/30 bg-gradient-to-b from-card via-card to-primary/5 p-10 sm:p-16 text-center shadow-2xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Transform Your Billing Operations</span>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Ready to Simplify Your Subscription Management?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Bring your subscriptions, billing, payments, and revenue insights together with Brightloop.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-md hover:shadow-lg cursor-pointer gap-2"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto h-12 px-8 text-base font-medium hover:bg-muted/80 cursor-pointer"
            >
              Log In
            </Button>
          </div>

          <div className="pt-4 text-xs text-muted-foreground flex items-center justify-center gap-6">
            <span>Fast setup</span>
            <span>•</span>
            <span>Multi-tenant architecture</span>
            <span>•</span>
            <span>Role-based access</span>
          </div>
        </div>
      </div>
    </section>
  );
}
