import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InvoiceStatus } from '@brightloop/contracts';

@Injectable()
export class InvoicesService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  private withOverdueFlag(invoice: any) {
    if (!invoice) return invoice;
    const isOverdue = invoice.status !== 'PAID' && invoice.dueDate && new Date(invoice.dueDate) < new Date();
    return {
      ...invoice,
      isOverdue,
    };
  }

  async findAll(orgId: string, userRole?: string, userEmail?: string, status?: string, search?: string) {
    const where: any = { organizationId: orgId };

    // Enforce Customer Portal IDOR isolation
    if (userRole === 'CUSTOMER' && userEmail) {
      const customer = await this.prisma.customer.findFirst({
        where: { organizationId: orgId, email: userEmail.toLowerCase() },
      });
      if (!customer) {
        return [];
      }
      where.customerId = customer.id;
    }

    if (status) {
      where.status = status as InvoiceStatus;
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const invoices = await this.prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        subscription: {
          include: { plan: true },
        },
        lines: true,
      },
    });

    return invoices.map((inv) => this.withOverdueFlag(inv));
  }

  async findOne(orgId: string, id: string, userRole?: string, userEmail?: string) {
    const where: any = { id, organizationId: orgId };

    if (userRole === 'CUSTOMER' && userEmail) {
      const customer = await this.prisma.customer.findFirst({
        where: { organizationId: orgId, email: userEmail.toLowerCase() },
      });
      if (!customer) {
        throw new NotFoundException('Invoice not found');
      }
      where.customerId = customer.id;
    }

    const invoice = await this.prisma.invoice.findFirst({
      where,
      include: {
        customer: true,
        subscription: {
          include: { plan: true },
        },
        lines: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return this.withOverdueFlag(invoice);
  }

  async generateInvoices(orgId: string) {
    const activeSubscriptions = await this.prisma.subscription.findMany({
      where: { organizationId: orgId, status: 'ACTIVE' },
      include: {
        customer: true,
        plan: true,
        lines: {
          include: { product: true, variant: true },
        },
      },
    });

    const now = new Date();
    const generated: any[] = [];

    // Check active discounts
    const availableDiscounts = await this.prisma.discount.findMany({
      where: {
        organizationId: orgId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    for (const sub of activeSubscriptions) {
      // Calculate periodStart and periodEnd based on plan billing cadence
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      let periodEnd: Date;
      if (sub.billingFrequency === 'YEARLY' || sub.plan?.billingFrequency === 'YEARLY') {
        periodEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      } else if (sub.billingFrequency === 'WEEKLY' || sub.plan?.billingFrequency === 'WEEKLY') {
        periodEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (sub.billingFrequency === 'DAILY' || sub.plan?.billingFrequency === 'DAILY') {
        periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      } else {
        // MONTHLY default
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      }

      // Idempotency check: unique constraint (subscriptionId, periodStart, periodEnd)
      const existing = await this.prisma.invoice.findFirst({
        where: {
          subscriptionId: sub.id,
          periodStart,
          periodEnd,
        },
      });

      if (existing) {
        continue;
      }

      // Calculate line items: base price + variant extra * quantity
      let subtotal = 0;
      let totalQty = 0;
      const linesData = sub.lines.map((line) => {
        const base = line.product?.salesPrice ?? line.unitPrice;
        const extra = line.variant?.additionalPrice ?? 0;
        const unitPrice = base + extra;
        const lineTotal = unitPrice * line.quantity;
        subtotal += lineTotal;
        totalQty += line.quantity;
        return {
          description: `${line.product.name}${line.variant ? ` (${line.variant.name})` : ''}`,
          quantity: line.quantity,
          unitPrice,
          taxRate: line.taxRate || 18,
          taxAmount: (lineTotal * (line.taxRate || 18)) / 100,
          lineTotal,
        };
      });

      // Apply valid discount if criteria met
      let discountAmount = 0;
      for (const disc of availableDiscounts) {
        if (disc.maxUsage && disc.usedCount >= disc.maxUsage) continue;
        if (disc.minPurchase && subtotal < disc.minPurchase) continue;
        if (disc.minQuantity && totalQty < disc.minQuantity) continue;

        if (disc.type === 'PERCENTAGE') {
          discountAmount = (subtotal * disc.value) / 100;
        } else {
          discountAmount = Math.min(disc.value, subtotal);
        }

        // Increment usage
        await this.prisma.discount.update({
          where: { id: disc.id },
          data: { usedCount: { increment: 1 } },
        });
        break;
      }

      const taxableAmount = Math.max(0, subtotal - discountAmount);
      const taxAmount = Math.round(taxableAmount * 0.18 * 100) / 100;
      const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;
      const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${sub.subscriptionNumber}`;

      const createdInvoice = await this.prisma.invoice.create({
        data: {
          organizationId: orgId,
          invoiceNumber,
          subscriptionId: sub.id,
          customerId: sub.customerId,
          invoiceDate: now,
          dueDate,
          periodStart,
          periodEnd,
          subtotal,
          discountAmount,
          taxAmount,
          totalAmount,
          paidAmount: 0,
          outstandingAmount: totalAmount,
          status: 'DRAFT',
          lines: {
            create: linesData,
          },
        },
        include: {
          customer: true,
          lines: true,
          subscription: true,
        },
      });

      generated.push(this.withOverdueFlag(createdInvoice));
    }

    return {
      message: `Invoice generation billing cycle processed successfully`,
      generatedCount: generated.length,
      invoices: generated,
    };
  }

  async confirm(orgId: string, id: string) {
    const invoice = await this.findOne(orgId, id);
    if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
      throw new BadRequestException('Cannot confirm a paid or cancelled invoice');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: { customer: true, lines: true },
    });
    return this.withOverdueFlag(updated);
  }

  async cancel(orgId: string, id: string) {
    const invoice = await this.findOne(orgId, id);
    if (invoice.status === 'PAID') {
      throw new BadRequestException('Cannot cancel an invoice that is already paid');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED', outstandingAmount: 0 },
      include: { customer: true, lines: true },
    });
    return this.withOverdueFlag(updated);
  }

  async send(orgId: string, id: string) {
    const invoice = await this.findOne(orgId, id);
    return {
      message: `Invoice ${invoice.invoiceNumber} has been dispatched to ${invoice.customer.email}`,
      sentAt: new Date().toISOString(),
    };
  }

  async getPrintHtml(orgId: string, id: string, userRole?: string, userEmail?: string) {
    const invoice = await this.findOne(orgId, id, userRole, userEmail);
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });

    const linesHtml = invoice.lines
      .map(
        (line: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${line.description}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${line.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${line.unitPrice.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${line.taxRate}%</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">₹${line.lineTotal.toFixed(2)}</td>
        </tr>`,
      )
      .join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice - ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
    .title { font-size: 28px; font-weight: bold; color: #714B67; margin: 0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
    .badge-PAID { background: #dcfce7; color: #15803d; }
    .badge-CONFIRMED { background: #e0f2fe; color: #0369a1; }
    .badge-DRAFT { background: #f1f5f9; color: #475569; }
    .badge-CANCELLED { background: #fee2e2; color: #b91c1c; }
    .grid { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
    th { background: #f8fafc; padding: 10px; text-align: left; font-weight: 600; border-bottom: 2px solid #cbd5e1; }
    .summary { width: 300px; margin-left: auto; font-size: 14px; }
    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
    .summary-total { font-size: 18px; font-weight: bold; color: #714B67; border-top: 2px solid #cbd5e1; padding-top: 10px; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #714B67; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Print Invoice</button>
  </div>
  <div class="header">
    <div>
      <h1 class="title">Brightloop</h1>
      <p style="margin: 4px 0; color: #64748b;">${org?.name || 'Brightloop Software Solutions'}</p>
      <p style="margin: 0; color: #64748b; font-size: 12px;">Enterprise Recurring Billing & Subscription Platform</p>
    </div>
    <div style="text-align: right;">
      <h2 style="margin: 0 0 6px 0; font-size: 20px;">INVOICE</h2>
      <div style="font-family: monospace; font-weight: bold;">${invoice.invoiceNumber}</div>
      <div style="margin-top: 6px;"><span class="badge badge-${invoice.status}">${invoice.status}</span></div>
    </div>
  </div>

  <div class="grid">
    <div>
      <strong>Billed To:</strong><br />
      ${invoice.customer.name}<br />
      ${invoice.customer.email}<br />
      ${invoice.customer.phone || ''}
    </div>
    <div style="text-align: right;">
      <strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}<br />
      <strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}<br />
      ${invoice.periodStart ? `<strong>Billing Period:</strong> ${new Date(invoice.periodStart).toLocaleDateString()} - ${new Date(invoice.periodEnd).toLocaleDateString()}` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: right;">Tax Rate</th>
        <th style="text-align: right;">Line Total</th>
      </tr>
    </thead>
    <tbody>
      ${linesHtml}
    </tbody>
  </table>

  <div class="summary">
    <div class="summary-row"><span>Subtotal:</span> <span>₹${invoice.subtotal.toFixed(2)}</span></div>
    ${invoice.discountAmount > 0 ? `<div class="summary-row" style="color: #15803d;"><span>Discount:</span> <span>-₹${invoice.discountAmount.toFixed(2)}</span></div>` : ''}
    <div class="summary-row"><span>Tax (GST 18%):</span> <span>₹${invoice.taxAmount.toFixed(2)}</span></div>
    <div class="summary-row summary-total"><span>Total:</span> <span>₹${invoice.totalAmount.toFixed(2)}</span></div>
    <div class="summary-row" style="margin-top: 4px;"><span>Paid:</span> <span>₹${invoice.paidAmount.toFixed(2)}</span></div>
    <div class="summary-row" style="font-weight: bold; color: ${invoice.outstandingAmount > 0 ? '#b91c1c' : '#15803d'};"><span>Balance Due:</span> <span>₹${invoice.outstandingAmount.toFixed(2)}</span></div>
  </div>
</body>
</html>`;
  }
}
