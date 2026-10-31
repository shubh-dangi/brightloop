import React, { useState, forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/input';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  actionRight?: ReactNode;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ id, label, error, actionRight, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `password-input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-foreground tracking-tight"
          >
            {label}
          </label>
          {actionRight}
        </div>

        <div className="relative">
          <Input
            id={inputId}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`h-10 text-sm pr-10 ${
              error ? 'border-destructive focus-visible:ring-destructive/30' : ''
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-destructive font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
