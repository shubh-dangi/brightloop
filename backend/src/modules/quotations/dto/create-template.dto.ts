import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class TemplateLineDto {
  @ApiProperty({ example: "prod_123" })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ example: "var_456" })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ example: 1, default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateQuotationTemplateDto {
  @ApiProperty({ example: "Standard SaaS Deal Template" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: "plan_123" })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiProperty({ example: 30, description: "Number of days quotation remains valid" })
  @IsInt()
  @Min(1)
  validityDays: number;

  @ApiProperty({ type: [TemplateLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateLineDto)
  lines: TemplateLineDto[];
}

