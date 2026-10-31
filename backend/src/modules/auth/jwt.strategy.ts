import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || "brightloop_super_secret_jwt_access_key_2026",
    });
  }

  async validate(payload: { userId: string; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true, companyName: true },
    });

    if (!user) {
      throw new UnauthorizedException("User no longer exists.");
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyName: user.companyName,
    };
  }
}

