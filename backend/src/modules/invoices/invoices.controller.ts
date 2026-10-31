import { Controller, Get, Patch, Post, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { InvoicesService, InvoiceStatus } from "./invoices.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, UserPayload } from "../../common/decorators/current-user.decorator";

@ApiTags("Invoices Management")
@Controller("invoices")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: "List invoices (Staff/Admin sees all; Customer sees their own)" })
  @ApiQuery({ name: "status", required: false, enum: InvoiceStatus })
  async listInvoices(
    @CurrentUser() user: UserPayload,
    @Query("status") status?: string
  ) {
    return this.invoicesService.listInvoices(user, status);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get detailed invoice by ID" })
  async getInvoiceById(
    @Param("id") id: string,
    @CurrentUser() user: UserPayload
  ) {
    return this.invoicesService.getInvoiceById(id, user);
  }

  @Patch(":id/confirm")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Confirm draft invoice (Draft -> Confirmed)" })
  async confirmInvoice(
    @Param("id") id: string,
    @CurrentUser() user: UserPayload
  ) {
    return this.invoicesService.confirmInvoice(id, user);
  }

  @Patch(":id/cancel")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Cancel an invoice" })
  async cancelInvoice(
    @Param("id") id: string,
    @CurrentUser() user: UserPayload
  ) {
    return this.invoicesService.cancelInvoice(id, user);
  }

  @Post(":id/send")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Send invoice to customer email" })
  async sendInvoice(
    @Param("id") id: string,
    @CurrentUser() user: UserPayload
  ) {
    const inv = await this.invoicesService.getInvoiceById(id, user);
    return {
      success: true,
      message: `Invoice ${inv.invoiceNumber} sent to ${inv.customer.email}`,
    };
  }

  @Get(":id/print")
  @ApiOperation({ summary: "Get printable invoice document with company header, lines, tax and totals" })
  async printInvoice(
    @Param("id") id: string,
    @CurrentUser() user: UserPayload
  ) {
    return this.invoicesService.printInvoice(id, user);
  }
}

