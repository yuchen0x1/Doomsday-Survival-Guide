import 'reflect-metadata';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { AuditInterceptor } from '../src/common/interceptors/audit.interceptor';

async function loggedPayload(path: string, body: unknown) {
  const create = vi.fn(async () => ({}));
  const interceptor = new AuditInterceptor({ auditLog: { create } } as never);
  const req = { method: 'PUT', path, body, headers: {}, user: { sub: 'user' } };
  const context = {
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => req }),
  };
  await firstValueFrom(interceptor.intercept(context as never, { handle: () => of({ ok: true }) }));
  return create.mock.calls[0]?.[0];
}

describe('审计日志敏感数据保护', () => {
  it.each(['/api/sync/conversations', '/api/sync/map-markers', '/api/sync/profile', '/sync/notes'])(
    '个人同步仅记录操作元数据，不复制隐私载荷：%s',
    async (path) => {
      const logged = await loggedPayload(path, { body: 'private content', lat: 12.34 });
      expect(logged).toMatchObject({
        data: {
          userId: 'user',
          path,
          payload: { redacted: true, reason: 'personal-data' },
        },
      });
      expect(JSON.stringify(logged)).not.toContain('private content');
    },
  );

  it('仍遮盖认证密钥并保留普通管理操作载荷', async () => {
    expect(
      await loggedPayload('/api/auth/login', { email: 'u@example.com', password: 'secret' }),
    ).toMatchObject({ data: { payload: { email: 'u@example.com', password: '[REDACTED]' } } });
    expect(await loggedPayload('/api/admin/content/articles', { title: '清单' })).toMatchObject({
      data: { payload: { title: '清单' } },
    });
  });
});
