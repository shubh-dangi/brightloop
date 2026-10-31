import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export enum BillingInterval {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum EndBehavior {
  AUTO_CLOSE = "AUTO_CLOSE",
  PAUSABLE = "PAUSABLE",
  RENEWABLE = "RENEWABLE",
}

export class CreatePlanDto {
  @ApiProperty({ example: "Enterprise Cloud Annual Plan" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 499.0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ enum: BillingInterval, example: BillingInterval.MONTHLY })
  @IsEnum(BillingInterval)
  billingInterval: BillingInterval;

  @ApiPropertyOptional({ example: 5, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantity?: number;

  @ApiPropertyOptional({ example: "2026-01-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59.000Z" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: EndBehavior, default: EndBehavior.RENEWABLE })
  @IsOptional()
  @IsEnum(EndBehavior)
  endBehavior?: EndBehavior;
}

