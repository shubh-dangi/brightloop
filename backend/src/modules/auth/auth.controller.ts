import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto, RefreshTokenDto } from "./dto/login.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser, UserPayload } from "../../common/decorators/current-user.decorator";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @ApiOperation({ summary: "Register a new user (Customer role with validation)" })
  @ApiResponse({ status: 201, description: "User registered and tokens generated." })
  @ApiResponse({ status: 400, description: "Validation failure (password rules, email format)." })
  @ApiResponse({ status: 409, description: "Email already registered." })
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Authenticate with email and password" })
  @ApiResponse({ status: 200, description: "Login successful; returns JWT token pair." })
  @ApiResponse({ status: 401, description: "Invalid credentials." })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Rotate refresh token and retrieve new access token" })
  @ApiResponse({ status: 200, description: "Token rotated successfully." })
  @ApiResponse({ status: 401, description: "Invalid or revoked refresh token." })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Revoke active refresh token" })
  async logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset link" })
  async forgotPassword(@Body("email") email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password using verified token" })
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get currently authenticated user identity and profile" })
  @ApiResponse({ status: 200, description: "User profile returned." })
  async getMe(@CurrentUser() user: UserPayload) {
    return this.authService.getMe(user.userId);
  }
}
