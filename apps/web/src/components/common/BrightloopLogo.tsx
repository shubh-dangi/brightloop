import React from 'react';

interface BrightloopLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BrightloopLogo({ className = '', iconOnly = false, size = 'md' }: BrightloopLogoProps) {
  const iconSizes = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 font-sans select-none ${className}`}>
      {/* Precision Geometric Dual-Loop Emblem */}
      <div
        className={`relative flex ${iconSizes[size]} items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105`}
      >
        <svg
          className="h-[60%] w-[60%]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Continuous Recurring Dual Cycle */}
          <path d="M12 2v4" />
          <path d="m4.93 10.93 2.83 2.83" />
          <path d="M2 18h4" />
          <path d="M20 18h2" />
          <path d="m19.07 4.93-2.83 2.83" />
          <circle cx="12" cy="14" r="6" strokeWidth="2.2" />
          <path d="M12 11a3 3 0 1 0 3 3" />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col text-left leading-none">
          <span className={`font-bold tracking-tight text-foreground ${textSizes[size]}`}>
            Brightloop
          </span>
        </div>
      )}
    </div>
  );
}
