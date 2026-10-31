import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateStaffDto {
  @ApiProperty({ example: "rep@brightloop.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "StaffPassword#2026" })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: "Sarah Jenkins" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: "STAFF", enum: ["ADMIN", "STAFF"] })
  @IsOptional()
  @IsString()
  role?: string;
}

