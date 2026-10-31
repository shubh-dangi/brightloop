import { Controller, Post, Get, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { QuotationsService } from "./quotations.service";
import { CreateQuotationTemplateDto } from "./dto/create-template.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Quotation Templates & Offers")
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
}

