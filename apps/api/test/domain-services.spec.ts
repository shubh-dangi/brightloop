import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscountsService } from '../src/modules/discounts/discounts.service';
import { PaymentsService } from '../src/modules/payments/payments.service';
import { ProductsService } from '../src/modules/products/products.service';
import { SubscriptionsService } from '../src/modules/subscriptions/subscriptions.service';
import { PaymentMethod } from '@brightloop/contracts';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Domain Services & Subscription Business Rules', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      discount: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      payment: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
      },
      invoice: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      product: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      subscription: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      activityLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(mockPrisma)),
    };
  });

  describe('DiscountsService.validateAndCalculate', () => {
    let service: DiscountsService;

    beforeEach(() => {
      service = new DiscountsService(mockPrisma);
    });

    it('calculates percentage discounts accurately', async () => {
      mockPrisma.discount.findFirst.mockResolvedValue({
        id: 'disc-1',
        code: 'PROMO15',
        type: 'PERCENTAGE',
        value: 15,
        minPurchase: 1000,
        minQuantity: 1,
        usedCount: 5,
        maxUsage: 100,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
      });

      const result = await service.validateAndCalculate('org-1', 'PROMO15', 2000, 2);

      expect(result.discountAmount).toBe(300); // 15% of 2000
      expect(result.finalAmount).toBe(1700);
    });

    it('calculates fixed value discounts accurately and caps at purchase amount', async () => {
      mockPrisma.discount.findFirst.mockResolvedValue({
        id: 'disc-2',
        code: 'FLAT500',
        type: 'FIXED_AMOUNT',
        value: 500,
        minPurchase: 400,
        minQuantity: 1,
        usedCount: 0,
        maxUsage: 50,
      });

      const result = await service.validateAndCalculate('org-1', 'FLAT500', 450, 1);

      expect(result.discountAmount).toBe(450); // Capped at purchase amount
      expect(result.finalAmount).toBe(0);
    });

    it('rejects expired discounts with BadRequestException', async () => {
      mockPrisma.discount.findFirst.mockResolvedValue({
        id: 'disc-expired',
        code: 'EXPIRED10',
        type: 'PERCENTAGE',
        value: 10,
        endDate: new Date(Date.now() - 86400000), // yesterday
      });

      await expect(service.validateAndCalculate('org-1', 'EXPIRED10', 1000, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects coupons that do not meet minimum purchase order value', async () => {
      mockPrisma.discount.findFirst.mockResolvedValue({
        id: 'disc-min',
        code: 'MIN5000',
        type: 'FIXED_AMOUNT',
        value: 500,
        minPurchase: 5000,
      });

      await expect(service.validateAndCalculate('org-1', 'MIN5000', 3000, 1)).rejects.toThrow(
        /Minimum purchase/,
      );
    });
  });

  describe('PaymentsService.record', () => {
    let service: PaymentsService;

    beforeEach(() => {
      service = new PaymentsService(mockPrisma);
    });

    it('records payment, decrements outstanding amount, and updates status to PAID on full settlement', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        invoiceNumber: 'INV-2026-001',
        customerId: 'cust-1',
        totalAmount: 1180,
        paidAmount: 0,
        outstandingAmount: 1180,
        status: 'CONFIRMED',
      });
      mockPrisma.payment.count.mockResolvedValue(0);
      mockPrisma.payment.create.mockResolvedValue({
        id: 'pay-1',
        paymentReference: 'PAY-2026-001',
        amount: 1180,
      });

      const payment = await service.record('org-1', 'user-1', {
        invoiceId: 'inv-1',
        amount: 1180,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        paymentDate: new Date().toISOString(),
      });

      expect(mockPrisma.payment.create).toHaveBeenCalled();
      expect(mockPrisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: expect.objectContaining({
            paidAmount: 1180,
            outstandingAmount: 0,
            status: 'PAID',
          }),
        }),
      );
      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'payment:recorded',
            entity: 'Payment',
          }),
        }),
      );
    });

    it('records partial payment without prematurely setting status to PAID', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-2',
        invoiceNumber: 'INV-2026-002',
        customerId: 'cust-1',
        totalAmount: 2000,
        paidAmount: 0,
        outstandingAmount: 2000,
        status: 'CONFIRMED',
      });
      mockPrisma.payment.count.mockResolvedValue(1);
      mockPrisma.payment.create.mockResolvedValue({
        id: 'pay-2',
        paymentReference: 'PAY-2026-002',
        amount: 500,
      });

      await service.record('org-1', 'user-1', {
        invoiceId: 'inv-2',
        amount: 500,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        paymentDate: new Date().toISOString(),
      });

      expect(mockPrisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-2' },
          data: {
            paidAmount: 500,
            outstandingAmount: 1500,
          },
        }),
      );
    });

    it('rejects recording payments against cancelled invoices', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-3',
        status: 'CANCELLED',
      });

      await expect(
        service.record('org-1', 'user-1', {
          invoiceId: 'inv-3',
          amount: 100,
          paymentMethod: PaymentMethod.CASH,
          paymentDate: new Date().toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('ProductsService: Cost Price Masking for Staff', () => {
    let service: ProductsService;

    beforeEach(() => {
      service = new ProductsService(mockPrisma);
    });

    it('masks costPrice to null for Staff roles (MEMBER / VIEWER)', async () => {
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'prod-1', name: 'Software Suite', salesPrice: 5000, costPrice: 2000, variants: [] },
      ]);

      const staffResults = await service.findAll('org-1', 'MEMBER');
      expect(staffResults[0].costPrice).toBeNull();
      expect(staffResults[0].salesPrice).toBe(5000);
    });

    it('retains unmasked costPrice for Admin and Owner roles', async () => {
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'prod-1', name: 'Software Suite', salesPrice: 5000, costPrice: 2000, variants: [] },
      ]);

      const adminResults = await service.findAll('org-1', 'ADMIN');
      expect(adminResults[0].costPrice).toBe(2000);
      expect(adminResults[0].salesPrice).toBe(5000);
    });
  });

  describe('SubscriptionsService: Plan-Enforced Lifecycle Rules', () => {
    let service: SubscriptionsService;

    beforeEach(() => {
      service = new SubscriptionsService(mockPrisma);
    });

    it('blocks pause action if subscription plan has allowPause = false', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        status: 'ACTIVE',
        plan: {
          name: 'Annual Non-Pausable Enterprise',
          allowPause: false,
        },
      });

      await expect(service.pause('org-1', 'sub-1')).rejects.toThrow(
        /does not permit pausing/,
      );
    });

    it('allows pause action when plan allows pause', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue({
        id: 'sub-2',
        status: 'ACTIVE',
        plan: {
          name: 'Flexible Monthly Plan',
          allowPause: true,
        },
      });
      mockPrisma.subscription.update.mockResolvedValue({
        id: 'sub-2',
        status: 'PAUSED',
      });

      const updated = await service.pause('org-1', 'sub-2');
      expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-2' },
          data: expect.objectContaining({ status: 'PAUSED' }),
        }),
      );
    });

    it('resumes paused subscription back to ACTIVE', async () => {
      mockPrisma.subscription.findFirst.mockResolvedValue({
        id: 'sub-3',
        status: 'PAUSED',
      });
      mockPrisma.subscription.update.mockResolvedValue({
        id: 'sub-3',
        status: 'ACTIVE',
      });

      await service.resume('org-1', 'sub-3');
      expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-3' },
          data: expect.objectContaining({ status: 'ACTIVE' }),
        }),
      );
    });
  });
});
