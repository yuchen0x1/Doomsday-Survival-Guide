import { createHash, randomUUID } from 'node:crypto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { JwtPayload } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(input: {
    email: string;
    password: string;
    name?: string;
  }): Promise<{ user: PublicUser; tokens: TokenPair }> {
    const email = input.email.trim().toLowerCase();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new ConflictException({ code: 'EMAIL_TAKEN', message: '该邮箱已注册' });
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, name: input.name ?? null, role: 'USER' },
    });
    const tokens = await this.issueTokens(user.id, user.email, user.role, user.name);
    return { user: this.toPublic(user), tokens };
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<{ user: PublicUser; tokens: TokenPair }> {
    const email = input.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: '邮箱或密码错误',
      });
    }
    if (user.status !== 'active') {
      throw new UnauthorizedException({ code: 'ACCOUNT_DISABLED', message: '账号已停用' });
    }
    const tokens = await this.issueTokens(user.id, user.email, user.role, user.name);
    return { user: this.toPublic(user), tokens };
  }

  /** 刷新令牌：校验 refresh 类型 → 轮换 → 写入 UserSession */
  async refresh(refreshToken: string): Promise<{ user: PublicUser; tokens: TokenPair }> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: '刷新令牌无效或已过期',
      });
    }
    const sessionId = payload.jti;
    if (payload.type !== 'refresh' || typeof sessionId !== 'string' || !sessionId) {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: '刷新会话已失效，请重新登录',
      });
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: '用户不存在或已停用',
      });
    }
    const tokens = await this.issueTokens(user.id, user.email, user.role, user.name, {
      id: sessionId,
      token: refreshToken,
    });
    return { user: this.toPublic(user), tokens };
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: '用户不存在' });
    }
    return this.toPublic(user);
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: 'USER' | 'ADMIN',
    name: string | null,
    previousRefresh?: { id: string; token: string },
  ): Promise<TokenPair> {
    const accessTtl = (this.config.get<string>('JWT_EXPIRES_IN') ??
      '7d') as JwtSignOptions['expiresIn'];
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role, name: name ?? undefined, type: 'access' },
      { expiresIn: accessTtl },
    );
    const sessionId = randomUUID();
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, email, role, name: name ?? undefined, type: 'refresh' },
      { expiresIn: '30d', jwtid: sessionId },
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
    await this.prisma.$transaction(async (tx) => {
      if (previousRefresh) {
        const consumed = await tx.userSession.updateMany({
          where: {
            id: previousRefresh.id,
            userId,
            refreshTokenHash: hashToken(previousRefresh.token),
            revokedAt: null,
            expiresAt: { gt: now },
          },
          data: { revokedAt: now },
        });
        if (consumed.count !== 1) {
          throw new UnauthorizedException({
            code: 'INVALID_REFRESH_TOKEN',
            message: '刷新会话已失效，请重新登录',
          });
        }
      }
      await tx.userSession.create({
        data: { id: sessionId, userId, refreshTokenHash: hashToken(refreshToken), expiresAt },
      });
      const stale = await tx.userSession.findMany({
        where: { userId, revokedAt: null },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: 10,
        select: { id: true },
      });
      await tx.userSession.deleteMany({
        where: {
          userId,
          OR: [{ revokedAt: { not: null } }, { id: { in: stale.map(({ id }) => id) } }],
        },
      });
    });
    return { accessToken, refreshToken };
  }

  private toPublic(user: {
    id: string;
    email: string;
    name: string | null;
    role: 'USER' | 'ADMIN';
    createdAt: Date;
  }): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
