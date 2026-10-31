import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateTaxRuleDto {
  @ApiProperty({ example: "Standard VAT" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 18.0, description: "Tax percentage rate" })
  @IsNumber()
  @Min(0)
  rate: number;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

