import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class SignupDto {
  @ApiProperty({ example: "customer@company.com" })
  @IsEmail({}, { message: "Invalid email format." })
  email: string;

  @ApiProperty({
    example: "BrightPass#2026",
    description: "Must be >8 characters, with uppercase, lowercase and special character.",
  })
  @IsString()
  @MinLength(9, { message: "Password must be more than 8 characters." })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/, {
    message: "Password must contain an uppercase letter, a lowercase letter, and a special character.",
  })
  password: string;

  @ApiProperty({ example: "Alex Smith" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: "CUSTOMER", enum: ["ADMIN", "STAFF", "CUSTOMER"] })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: "+1 555-0199" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "Bright Horizons Ltd" })
  @IsOptional()
  @IsString()
  companyName?: string;
}

