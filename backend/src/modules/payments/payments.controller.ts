import { Controller, Post, Get, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { RecordPaymentDto } from "./dto/record-payment.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, UserPayload } from "../../common/decorators/current-user.decorator";

@ApiTags("Payments Collection")
@Controller("payments")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Record payment against an invoice (Card, Bank, Cash); auto-marks invoice as PAID when settled" })
  @ApiResponse({ status: 201, description: "Payment recorded and invoice balance updated." })
  async recordPayment(@Body() dto: RecordPaymentDto) {
    return this.paymentsService.recordPayment(dto);
  }

  @Get()
  @ApiOperation({ summary: "List all payments (Staff/Admin sees all, Customer sees their own)" })
  async listAllPayments(@CurrentUser() user: UserPayload) {
    return this.paymentsService.listAllPayments(user);
  }

  @Get("invoice/:invoiceId")
  @ApiOperation({ summary: "Get all payment records for a specific invoice" })
  async listPaymentsByInvoice(@Param("invoiceId") invoiceId: string) {
    return this.paymentsService.listPaymentsByInvoice(invoiceId);
  }
}
