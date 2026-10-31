import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

interface AuthSubmitButtonProps {
  label: string;
  loadingLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AuthSubmitButton({
  label,
  loadingLabel = 'Please wait...',
  isLoading = false,
  disabled = false,
  className = '',
}: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isLoading || disabled}
      className={`w-full h-11 text-sm font-semibold shadow-sm hover:shadow cursor-pointer gap-2 transition-all ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </Button>
  );
}
