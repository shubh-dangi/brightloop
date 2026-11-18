import React from 'react';

interface BrightloopLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function BrightloopLogo({ className = '', iconOnly = false, size = 'md' }: BrightloopLogoProps) {
  const iconSizes = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11',
    xl: 'h-14 w-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const pxSizes = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56,
  };

  const dim = pxSizes[size];

  return (
    <div className={`flex items-center gap-2.5 font-sans select-none group ${className}`}>
      {/* Precision Geometric Infinity Recurring Loop Emblem */}
      <div
        style={{ width: `${dim}px`, height: `${dim}px`, minWidth: `${dim}px`, minHeight: `${dim}px` }}
        className={`relative flex ${iconSizes[size]} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white shadow-md shadow-purple-600/25 ring-1 ring-white/20 transition-all duration-200 group-hover:scale-105 group-hover:shadow-purple-600/35`}
      >
        <svg
          style={{ width: `${Math.round(dim * 0.65)}px`, height: `${Math.round(dim * 0.65)}px` }}
          className="h-[65%] w-[65%] shrink-0 drop-shadow-xs"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Continuous Infinity Recurring Dual-Loop */}
          <path
            d="M16 16C13.5 12 11 9.5 7.5 9.5C4 9.5 2 12.5 2 16C2 19.5 4 22.5 7.5 22.5C11 22.5 13.5 20 16 16C18.5 12 21 9.5 24.5 9.5C28 9.5 30 12.5 30 16C30 19.5 28 22.5 24.5 22.5C21 22.5 18.5 20 16 16Z"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Central Pulse Node */}
          <circle cx="16" cy="16" r="2.2" fill="#FFFFFF" />
          {/* Radiant "Bright" Sparkle */}
          <path
            d="M24.5 4.5L25.3 6.7L27.5 7.5L25.3 8.3L24.5 10.5L23.7 8.3L21.5 7.5L23.7 6.7Z"
            fill="#FDE047"
          />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col text-left leading-none">
          <span className={`tracking-tight font-extrabold ${textSizes[size]}`}>
            <span className="text-foreground font-bold">Bright</span>
            <span className="text-primary font-black ml-0.5">loop</span>
          </span>
        </div>
      )}
    </div>
  );
}
