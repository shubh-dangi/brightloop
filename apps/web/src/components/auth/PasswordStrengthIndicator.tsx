import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordCriteria {
  label: string;
  met: boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const criteria: PasswordCriteria[] = [
    { label: 'Minimum 9 characters', met: password.length >= 9 },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'At least one lowercase letter', met: /[a-z]/.test(password) },
    { label: 'At least one special character (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = criteria.filter((c) => c.met).length;

  const strengthLabel = () => {
    if (metCount === 0) return { text: 'Empty', color: 'bg-muted', textCol: 'text-muted-foreground' };
    if (metCount <= 2) return { text: 'Weak', color: 'bg-red-500', textCol: 'text-red-600' };
    if (metCount === 3) return { text: 'Medium', color: 'bg-amber-500', textCol: 'text-amber-600' };
    return { text: 'Strong', color: 'bg-emerald-500', textCol: 'text-emerald-600' };
  };

  const status = strengthLabel();

  return (
    <div className="space-y-2 pt-1 text-xs">
      {/* Visual meter bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-medium">
          <span className="text-muted-foreground">Password strength:</span>
          <span className={status.textCol}>{status.text}</span>
        </div>
        <div className="flex gap-1 h-1.5 w-full">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex-1 rounded-full transition-all duration-300 ${
                step <= metCount ? status.color : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Criteria checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {criteria.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 transition-colors ${
              item.met ? 'text-emerald-600 font-medium' : 'text-muted-foreground/80'
            }`}
          >
            {item.met ? (
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            )}
            <span className="text-[11px]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
