import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators';
import type { AuthUser } from '../decorators';

/** 角色守卫：路由声明 @Roles('ADMIN') 时校验登录用户角色 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: '需要登录' });
    }
    if (!roles.includes(user.role)) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: '需要管理员权限' });
    }
    return true;
  }
}
