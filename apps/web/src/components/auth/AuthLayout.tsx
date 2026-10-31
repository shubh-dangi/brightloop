import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BrightloopLogo } from '../common/BrightloopLogo';
import { ThemeSwitcher } from '../layout/ThemeSwitcher';

interface AuthLayoutProps {
  children: ReactNode;
  heading?: string;
  subheading?: string;
  type?: 'login' | 'signup' | 'reset';
  benefits?: string[];
}

export function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center w-full bg-background selection:bg-primary/20 selection:text-primary relative px-4 sm:px-6 py-12">
      {/* Top Right Quick Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      {/* Ambient Radial Lighting Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Brand Logo Header */}
      <div className="mb-6 text-center relative z-10">
        <Link to="/" className="inline-block hover:opacity-90 transition-opacity" aria-label="Brightloop Home">
          <BrightloopLogo size="lg" />
        </Link>
      </div>

      {/* Centered Auth Card Container */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
        {children}
      </div>

      {/* Subtle Copyright Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground relative z-10 font-mono">
        © 2026 Brightloop. All rights reserved.
      </div>
    </div>
  );
}
