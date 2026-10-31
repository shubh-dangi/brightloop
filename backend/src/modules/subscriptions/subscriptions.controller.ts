import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { SubscriptionsService } from "./subscriptions.service";
import { CreateSubscriptionDto, SubscriptionStatus } from "./dto/create-subscription.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, UserPayload } from "../../common/decorators/current-user.decorator";

@ApiTags("Subscriptions Lifecycle")
@Controller("subscriptions")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: "Create a subscription (Staff/Admin for any customer; Customer for self)" })
  @ApiResponse({ status: 201, description: "Subscription created with lines." })
  async createSubscription(
    @Body() dto: CreateSubscriptionDto,
    @CurrentUser() user: UserPayload
  ) {
    return this.subscriptionsService.createSubscription(dto, user);
  }

  @Get()
  @ApiOperation({ summary: "List subscriptions (Staff/Admin sees all, Customer sees only their own)" })
  @ApiQuery({ name: "status", required: false, enum: SubscriptionStatus })
  async listSubscriptions(
    @CurrentUser() user: UserPayload,
    @Query("status") status?: string
  ) {
    return this.subscriptionsService.listSubscriptions(user, status);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get subscription details, product lines, and billing info" })
  async getSubscriptionById(
    @Param("id") id: string,
    @CurrentUser() user: UserPayload
  ) {
    return this.subscriptionsService.getSubscriptionById(id, user);
  }

  @Patch(":id/status")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Transition subscription state (Draft -> Quotation -> Confirmed -> Active -> Paused -> Closed)" })
  async transitionStatus(
    @Param("id") id: string,
    @Body("status") targetStatus: SubscriptionStatus,
    @CurrentUser() user: UserPayload
  ) {
    return this.subscriptionsService.transitionStatus(id, targetStatus, user);
  }

  @Patch(":id/pause")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Pause subscription" })
  async pauseSubscription(@Param("id") id: string, @CurrentUser() user: UserPayload) {
    return this.subscriptionsService.transitionStatus(id, SubscriptionStatus.PAUSED, user);
  }

  @Patch(":id/renew")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Renew subscription" })
  async renewSubscription(@Param("id") id: string, @CurrentUser() user: UserPayload) {
    return this.subscriptionsService.transitionStatus(id, SubscriptionStatus.ACTIVE, user);
  }

  @Patch(":id/close")
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Close subscription" })
  async closeSubscription(@Param("id") id: string, @CurrentUser() user: UserPayload) {
    return this.subscriptionsService.transitionStatus(id, SubscriptionStatus.CLOSED, user);
  }
}

