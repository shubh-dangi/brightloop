import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateProductVariantDto {
  @ApiProperty({ example: "Odoo Brand Edition" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "Brand" })
  @IsString()
  @IsNotEmpty()
  attributeKey: string;

  @ApiProperty({ example: "Odoo" })
  @IsString()
  @IsNotEmpty()
  attributeValue: string;

  @ApiProperty({ example: 560.0, description: "Additional price added to base product sales price" })
  @IsNumber()
  @Min(0)
  extraPrice: number;
}

export class CreateProductDto {
  @ApiProperty({ example: "Brightloop Business Cloud" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: "SOFTWARE", enum: ["SOFTWARE", "SERVICE", "ADDON"] })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: 1200.0 })
  @IsNumber()
  @Min(0)
  salesPrice: number;

  @ApiProperty({ example: 450.0 })
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiPropertyOptional({ example: "Core ERP subscription license with multi-tenant modules" })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [CreateProductVariantDto] })
  @IsOptional()
  variants?: CreateProductVariantDto[];
}

