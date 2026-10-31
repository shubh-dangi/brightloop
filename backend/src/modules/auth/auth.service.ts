import { Injectable, ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../common/prisma/prisma.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { userId, email, role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || "brightloop_super_secret_jwt_access_key_2026",
      expiresIn: "15m",
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || "brightloop_super_secret_jwt_refresh_key_2026",
      expiresIn: "7d",
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException("An account with this email already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        role: dto.role || "CUSTOMER",
        phone: dto.phone,
        companyName: dto.companyName,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "CUSTOMER_REGISTERED",
        entity: "User",
        entityId: user.id,
      },
    });

    const isOwnerOrAdmin = user.role === "ADMIN" || user.role === "OWNER";
    const mappedRole = isOwnerOrAdmin ? "OWNER" : user.role;

    const currentOrganization = {
      id: "org-demo-workspace",
      name: user.companyName || "Brightloop Primary Workspace",
      slug: "brightloop-primary-workspace",
      createdAt: user.createdAt.toISOString(),
    };

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: true,
        companyName: user.companyName,
        createdAt: user.createdAt.toISOString(),
      },
      currentOrganization,
      organizations: [currentOrganization],
      role: mappedRole,
      permissions: [
        "org:read", "customers:read", "subscriptions:read", "invoices:read"
      ],
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    let isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      // Fallback check case variations for hackathon demo convenience
      isMatch =
        (await bcrypt.compare(dto.password.toLowerCase(), user.passwordHash)) ||
        (await bcrypt.compare(dto.password.charAt(0).toUpperCase() + dto.password.slice(1), user.passwordHash));
    }
    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "USER_LOGIN",
        entity: "User",
        entityId: user.id,
      },
    });

    const isOwnerOrAdmin = user.role === "ADMIN" || user.role === "OWNER";
    const mappedRole = isOwnerOrAdmin ? "OWNER" : user.role;

    const defaultPermissions = [
      "org:read", "org:update", "records:read", "records:create", "records:update",
      "records:delete", "members:read", "members:invite", "roles:manage", "settings:update",
      "audit:read", "customers:read", "customers:create", "customers:update", "customers:delete",
      "products:read", "products:create", "products:update", "products:delete",
      "plans:read", "plans:create", "plans:update", "plans:delete",
      "subscriptions:read", "subscriptions:create", "subscriptions:update", "subscriptions:delete",
      "invoices:read", "invoices:create", "invoices:update", "invoices:delete",
      "discounts:read", "discounts:create", "discounts:update", "discounts:delete",
      "payments:read", "payments:create", "payments:update", "payments:delete"
    ];

    const currentOrganization = {
      id: "org-demo-workspace",
      name: user.companyName || "Brightloop Primary Workspace",
      slug: "brightloop-primary-workspace",
      createdAt: user.createdAt.toISOString(),
    };

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        isEmailVerified: true,
        companyName: user.companyName,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      currentOrganization,
      organizations: [currentOrganization],
      role: mappedRole,
      permissions: defaultPermissions,
    };
  }

  async refresh(refreshToken: string) {
    let decoded: any;
    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || "brightloop_super_secret_jwt_refresh_key_2026",
      });
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token.");
    }

    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token is expired or revoked.");
    }

    // Token Rotation: revoke old token
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return this.generateTokens(stored.user.id, stored.user.email, stored.user.role);
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      });
    }
    return { success: true, message: "Logged out successfully." };
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        companyName: true,
        phone: true,
        createdAt: true,
      },
    });
  }
}

