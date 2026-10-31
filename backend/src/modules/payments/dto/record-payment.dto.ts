import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  CASH = "CASH",
  STRIPE = "STRIPE",
}

export class RecordPaymentDto {
  @ApiProperty({ example: "inv_123" })
  @IsString()
  @IsNotEmpty()
  invoiceId: string;

  @ApiProperty({ example: 1416.0 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.BANK_TRANSFER })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({ example: "2026-11-02T10:30:00.000Z" })
  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @ApiPropertyOptional({ example: "TXN-8874-9912" })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ example: "Wire transfer received via Citibank" })
  @IsOptional()
  @IsString()
  note?: string;
}

