import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { UserPayload } from "../../common/decorators/current-user.decorator";

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
  OVERDUE = "OVERDUE",
}

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async listInvoices(actor: UserPayload, status?: string) {
    const where: any = {};
    if (actor.role === "CUSTOMER") {
      where.customerId = actor.userId; // Tenant isolation
    }
    if (status) {
      where.status = status;
    }

    return this.prisma.invoice.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, companyName: true } },
        lines: { include: { product: true, variant: true } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getInvoiceById(id: string, actor: UserPayload) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, companyName: true, phone: true } },
        subscription: { include: { plan: true } },
        lines: { include: { product: true, variant: true } },
        payments: true,
      },
    });

    if (!invoice) throw new NotFoundException("Invoice not found.");

    if (actor.role === "CUSTOMER" && invoice.customerId !== actor.userId) {
      throw new ForbiddenException("Access denied: You cannot view another customer's invoice.");
    }

    return invoice;
  }

  async confirmInvoice(id: string, actor: UserPayload) {
    const invoice = await this.getInvoiceById(id, actor);

    if (invoice.status !== "DRAFT") {
      throw new BadRequestException(`Cannot confirm invoice with status '${invoice.status}'. Only DRAFT invoices can be confirmed.`);
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: "CONFIRMED" },
      include: { customer: true, lines: true },
    });
  }

  async cancelInvoice(id: string, actor: UserPayload) {
    const invoice = await this.getInvoiceById(id, actor);

    if (invoice.status === "PAID") {
      throw new BadRequestException("Cannot cancel an already paid invoice.");
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  }

  async printInvoice(id: string, actor: UserPayload) {
    const invoice = await this.getInvoiceById(id, actor);

    // Formatted Print / PDF payload
    return {
      company: {
        name: "Brightloop Software Ltd",
        address: "100 Cloud Parkway, Tech City",
        email: "billing@brightloop.com",
        taxId: "VAT-BL-2026-9901",
      },
      invoice: {
        number: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        customer: invoice.customer,
        lines: invoice.lines,
        subtotal: invoice.subtotal,
        taxTotal: invoice.taxTotal,
        discountTotal: invoice.discountTotal,
        grandTotal: invoice.grandTotal,
        payments: invoice.payments,
        amountDue: invoice.grandTotal - invoice.payments.reduce((acc, p) => acc + p.amount, 0),
      },
    };
  }
}

