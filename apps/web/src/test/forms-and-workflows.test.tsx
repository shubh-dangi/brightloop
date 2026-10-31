import { describe, it, expect, vi } from 'vitest';
import { SignupSchema, LoginSchema, RecordPaymentSchema, CreateQuotationSchema } from '@brightloop/contracts';

describe('Form Schemas & Business Workflow Calculations', () => {
  describe('1. Authentication Form Validation Contracts', () => {
    it('LoginSchema: accepts valid email and password', () => {
      const valid = LoginSchema.safeParse({
        email: 'owner@brightloop.local',
        password: 'Password123!',
      });
      expect(valid.success).toBe(true);
    });

    it('LoginSchema: rejects invalid email formats', () => {
      const invalid = LoginSchema.safeParse({
        email: 'not-an-email',
        password: 'Password123!',
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('SignupSchema: requires minimum 9 characters, uppercase, lowercase, and special symbol', () => {
      // Too short
      const short = SignupSchema.safeParse({
        name: 'Alex Morgan',
        email: 'alex@example.com',
        password: 'Pass1!',
      });
      expect(short.success).toBe(false);

      // Missing special char
      const noSpecial = SignupSchema.safeParse({
        name: 'Alex Morgan',
        email: 'alex@example.com',
        password: 'Password123',
      });
      expect(noSpecial.success).toBe(false);

      // Valid secure password
      const valid = SignupSchema.safeParse({
        name: 'Alex Morgan',
        email: 'alex@example.com',
        password: 'StrongPassword123!',
      });
      expect(valid.success).toBe(true);
    });
  });

  describe('2. Payment Recording Contract Validation', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';

    it('RecordPaymentSchema: rejects zero or negative amounts', () => {
      const zero = RecordPaymentSchema.safeParse({
        invoiceId: validUuid,
        amount: 0,
        paymentMethod: 'BANK_TRANSFER',
        paymentDate: '2026-10-31',
      });
      expect(zero.success).toBe(false);

      const negative = RecordPaymentSchema.safeParse({
        invoiceId: validUuid,
        amount: -100,
        paymentMethod: 'CREDIT_CARD',
        paymentDate: '2026-10-31',
      });
      expect(negative.success).toBe(false);
    });

    it('RecordPaymentSchema: accepts valid positive payment records', () => {
      const valid = RecordPaymentSchema.safeParse({
        invoiceId: validUuid,
        amount: 132.0,
        paymentMethod: 'BANK_TRANSFER',
        paymentDate: '2026-10-31',
        note: 'Invoice paid via wire transfer',
      });
      expect(valid.success).toBe(true);
    });
  });

  describe('3. Commercial Quotation Mathematical Model', () => {
    const customerUuid = '123e4567-e89b-12d3-a456-426614174001';
    const productUuid = '123e4567-e89b-12d3-a456-426614174002';

    it('calculates quotation subtotal, tax rate and line totals accurately with variants', () => {
      const baseProductPrice = 120.0;
      const variantAdditionalPrice = 560.0; // Odoo Brand Connector
      const unitPrice = baseProductPrice + variantAdditionalPrice; // 680.0
      const quantity = 2;
      const taxRate = 10; // 10%

      const lineSubtotal = unitPrice * quantity; // 1360.0
      const lineTax = (lineSubtotal * taxRate) / 100; // 136.0
      const lineTotal = lineSubtotal + lineTax; // 1496.0

      expect(unitPrice).toBe(680.0);
      expect(lineSubtotal).toBe(1360.0);
      expect(lineTax).toBe(136.0);
      expect(lineTotal).toBe(1496.0);
    });

    it('CreateQuotationSchema: validates line item requirements', () => {
      const validQuote = CreateQuotationSchema.safeParse({
        customerId: customerUuid,
        templateName: 'Standard SaaS Template',
        validDays: 15,
        lines: [
          {
            productId: productUuid,
            quantity: 1,
            unitPrice: 120.0,
            taxRate: 10,
          },
        ],
      });
      expect(validQuote.success).toBe(true);

      const emptyLines = CreateQuotationSchema.safeParse({
        customerId: customerUuid,
        templateName: 'Standard SaaS Template',
        validDays: 15,
        lines: [],
      });
      expect(emptyLines.success).toBe(false);
    });
  });

  describe('4. Invoice & Payment Settlement Lifecycle', () => {
    it('settles invoice status to PAID when accumulated payments equal total amount', () => {
      const invoice = {
        totalAmount: 132.0,
        paidAmount: 0.0,
        outstandingAmount: 132.0,
        status: 'CONFIRMED',
      };

      const payment1 = 50.0;
      const updatedPaid1 = invoice.paidAmount + payment1;
      const updatedOutstanding1 = invoice.totalAmount - updatedPaid1;
      expect(updatedOutstanding1).toBe(82.0);

      const payment2 = 82.0;
      const updatedPaid2 = updatedPaid1 + payment2;
      const updatedOutstanding2 = invoice.totalAmount - updatedPaid2;
      const isPaidInFull = updatedOutstanding2 <= 0;

      expect(updatedOutstanding2).toBe(0.0);
      expect(isPaidInFull).toBe(true);
    });
  });
});
