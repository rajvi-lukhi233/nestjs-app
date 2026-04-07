import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/user/user.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request['user'] as { role?: string } | undefined;
    if (!user?.role) {
      throw new ForbiddenException();
    }
    const allowed = requiredRoles.some((role) => user.role === role);
    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
