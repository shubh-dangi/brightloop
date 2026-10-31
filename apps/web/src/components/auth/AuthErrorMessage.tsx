import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface AuthErrorMessageProps {
  message?: string | null;
  className?: string;
}

export function AuthErrorMessage({ message, className = '' }: AuthErrorMessageProps) {
  if (!message) return null;

  return (
    <Alert variant="destructive" className={`py-2.5 px-3.5 flex items-center gap-2 ${className}`}>
      <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
      <AlertDescription className="text-xs font-medium leading-normal">
        {message}
      </AlertDescription>
    </Alert>
  );
}
