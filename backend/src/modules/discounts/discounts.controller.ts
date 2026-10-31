import { Controller, Post, Get, Body, Query, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { DiscountsService } from "./discounts.service";
import { CreateDiscountRuleDto } from "./dto/create-discount.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Discounts & Coupons")
@Controller("discounts")
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create discount rule (Admin only)" })
  @ApiResponse({ status: 201, description: "Discount rule created." })
  async createDiscountRule(@Body() dto: CreateDiscountRuleDto) {
    return this.discountsService.createDiscountRule(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "STAFF")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all active discount rules" })
  async listDiscountRules() {
    return this.discountsService.listDiscountRules();
  }

  @Post("validate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Validate discount code eligibility (POST payload from frontend)" })
  async validateDiscountPost(
    @Body() body: { code: string; purchaseAmount?: number; subtotal?: number; quantity?: number }
  ) {
    const amount = body.purchaseAmount ?? body.subtotal ?? 0;
    const qty = body.quantity ?? 1;
    return this.discountsService.validateAndApplyDiscount(body.code, Number(amount), Number(qty));
  }

  @Get("validate")
  @ApiOperation({ summary: "Validate discount code against a cart / order subtotal (Query params)" })
  @ApiQuery({ name: "code", required: true, example: "BRIGHT20" })
  @ApiQuery({ name: "subtotal", required: true, example: 1000 })
  @ApiQuery({ name: "quantity", required: true, example: 5 })
  async validateDiscount(
    @Query("code") code: string,
    @Query("subtotal") subtotal: number,
    @Query("quantity") quantity: number
  ) {
    return this.discountsService.validateAndApplyDiscount(code, Number(subtotal), Number(quantity));
  }
}
