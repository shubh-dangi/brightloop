import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { ProductsService } from '../src/modules/products/products.service';
import { PaymentsService } from '../src/modules/payments/payments.service';
import { SubscriptionsService } from '../src/modules/subscriptions/subscriptions.service';
import { InvoicesService } from '../src/modules/invoices/invoices.service';
import { QuotationsService } from '../src/modules/quotations/quotations.service';
import { CustomersService } from '../src/modules/customers/customers.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentMethod, SystemRole } from '@brightloop/contracts';

describe('Enterprise Security Hardening & RBAC Enforcement Suite', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      product: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      plan: {
        findFirst: vi.fn(),
      },
      customer: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      subscription: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
      },
      invoice: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findFirstOrThrow: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      quotation: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findFirstOrThrow: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      payment: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
      },
      activityLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(mockPrisma)),
    };
  });

  describe('1. Authentication & Argon2id Password Security', () => {
    it('hashes passwords using Argon2id with high memory and time parameters', async () => {
      const password = 'SuperSecurePassword2026!';
      const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
      });

      expect(hash).toContain('$argon2id$');
      const isValid = await argon2.verify(hash, password);
      expect(isValid).toBe(true);

      const isInvalid = await argon2.verify(hash, 'WrongPassword123!');
      expect(isInvalid).toBe(false);
    });

    it('hashes password reset tokens using SHA-256 for non-reversible storage', () => {
      const rawToken = '7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a';
      const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

      expect(hashed).toHaveLength(64);
      expect(hashed).not.toEqual(rawToken);
      // Deterministic lookup
      expect(crypto.createHash('sha256').update(rawToken).digest('hex')).toEqual(hashed);
    });
  });

  describe('2. Cost Price Masking for Non-Administrative Roles', () => {
    let service: ProductsService;

    beforeEach(() => {
      service = new ProductsService(mockPrisma);
      mockPrisma.product.findMany.mockResolvedValue([
        {
          id: 'prod-1',
          name: 'Business Suite',
          salesPrice: 200,
          costPrice: 50,
          variants: [],
        },
      ]);
      mockPrisma.product.findFirst.mockResolvedValue({
        id: 'prod-1',
        name: 'Business Suite',
        salesPrice: 200,
        costPrice: 50,
        variants: [],
        plans: [],
      });
    });

    it('exposes costPrice to ADMIN and OWNER roles', async () => {
      const adminProducts = await service.findAll('org-1', SystemRole.ADMIN);
      expect(adminProducts[0].costPrice).toBe(50);

      const ownerProducts = await service.findAll('org-1', SystemRole.OWNER);
      expect(ownerProducts[0].costPrice).toBe(50);

      const ownerSingle = await service.findOne('org-1', 'prod-1', SystemRole.OWNER);
      expect(ownerSingle.costPrice).toBe(50);
    });

    it('strictly masks costPrice (null) for Staff (MEMBER), VIEWER, and CUSTOMER roles', async () => {
      const staffProducts = await service.findAll('org-1', SystemRole.MEMBER);
      expect(staffProducts[0].costPrice).toBeNull();

      const viewerProducts = await service.findAll('org-1', SystemRole.VIEWER);
      expect(viewerProducts[0].costPrice).toBeNull();

      const customerProducts = await service.findAll('org-1', SystemRole.CUSTOMER);
      expect(customerProducts[0].costPrice).toBeNull();

      const staffSingle = await service.findOne('org-1', 'prod-1', SystemRole.MEMBER);
      expect(staffSingle.costPrice).toBeNull();
    });
  });

  describe('3. Customer IDOR & Privacy Isolation', () => {
    let subsService: SubscriptionsService;
    let invService: InvoicesService;
    let quotesService: QuotationsService;
    let custService: CustomersService;

    beforeEach(() => {
      subsService = new SubscriptionsService(mockPrisma);
      invService = new InvoicesService(mockPrisma);
      quotesService = new QuotationsService(mockPrisma);
      custService = new CustomersService(mockPrisma);

      mockPrisma.customer.findFirst.mockImplementation(({ where }: any) => {
        if (where.email === 'alice@customer.com') {
          return Promise.resolve({ id: 'cust-alice', email: 'alice@customer.com' });
        }
        return Promise.resolve(null);
      });
    });

    it('constrains subscription queries to customerId when caller is a CUSTOMER', async () => {
      mockPrisma.subscription.findMany.mockResolvedValue([]);

      await subsService.findAll('org-1', 'CUSTOMER', 'alice@customer.com');

      expect(mockPrisma.subscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: 'org-1',
            customerId: 'cust-alice',
          }),
        }),
      );
    });

    it('blocks access to other customers subscriptions (IDOR protection)', async () => {
      // Alice tries to access Bob's subscription
      mockPrisma.subscription.findFirst.mockResolvedValue(null);

      await expect(
        subsService.findOne('org-1', 'sub-bob-123', 'CUSTOMER', 'alice@customer.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('constrains invoice queries to customerId when caller is a CUSTOMER', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([]);

      await invService.findAll('org-1', 'CUSTOMER', 'alice@customer.com');

      expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: 'org-1',
            customerId: 'cust-alice',
          }),
        }),
      );
    });

    it('prevents customer from querying other customers in customer list', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);

      await custService.findAll('org-1', 'CUSTOMER', 'alice@customer.com');

      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: 'org-1',
            email: 'alice@customer.com',
          }),
        }),
      );
    });
  });

  describe('4. Financial Integrity & Atomic Concurrency', () => {
    let paymentsService: PaymentsService;
    let quotationsService: QuotationsService;

    beforeEach(() => {
      paymentsService = new PaymentsService(mockPrisma);
      quotationsService = new QuotationsService(mockPrisma);
    });

    it('rejects recording payments with zero or negative amounts', async () => {
      await expect(
        paymentsService.record('org-1', 'user-1', {
          invoiceId: 'inv-1',
          amount: 0,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          paymentDate: new Date().toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        paymentsService.record('org-1', 'user-1', {
          invoiceId: 'inv-1',
          amount: -50,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          paymentDate: new Date().toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects payment recording if invoice is already fully paid', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        status: 'PAID',
        totalAmount: 100,
        paidAmount: 100,
        outstandingAmount: 0,
      });

      await expect(
        paymentsService.record('org-1', 'user-1', {
          invoiceId: 'inv-1',
          amount: 50,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          paymentDate: new Date().toISOString(),
        }),
      ).rejects.toThrow('Invoice is already fully paid');
    });

    it('rejects payment recording that exceeds remaining outstanding balance', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        status: 'CONFIRMED',
        totalAmount: 100,
        paidAmount: 80,
        outstandingAmount: 20,
      });

      await expect(
        paymentsService.record('org-1', 'user-1', {
          invoiceId: 'inv-1',
          amount: 50, // 50 > 20
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          paymentDate: new Date().toISOString(),
        }),
      ).rejects.toThrow('cannot exceed remaining outstanding balance');
    });

    it('prevents double conversion of an already confirmed quotation into subscription', async () => {
      mockPrisma.quotation.findFirst.mockResolvedValue({
        id: 'qt-1',
        status: 'CONFIRMED',
      });
      mockPrisma.subscription.findFirst.mockResolvedValue({
        id: 'sub-existing-1',
        quotationId: 'qt-1',
      });

      await expect(
        quotationsService.convertToSubscription('org-1', 'user-1', 'qt-1', 'plan-1'),
      ).rejects.toThrow(/already been converted/);
    });
  });
});
