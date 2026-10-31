import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { BrightloopLogo } from '../../../components/common/BrightloopLogo';
import { Button } from '../../../components/ui/button';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Features', targetId: 'features' },
    { label: 'How It Works', targetId: 'how-it-works' },
    { label: 'Solutions', targetId: 'solutions' },
    { label: 'Pricing', targetId: 'pricing' },
    { label: 'FAQ', targetId: 'faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border/80 shadow-xs py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="cursor-pointer" aria-label="Brightloop Home">
            <BrightloopLogo size="md" />
          </Link>

          {/* Desktop Center Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <button
                key={link.targetId}
                onClick={() => scrollToSection(link.targetId)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-sm font-medium cursor-pointer"
            >
              Log In
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/signup')}
              className="font-medium shadow-sm hover:shadow cursor-pointer gap-1.5"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.targetId}
                  onClick={() => scrollToSection(link.targetId)}
                  className="text-left text-sm font-medium text-foreground py-2 px-3 rounded-md hover:bg-muted/70 transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-border flex flex-col gap-2.5">
              <Button
                variant="outline"
                className="w-full justify-center text-sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
              >
                Log In
              </Button>
              <Button
                className="w-full justify-center text-sm gap-1.5"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/signup');
                }}
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
