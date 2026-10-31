import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface AuthSuccessMessageProps {
  message?: string | null;
  className?: string;
}

export function AuthSuccessMessage({ message, className = '' }: AuthSuccessMessageProps) {
  if (!message) return null;

  return (
    <Alert
      variant="success"
      className={`py-2.5 px-3.5 flex items-center gap-2 border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ${className}`}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <AlertDescription className="text-xs font-medium leading-normal">
        {message}
      </AlertDescription>
    </Alert>
  );
}
