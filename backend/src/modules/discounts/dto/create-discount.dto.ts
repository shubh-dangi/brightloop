import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

export enum DiscountScope {
  PRODUCT = "PRODUCT",
  SUBSCRIPTION = "SUBSCRIPTION",
}

export class CreateDiscountRuleDto {
  @ApiProperty({ example: "BRIGHT20" })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  type: DiscountType;

  @ApiProperty({ example: 20.0, description: "20% or $20 fixed discount" })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ enum: DiscountScope, default: DiscountScope.SUBSCRIPTION })
  @IsOptional()
  @IsEnum(DiscountScope)
  scope?: DiscountScope;

  @ApiPropertyOptional({ example: "prod_123", description: "Required if scope is PRODUCT" })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ example: 5, description: "Minimum quantity required to unlock discount" })
  @IsOptional()
  @IsInt()
  @Min(0)
  minQuantity?: number;

  @ApiPropertyOptional({ example: 1000.0, description: "Minimum total purchase value" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchase?: number;

  @ApiPropertyOptional({ example: 100, description: "Maximum total redemption count" })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @ApiPropertyOptional({ example: "2026-01-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59.000Z" })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

