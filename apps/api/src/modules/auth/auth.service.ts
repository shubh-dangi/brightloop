import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { SignupDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import {
  AuthResponseData,
  AuthTokens,
  UserDto,
  OrganizationDto,
  SystemRole,
  PermissionKey,
} from '@brightloop/contracts';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponseData> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An account with this email address already exists');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
    });

    const orgName = dto.organizationName || `${dto.name.split(' ')[0]}'s Workspace`;
    const orgSlug = `${orgName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

    // Use transaction for multi-tenant account creation
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email.toLowerCase(),
          passwordHash,
          isEmailVerified: true, // Auto-verified in development
          userPreference: {
            create: {
              theme: 'system',
              accentColor: 'indigo',
              density: 'comfortable',
              language: 'en',
              timezone: 'UTC',
              dateFormat: 'YYYY-MM-DD',
            },
          },
        },
      });

      // 2. Create Organization
      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug: orgSlug,
          settings: {
            create: {
              displayName: orgName,
              supportEmail: dto.email.toLowerCase(),
              timezone: 'UTC',
              dateFormat: 'YYYY-MM-DD',
              allowMemberInvites: true,
              enforce2FA: false,
            },
          },
        },
      });

      // 3. Create Default Roles for this Organization
      const ownerRole = await tx.role.create({
        data: {
          organizationId: org.id,
          name: SystemRole.OWNER,
          description: 'Full workspace ownership and control',
          isSystem: true,
        },
      });

      await tx.role.createMany({
        data: [
          {
            organizationId: org.id,
            name: SystemRole.ADMIN,
            description: 'Can manage workspace members, records, and settings',
            isSystem: true,
          },
          {
            organizationId: org.id,
            name: SystemRole.MEMBER,
            description: 'Can create and manage records and collaborate',
            isSystem: true,
          },
          {
            organizationId: org.id,
            name: SystemRole.VIEWER,
            description: 'Read-only access across the workspace',
            isSystem: true,
          },
          {
            organizationId: org.id,
            name: SystemRole.CUSTOMER,
            description: 'Customer portal access for subscriptions, invoices, and payments',
            isSystem: true,
          },
        ],
      });

      // 4. Attach all permissions to Owner role
      const allPermissions = await tx.permission.findMany();
      if (allPermissions.length > 0) {
        await tx.rolePermission.createMany({
          data: allPermissions.map((p) => ({
            roleId: ownerRole.id,
            permissionId: p.id,
          })),
        });
      }

      // 5. Add User as active Owner member
      const member = await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          roleId: ownerRole.id,
          status: 'ACTIVE',
        },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
          organization: true,
        },
      });

      // 6. Log activity
      await tx.activityLog.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          action: 'organization:created',
          entity: 'Organization',
          entityId: org.id,
          details: { name: org.name, slug: org.slug },
        },
      });

      return { user, org, member };
    });

    const tokens = await this.generateTokens(result.user.id, result.user.email, result.org.id);

    return this.buildAuthResponse(result.user, result.org, result.member, tokens);
  }

  async login(dto: LoginDto): Promise<AuthResponseData> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        memberships: {
          include: {
            organization: true,
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const activeMembership =
      user.memberships.find((m) => m.status === 'ACTIVE') || user.memberships[0];

    if (!activeMembership) {
      throw new UnauthorizedException('User account has no associated active organization');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      activeMembership.organizationId,
    );

    // Record login activity
    await this.prisma.activityLog.create({
      data: {
        organizationId: activeMembership.organizationId,
        userId: user.id,
        action: 'auth:login',
        entity: 'User',
        entityId: user.id,
      },
    });

    return this.buildAuthResponse(
      user,
      activeMembership.organization,
      activeMembership,
      tokens,
    );
  }

  async refreshTokens(rawRefreshToken: string): Promise<AuthTokens> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            memberships: {
              include: { organization: true },
            },
          },
        },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revoked) {
      // Possible token reuse detected - revoke all tokens for this user for security
      await this.prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { revoked: true },
      });
      throw new UnauthorizedException('Token reuse detected. All sessions revoked.');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Pick active organization
    const activeOrgId =
      storedToken.user.memberships.find((m) => m.status === 'ACTIVE')?.organizationId ||
      storedToken.user.memberships[0]?.organizationId;

    // Generate new tokens (rotation)
    const newTokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      activeOrgId,
    );

    // Mark previous token replaced and revoked
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        revoked: true,
        replacedByToken: this.hashToken(newTokens.refreshToken || ''),
      },
    });

    return newTokens;
  }

  async logout(userId: string, rawRefreshToken?: string): Promise<void> {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash, userId },
        data: { revoked: true },
      });
    } else {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
      });
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Consistent response even if email does not exist to avoid email enumeration
    if (!user) {
      return { message: 'If this email is registered, a password reset link has been dispatched.' };
    }

    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = this.hashToken(rawResetToken);
    const resetExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedResetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // In production, dispatch email with rawResetToken via EmailService
    this.logger.log(`Password reset requested for user: ${user.id}`);
    return { message: 'If this email is registered, a password reset link has been dispatched.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const hashedToken = this.hashToken(dto.token);
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Password reset token is invalid or has expired');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
    });

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      }),
      // Revoke all existing sessions on password reset
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revoked: true },
      }),
    ]);

    return { message: 'Password has been successfully updated. You may now login.' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });

    return { message: 'Email address verified successfully' };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async generateTokens(
    userId: string,
    email: string,
    organizationId?: string,
  ): Promise<AuthTokens> {
    const payload = { sub: userId, email, organizationId };

    const accessSecret = this.configService.get<string>(
      'jwt.accessSecret',
      'brightloop_default_dev_secret_access_token_min_32_characters!',
    );
    const refreshSecret = this.configService.get<string>(
      'jwt.refreshSecret',
      'brightloop_default_dev_secret_refresh_token_min_32_characters!',
    );

    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: '15m',
    });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: 900, // 15 mins
    };
  }

  private buildAuthResponse(
    user: any,
    currentOrg: any,
    membership: any,
    tokens: AuthTokens,
  ): AuthResponseData {
    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    const currentOrgDto: OrganizationDto = {
      id: currentOrg.id,
      name: currentOrg.name,
      slug: currentOrg.slug,
      logoUrl: currentOrg.logoUrl,
      createdAt: currentOrg.createdAt.toISOString(),
    };

    const organizations: OrganizationDto[] = (user.memberships || []).map((m: any) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      logoUrl: m.organization.logoUrl,
      createdAt: m.organization.createdAt.toISOString(),
    }));

    const permissions: string[] =
      membership.role?.permissions?.map(
        (rp: any) => rp.permission?.key || rp.permissionKey || rp,
      ) || [];

    return {
      user: userDto,
      currentOrganization: currentOrgDto,
      organizations: organizations.length > 0 ? organizations : [currentOrgDto],
      role: membership.role?.name || SystemRole.OWNER,
      permissions,
      tokens,
    };
  }
}
