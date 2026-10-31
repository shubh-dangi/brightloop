import React from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ValueProposition } from './components/ValueProposition';
import { FeaturesSection } from './components/FeaturesSection';
import { ProductShowcase } from './components/ProductShowcase';
import { HowItWorks } from './components/HowItWorks';
import { BenefitsSection } from './components/BenefitsSection';
import { UserRolesSection } from './components/UserRolesSection';
import { PricingSection } from './components/PricingSection';
import { FAQSection } from './components/FAQSection';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* SECTION 1: Navigation Bar */}
      <Navbar />

      <main className="flex-1">
        {/* SECTION 2: Hero Section */}
        <HeroSection />

        {/* SECTION 3: Trust / Value Proposition */}
        <ValueProposition />

        {/* SECTION 4: Features */}
        <FeaturesSection />

        {/* SECTION 5: Product Showcase */}
        <ProductShowcase />

        {/* SECTION 6: How It Works */}
        <HowItWorks />

        {/* SECTION 7: Benefits */}
        <BenefitsSection />

        {/* SECTION 8: Solutions / User Roles */}
        <UserRolesSection />

        {/* Pricing Anchor Section */}
        <PricingSection />

        {/* SECTION 9: FAQ */}
        <FAQSection />

        {/* SECTION 10: Final CTA */}
        <FinalCTA />
      </main>

      {/* SECTION 11: Footer */}
      <Footer />
    </div>
  );
}
