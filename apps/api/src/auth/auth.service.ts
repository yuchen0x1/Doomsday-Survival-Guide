import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { AuthUser } from '../common/decorators';
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
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: '刷新令牌类型错误',
      });
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: '用户不存在或已停用',
      });
    }
    const tokens = await this.issueTokens(user.id, user.email, user.role, user.name, refreshToken);
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
    previousRefresh?: string,
  ): Promise<TokenPair> {
    const accessTtl = (this.config.get<string>('JWT_EXPIRES_IN') ??
      '7d') as JwtSignOptions['expiresIn'];
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role, name: name ?? undefined, type: 'access' },
      { expiresIn: accessTtl },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, email, role, name: name ?? undefined, type: 'refresh' },
      { expiresIn: '30d' },
    );

    const hash = (token: string): string => bcrypt.hashSync(token, 4);
    if (previousRefresh) {
      const previous = await this.prisma.userSession.findFirst({
        where: { userId, revokedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      if (previous && bcrypt.compareSync(previousRefresh, previous.refreshTokenHash)) {
        await this.prisma.userSession.update({
          where: { id: previous.id },
          data: { revokedAt: new Date() },
        });
      }
    }
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
    await this.prisma.userSession.create({
      data: { userId, refreshTokenHash: hash(refreshToken), expiresAt },
    });
    // 只保留最近 10 个会话
    const stale = await this.prisma.userSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: 10,
      select: { id: true },
    });
    if (stale.length > 0) {
      await this.prisma.userSession.deleteMany({ where: { id: { in: stale.map((s) => s.id) } } });
    }
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
