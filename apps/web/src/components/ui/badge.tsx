import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors select-none font-mono',
  {
    variants: {
      variant: {
        default:
          'border-primary/30 bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary font-semibold',
        secondary:
          'border-border/80 bg-surface-elevated text-muted-foreground',
        destructive:
          'border-danger/30 bg-danger-soft text-danger dark:text-danger font-semibold',
        outline:
          'border-border text-foreground bg-transparent',
        success:
          'border-success/30 bg-success-soft text-success dark:text-success font-semibold',
        warning:
          'border-warning/30 bg-warning-soft text-warning dark:text-warning font-semibold',
        info:
          'border-info/30 bg-info-soft text-info dark:text-info font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
