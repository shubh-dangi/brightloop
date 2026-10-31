import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RecordPaymentDto } from "./dto/record-payment.dto";

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async recordPayment(dto: RecordPaymentDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: dto.invoiceId },
      include: { payments: true },
    });

    if (!invoice) throw new NotFoundException("Invoice not found.");

    if (invoice.status === "PAID") {
      throw new BadRequestException("This invoice is already fully paid.");
    }

    const previousTotal = invoice.payments.reduce((acc, p) => acc + p.amount, 0);
    const newTotal = previousTotal + dto.amount;

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        method: dto.method,
        transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : new Date(),
        reference: dto.reference,
        note: dto.note,
      },
    });

    // Check if fully settled
    if (newTotal >= invoice.grandTotal) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID" },
      });
    }

    return {
      payment,
      invoiceSettled: newTotal >= invoice.grandTotal,
      remainingAmount: Math.max(0, invoice.grandTotal - newTotal),
    };
  }

  async listPaymentsByInvoice(invoiceId: string) {
    return this.prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { transactionDate: "desc" },
    });
  }
}

