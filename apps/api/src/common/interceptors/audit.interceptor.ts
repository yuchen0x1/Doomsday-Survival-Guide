import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../decorators';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const AUDIT_PATHS = new Set(['/api/admin/audit']);

/**
 * 审计拦截器：对写操作落一条 AuditLog。
 * 失败只记录日志，绝不影响业务响应。
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const type = context.getType<'http'>();
    if (type !== 'http') return next.handle();

    const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    if (!MUTATING.has(req.method)) return next.handle();
    if (AUDIT_PATHS.has(req.path)) return next.handle();

    const started = Date.now();
    return next.handle().pipe(
      tap({
        next: () => this.write(req, 200, Date.now() - started),
        error: (err: unknown) => {
          const status =
            err && typeof err === 'object' && 'status' in err
              ? Number((err as { status: number }).status)
              : 500;
          this.write(req, Number.isFinite(status) ? status : 500, Date.now() - started);
        },
      }),
    );
  }

  private write(req: Request & { user?: AuthUser }, status: number, latencyMs: number): void {
    const body = req.body as unknown;
    let payload: unknown = null;
    if (body && typeof body === 'object') {
      const text = JSON.stringify(body);
      payload = text.length > 2000 ? { truncated: true, size: text.length } : body;
    }
    const userId = req.user?.sub ?? null;
    const path = req.path;
    const action = `${req.method} ${path}`;
    void this.prisma.auditLog
      .create({
        data: {
          userId,
          action,
          method: req.method,
          path,
          status,
          ip: req.ip ?? null,
          userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : null,
          payload: payload === null ? undefined : (payload as object),
        },
      })
      .catch((err: unknown) => {
        // 审计写入失败不影响业务
        void err;
      });
  }
}
