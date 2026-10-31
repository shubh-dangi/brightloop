import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'What is Brightloop?',
      answer:
        'Brightloop is an enterprise-grade subscription management and recurring billing platform engineered to streamline customer plans, automated recurring invoicing, payment tracking, and revenue analytics within a unified multi-tenant workspace.',
    },
    {
      question: 'Who can use Brightloop?',
      answer:
        'Brightloop is built for SaaS companies, digital service providers, and recurring commercial operations that need reliable billing administration, automated invoice cycles, and transparent customer subscription portals.',
    },
    {
      question: 'Can I manage monthly and yearly subscriptions?',
      answer:
        'Yes. Brightloop supports flexible billing frequencies including monthly, quarterly, annual, and custom intervals, with automated invoice generation aligned with each customer’s renewal schedule.',
    },
    {
      question: 'Does Brightloop support recurring invoices?',
      answer:
        'Yes. Invoices are automatically generated based on the active subscription billing cycles, applying configured product variant prices, tax rates, and eligible discounts.',
    },
    {
      question: 'Can I manage multiple products and plans?',
      answer:
        'Yes. You can configure multiple products, define variant tiers (such as Basic, Pro, Enterprise), set customizable pricing structures, and attach specific terms to each plan.',
    },
    {
      question: 'Can I track pending and overdue payments?',
      answer:
        'Yes. Brightloop maintains clear ledger states (Draft, Pending, Paid, Overdue, Cancelled) for all invoices, allowing billing operators to track outstanding balances and aging invoices.',
    },
    {
      question: 'What are the different user roles?',
      answer:
        'Brightloop includes three primary system roles: Administrator (full workspace governance and configuration), Internal Staff (day-to-day operations and customer subscription management), and Customer (viewing their own subscriptions and invoices).',
    },
    {
      question: 'Can customers view their own invoices and subscriptions?',
      answer:
        'Yes. Customers can access their own dedicated self-service portal to review active subscription details, view renewal schedules, and download their generated invoices.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-muted/20 border-y border-border/70 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            Help & Answers
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Everything you need to know about Brightloop’s subscription lifecycle and recurring billing engine.
          </p>
        </div>

        {/* Accessible Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-border/80 bg-card overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-base font-semibold text-foreground hover:text-primary transition-colors cursor-pointer select-none"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-primary' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    className="px-5 pb-5 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border/40 animate-in fade-in-50 duration-150"
                  >
                    <p className="pt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
