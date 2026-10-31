import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateStaffDto } from "./dto/create-staff.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, UserPayload } from "../../common/decorators/current-user.decorator";

@ApiTags("Users & Staff Management")
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("staff")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Create internal staff member (Admin only)" })
  @ApiResponse({ status: 201, description: "Staff account created." })
  @ApiResponse({ status: 403, description: "Only admins can add staff." })
  async createStaff(@Body() dto: CreateStaffDto) {
    return this.usersService.createStaff(dto);
  }

  @Patch("profile")
  @ApiOperation({ summary: "Update authenticated user profile" })
  async updateProfile(
    @CurrentUser() user: UserPayload,
    @Body() body: { name?: string; phone?: string; companyName?: string; avatarUrl?: string }
  ) {
    return this.usersService.updateProfile(user.userId, body);
  }

  @Post("change-password")
  @ApiOperation({ summary: "Change authenticated user password" })
  async changePassword(
    @CurrentUser() user: UserPayload,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    return this.usersService.changePassword(user.userId, body.currentPassword, body.newPassword);
  }

  @Get()
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "List users filtered by role (Customers or Staff)" })
  @ApiQuery({ name: "role", required: false, enum: ["ADMIN", "STAFF", "CUSTOMER"] })
  async listUsers(@Query("role") role?: string) {
    return this.usersService.listUsers(role);
  }

  @Get(":id")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Get user details by ID" })
  async getUserById(@Param("id") id: string) {
    return this.usersService.getUserById(id);
  }
}
