import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
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
  @ApiOperation({ summary: "List all customers" })
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
  @ApiOperation({ summary: "Create a new customer" })
  async createCustomer(@Body() data: any) {
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
  @ApiOperation({ summary: "Get customer by ID" })
  async getCustomerById(@Param("id") id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: { include: { plan: true } },
        invoices: true,
      },
    });
  }
}

