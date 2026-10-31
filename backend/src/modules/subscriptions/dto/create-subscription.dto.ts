import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class SubscriptionLineDto {
  @ApiProperty({ example: "prod_123" })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ example: "var_456" })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 1200.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 18.0, default: 0.0 })
  @IsOptional()
  @IsNumber()
  taxRate?: number;
}

export enum SubscriptionStatus {
  DRAFT = "DRAFT",
  QUOTATION = "QUOTATION",
  CONFIRMED = "CONFIRMED",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  CLOSED = "CLOSED",
}

export class CreateSubscriptionDto {
  @ApiProperty({ example: "cust_123" })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: "plan_123" })
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiPropertyOptional({ example: "Net 30" })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({ example: "2026-11-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: "2027-11-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ type: [SubscriptionLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionLineDto)
  lines: SubscriptionLineDto[];
}

