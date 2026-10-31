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

  @ApiProperty({ example: 'Admin@12345' })
  @IsString()
  @MinLength(9, { message: 'Password must be more than 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/, {
    message: 'Password must be more than 8 characters and contain uppercase, lowercase, and a special character',
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

  @ApiProperty({ example: 'NewAdmin@12345' })
  @IsString()
  @MinLength(9, { message: 'Password must be more than 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/, {
    message: 'Password must be more than 8 characters and contain uppercase, lowercase, and a special character',
  })
  password!: string;
}

export class RefreshTokenDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
