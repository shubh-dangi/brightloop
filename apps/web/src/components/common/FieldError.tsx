import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FieldErrorProps {
  error?: string | null;
  className?: string;
  id?: string;
}

export function FieldError({ error, className, id }: FieldErrorProps) {
  if (!error) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-center gap-1.5 text-xs font-medium text-destructive mt-1 animate-in fade-in-50 slide-in-from-top-1 duration-150',
        className,
      )}
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
      <span>{error}</span>
    </div>
  );
}
