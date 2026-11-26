import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../decorators';
import { IS_PUBLIC_KEY } from '../decorators';

export interface JwtPayload {
  jti?: string;
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name?: string;
  type?: 'access' | 'refresh';
}

/**
 * 自写 JWT 守卫（不引入 passport）。
 * - 受保护路由要求 `Authorization: Bearer <token>` 且为 access 类型令牌
 * - @Public() 路由允许匿名访问；若携带有效令牌则附加可选的登录用户
 * - 每次请求都校验数据库中的账号状态与角色，停用/降权后立即生效
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: AuthUser;
    }>();
    const header = request.headers['authorization'];
    const token =
      typeof header === 'string' && header.toLowerCase().startsWith('bearer ')
        ? header.slice(7).trim()
        : undefined;
    if (!token) {
      if (isPublic) return true;
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: '缺少访问令牌',
      });
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      if (payload.type === 'refresh') {
        throw new Error('refresh token cannot be used as access token');
      }
    } catch {
      if (isPublic) return true;
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: '令牌无效或已过期',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, status: true },
    });
    if (!user || user.status !== 'active') {
      if (isPublic) return true;
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: '账号不存在或已停用',
      });
    }
    request.user = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name ?? undefined,
    };
    return true;
  }
}
