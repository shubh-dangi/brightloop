import { Controller, Post, Get, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { CreateProductDto, CreateProductVariantDto } from "./dto/create-product.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Products & Variants")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new product with optional variants (Admin only)" })
  @ApiResponse({ status: 201, description: "Product created with variants." })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Get()
  @ApiOperation({ summary: "List all products and their variants" })
  @ApiQuery({ name: "activeOnly", required: false, type: Boolean })
  async listProducts(@Query("activeOnly") activeOnly?: boolean) {
    return this.productsService.listProducts(activeOnly !== false);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get product details with variants by ID" })
  async getProductById(@Param("id") id: string) {
    return this.productsService.getProductById(id);
  }

  @Post(":id/variants")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add a new variant to an existing product (e.g. Odoo brand +$560)" })
  async addVariant(@Param("id") id: string, @Body() dto: CreateProductVariantDto) {
    return this.productsService.addVariant(id, dto);
  }
}

