import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Activity & Audit Ledger")
@Controller("activity")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ActivityController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Get audit activity logs" })
  async getActivityLogs() {
    return this.usersService.getActivityLogs();
  }
}
