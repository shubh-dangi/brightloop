import React from 'react';
import { Link } from 'react-router-dom';
import { BrightloopLogo } from '../../../components/common/BrightloopLogo';

export function Footer() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t border-border/80 bg-card/60 pt-16 pb-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" aria-label="Brightloop Home">
              <BrightloopLogo size="md" />
            </Link>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-sm">
              Brightloop is the enterprise subscription lifecycle and recurring billing management platform
              designed to unify plan catalogs, automated invoicing, customer accounts, and revenue intelligence.
            </p>
            <div className="text-xs text-muted-foreground">
              Engineered with modern multi-tenant cloud architecture.
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Product
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => scrollTo('features')}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('how-it-works')}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('pricing')}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('solutions')}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  Solutions
                </button>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Company
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link to="/login" className="hover:text-foreground transition-colors">
                  Customer Portal
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground/80 hover:text-foreground cursor-pointer">
                  About Brightloop
                </span>
              </li>
              <li>
                <span className="text-muted-foreground/80 hover:text-foreground cursor-pointer">
                  Contact Support
                </span>
              </li>
            </ul>
          </div>

          {/* Resources & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Resources & Legal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <button
                  onClick={() => scrollTo('faq')}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  FAQ
                </button>
              </li>
              <li>
                <span className="text-muted-foreground/80 hover:text-foreground cursor-pointer">
                  Documentation
                </span>
              </li>
              <li>
                <span className="text-muted-foreground/80 hover:text-foreground cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-muted-foreground/80 hover:text-foreground cursor-pointer">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 Brightloop. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Enterprise Multi-Tenancy</span>
            <span>•</span>
            <span>Security by Design</span>
            <span>•</span>
            <span>Role-Based Governance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
