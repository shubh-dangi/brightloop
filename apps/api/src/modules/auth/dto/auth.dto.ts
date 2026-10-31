import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'Alex Morgan' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'alex@brightloop.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|.*[^A-Za-z0-9]).{8,}$/, {
    message: 'Password must contain uppercase, lowercase, and at least one number or symbol',
  })
  password!: string;

  @ApiPropertyOptional({ example: 'Brightloop Workspace' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  organizationName?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'owner@brightloop.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'owner@brightloop.local' })
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|.*[^A-Za-z0-9]).{8,}$/, {
    message: 'Password must contain uppercase, lowercase, and at least one number or symbol',
  })
  password!: string;
}

export class RefreshTokenDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
