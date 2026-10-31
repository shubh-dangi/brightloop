import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary-hover active:bg-primary-active border border-primary/20',
        destructive:
          'bg-danger text-destructive-foreground font-semibold border border-danger/30 hover:opacity-90',
        outline:
          'border border-border bg-card text-foreground hover:bg-surface-hover hover:text-foreground shadow-xs',
        secondary:
          'bg-surface-elevated text-secondary-foreground border border-border/80 hover:bg-surface-hover',
        ghost:
          'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
        link:
          'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-8 px-3.5 py-1.5',
        sm: 'h-7 rounded px-2.5 text-[11px]',
        lg: 'h-10 rounded-md px-5 text-sm',
        icon: 'h-8 w-8',
        'icon-sm': 'h-7 w-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
