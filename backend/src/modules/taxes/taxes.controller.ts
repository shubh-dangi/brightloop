import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { TaxesService } from "./taxes.service";
import { CreateTaxRuleDto } from "./dto/create-tax.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Taxes & Auto-Calculation")
@Controller("taxes")
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create tax rule (Admin only)" })
  @ApiResponse({ status: 201, description: "Tax rule created." })
  async createTaxRule(@Body() dto: CreateTaxRuleDto) {
    return this.taxesService.createTaxRule(dto);
  }

  @Get()
  @ApiOperation({ summary: "List active tax rules" })
  async listTaxRules() {
    return this.taxesService.listTaxRules();
  }
}

