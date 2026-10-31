import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
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

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const currentTenant = request.currentTenant;

    if (!currentTenant) {
      throw new ForbiddenException('Tenant context missing for role validation');
    }

    const hasRole = requiredRoles.includes(currentTenant.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient role privileges. Required: [${requiredRoles.join(', ')}], Current: ${currentTenant.role}`,
      );
    }

    return true;
  }
}
