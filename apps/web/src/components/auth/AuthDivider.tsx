import React from 'react';

interface AuthDividerProps {
  label?: string;
  className?: string;
}

export function AuthDivider({ label, className = '' }: AuthDividerProps) {
  return (
    <div className={`relative flex items-center justify-center py-2 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/70" />
      </div>
      {label && (
        <span className="relative z-10 bg-card px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}
