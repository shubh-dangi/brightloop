import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BrightloopLogo } from '../common/BrightloopLogo';
import { AuthBrandingPanel } from './AuthBrandingPanel';
import { ThemeSwitcher } from '../layout/ThemeSwitcher';

interface AuthLayoutProps {
  children: ReactNode;
  heading: string;
  subheading: string;
  type?: 'login' | 'signup' | 'reset';
  benefits?: string[];
}

export function AuthLayout({
  children,
  heading,
  subheading,
  type = 'login',
  benefits,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background selection:bg-primary/20 selection:text-primary relative">
      {/* Top Right Quick Theme Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      {/* Left Branding Panel (Desktop Only) */}
      <AuthBrandingPanel
        heading={heading}
        subheading={subheading}
        type={type}
        benefits={benefits}
      />

      {/* Right Authentication Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-12 py-12 relative overflow-y-auto">
        {/* Subtle Ambient Backing Glow on Form Side */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Mobile Logo Header */}
        <div className="lg:hidden mb-8 text-center">
          <Link to="/" className="inline-block" aria-label="Brightloop Home">
            <BrightloopLogo size="md" />
          </Link>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md space-y-6 relative z-10">
          {children}
        </div>

        {/* Mobile Legal Note */}
        <div className="mt-8 text-center text-xs text-muted-foreground lg:hidden">
          © 2026 Brightloop. All rights reserved.
        </div>
      </div>
    </div>
  );
}
