import { Controller, Get, Post, Body, Param, Query, UseGuards, ForbiddenException, NotFoundException, BadRequestException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, UserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../common/prisma/prisma.service";
import * as bcrypt from "bcryptjs";

@ApiTags("Customers")
@Controller("customers")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService
  ) {}

  @Get()
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "List all customers (Admin & Staff only)" })
  async listCustomers(@Query("search") search?: string) {
    const where: any = { role: "CUSTOMER" };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { companyName: { contains: search } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        companyName: true,
        createdAt: true,
        subscriptions: {
          select: { id: true, status: true, totalAmount: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  @Post()
  @Roles("ADMIN", "STAFF")
  @ApiOperation({ summary: "Create a new customer (Admin & Staff only)" })
  async createCustomer(@Body() data: { email: string; name: string; phone?: string; company?: string; companyName?: string }) {
    if (!data.email || !data.name) {
      throw new BadRequestException("Email and Name are required.");
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException("A customer with this email already exists.");
    }

    const defaultPassword = await bcrypt.hash("Customer#2026", 10);
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: defaultPassword,
        name: data.name,
        phone: data.phone,
        companyName: data.company || data.companyName,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        companyName: true,
        createdAt: true,
      },
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get customer by ID (Admin, Staff, or Self only)" })
  async getCustomerById(@Param("id") id: string, @CurrentUser() user: UserPayload) {
    // SECURITY: Tenant isolation & IDOR check
    if (user.role === "CUSTOMER" && user.userId !== id) {
      throw new ForbiddenException("Access denied: You can only view your own customer profile.");
    }

    const customer = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        companyName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        subscriptions: {
          include: { plan: true },
        },
        invoices: true,
      },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found.");
    }

    return customer;
  }
}
