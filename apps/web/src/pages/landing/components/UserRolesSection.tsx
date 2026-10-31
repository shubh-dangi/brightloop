import React from 'react';
import { ShieldAlert, UserCog, UserCheck, Check } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

export function UserRolesSection() {
  const roles = [
    {
      title: 'Administrator',
      roleKey: 'System Admin',
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
      icon: ShieldAlert,
      tagline: 'Governance, system configuration, and financial auditing',
      description:
        'Complete control over products, plans, staff, subscriptions, billing, discounts, taxes, and reports.',
      permissions: [
        'Global product & plan catalog governance',
        'Staff invite & granular permission administration',
        'Tax rate & discount rule configuration',
        'Executive revenue & audit log access',
        'Workspace billing and data exports',
      ],
    },
    {
      title: 'Internal Staff',
      roleKey: 'Operations & Billing',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      icon: UserCog,
      tagline: 'Day-to-day customer and billing operations',
      description:
        'Manage day-to-day customer, subscription, invoice, and payment operations with controlled access.',
      permissions: [
        'Customer record updates & contact management',
        'Drafting & sending customized pricing quotations',
        'Subscription pause, resume, and plan renewals',
        'Payment recording & invoice status verification',
        'Routine operational reporting',
      ],
    },
    {
      title: 'Customer',
      roleKey: 'Subscriber Portal',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      icon: UserCheck,
      tagline: 'Transparent self-service subscription management',
      description:
        'View and manage their own subscriptions, invoices, and payment history.',
      permissions: [
        'Self-service plan view & upgrade requests',
        'Instant download of PDF tax invoices',
        'Complete payment history & receipts ledger',
        'Account profile & billing details management',
        'Transparent renewal schedule visibility',
      ],
    },
  ];

  return (
    <section id="solutions" className="py-24 bg-background scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Access Control & RBAC
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Designed for Every Role in Your Business.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Role-Based Access Control (RBAC) guarantees that every stakeholder sees exactly what they need
            while preserving data integrity and privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <Card
                key={idx}
                className="border-border/80 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
              >
                <CardContent className="pt-7 pb-7 px-6 space-y-6 flex-1 flex flex-col">
                  {/* Card Header */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className={`text-xs font-mono ${role.badgeColor}`}>
                        {role.roleKey}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-foreground tracking-tight">
                      {role.title}
                    </h3>
                    <p className="text-xs text-primary font-medium">
                      {role.tagline}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  {/* Capabilities List */}
                  <div className="pt-4 border-t border-border/60 space-y-2.5 flex-1">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                      Scope of Access:
                    </span>
                    {role.permissions.map((perm, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{perm}</span>
                      </div>
                    ))}
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
