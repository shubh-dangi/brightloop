import React, { forwardRef, InputHTMLAttributes } from 'react';
import { Input } from '../ui/input';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ id, label, error, helperText, className = '', ...props }, ref) => {
    const inputId = id || `auth-input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-foreground tracking-tight block"
        >
          {label}
        </label>
        <Input
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-desc` : undefined}
          className={`h-10 text-sm transition-colors ${
            error ? 'border-destructive focus-visible:ring-destructive/30' : ''
          } ${className}`}
          {...props}
        />
        {helperText && !error && (
          <p id={`${inputId}-desc`} className="text-[11px] text-muted-foreground">
            {helperText}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-destructive font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';
