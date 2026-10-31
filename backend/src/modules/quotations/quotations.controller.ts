import { Controller, Post, Get, Patch, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { QuotationsService } from "./quotations.service";
import { CreateQuotationTemplateDto } from "./dto/create-template.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, UserPayload } from "../../common/decorators/current-user.decorator";

@ApiTags("Quotations & Proposals")
@Controller("quotations")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post("templates")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Create reusable quotation template with preset plans & products" })
  @ApiResponse({ status: 201, description: "Quotation template created." })
  async createTemplate(@Body() dto: CreateQuotationTemplateDto) {
    return this.quotationsService.createTemplate(dto);
  }

  @Get("templates")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "List available quotation templates for sales proposals" })
  async listTemplates() {
    return this.quotationsService.listTemplates();
  }

  @Get("templates/:id")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Get quotation template with preconfigured lines" })
  async getTemplateById(@Param("id") id: string) {
    return this.quotationsService.getTemplateById(id);
  }

  @Get()
  @ApiOperation({ summary: "List quotations (subscriptions in QUOTATION or DRAFT status)" })
  async listQuotations(@CurrentUser() user: UserPayload) {
    return this.quotationsService.listQuotations(user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get quotation details by ID" })
  async getQuotationById(@Param("id") id: string, @CurrentUser() user: UserPayload) {
    return this.quotationsService.getQuotationById(id, user);
  }

  @Post()
  @ApiOperation({ summary: "Create quotation proposal for a customer" })
  async createQuotation(@Body() body: any, @CurrentUser() user: UserPayload) {
    return this.quotationsService.createQuotation(body, user);
  }

  @Patch(":id/status")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Confirm or reject quotation status" })
  async updateQuotationStatus(
    @Param("id") id: string,
    @Body("status") status: string,
    @CurrentUser() user: UserPayload
  ) {
    return this.quotationsService.updateQuotationStatus(id, status, user);
  }

  @Post(":id/convert")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Convert confirmed quotation into an active subscription" })
  async convertToSubscription(
    @Param("id") id: string,
    @Body("planId") planId: string,
    @CurrentUser() user: UserPayload
  ) {
    return this.quotationsService.convertToSubscription(id, planId, user);
  }
}
