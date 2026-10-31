import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Inject,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

export interface TenantContext {
  id: string;
  name: string;
  slug: string;
  role: string;
  permissions: string[];
}

@Injectable()
export class TenantGuard implements CanActivate {
  private reflector: Reflector;

  constructor(@Optional() @Inject(Reflector) reflector?: Reflector) {
    this.reflector =
      reflector && typeof reflector.getAllAndOverride === 'function'
        ? reflector
        : new Reflector();
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User is not authenticated');
    }

    // Memberships attached during JWT validation or user hydration
    const memberships = user.memberships || [];
    if (!memberships.length) {
      throw new ForbiddenException('User is not associated with any active organization');
    }

    // Client may optionally request a specific organization via header
    const requestedOrgId = request.headers['x-organization-id'] as string;

    let activeMembership = null;
    if (requestedOrgId) {
      activeMembership = memberships.find(
        (m: any) => m.organizationId === requestedOrgId && m.status === 'ACTIVE',
      );
      if (!activeMembership) {
        throw new ForbiddenException(
          'Access denied: You are not an active member of the requested organization',
        );
      }
    } else {
      activeMembership = memberships.find((m: any) => m.status === 'ACTIVE') || memberships[0];
    }

    if (!activeMembership) {
      throw new ForbiddenException('No active organization membership found');
    }

    // Extract role and permissions
    const roleName = activeMembership.role?.name || 'VIEWER';
    const permissions: string[] =
      activeMembership.role?.permissions?.map(
        (rp: any) => rp.permission?.key || rp.permissionKey || rp,
      ) || [];

    const tenantContext: TenantContext = {
      id: activeMembership.organizationId,
      name: activeMembership.organization?.name || 'Organization',
      slug: activeMembership.organization?.slug || 'org',
      role: roleName,
      permissions,
    };

    request.currentTenant = tenantContext;
    return true;
  }
}
