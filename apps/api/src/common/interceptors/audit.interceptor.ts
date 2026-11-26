import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../decorators';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const AUDIT_PATHS = new Set(['/api/admin/audit']);
const AI_CONTENT_PATHS = ['/ai/chat', '/ai/identify'];
const SENSITIVE_KEY = /pass(?:word)?|secret|token|authorization|cookie|api[-_]?key|credential/i;
const MAX_PAYLOAD_CHARS = 2000;
const MAX_STRING_CHARS = 500;
const MAX_ITEMS = 50;
const MAX_DEPTH = 6;

/** 递归遮盖敏感字段，并限制单条审计载荷的深度与长度。 */
function redactValue(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return '[DEPTH_LIMIT]';
  if (typeof value === 'string') {
    return value.length > MAX_STRING_CHARS ? `${value.slice(0, MAX_STRING_CHARS)}…` : value;
  }
  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_ITEMS).map((item) => redactValue(item, depth + 1));
    if (value.length > MAX_ITEMS) items.push(`[${value.length - MAX_ITEMS} more items]`);
    return items;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>).slice(
      0,
      MAX_ITEMS,
    )) {
      out[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : redactValue(item, depth + 1);
    }
    return out;
  }
  return value;
}

function auditPayload(path: string, body: unknown): object | undefined {
  if (!body || typeof body !== 'object') return undefined;
  if (AI_CONTENT_PATHS.some((prefix) => path.includes(prefix))) {
    return { redacted: true, reason: 'ai-content' };
  }
  try {
    const text = JSON.stringify(body);
    if (text.length > MAX_PAYLOAD_CHARS) return { truncated: true, size: text.length };
    return redactValue(body) as object;
  } catch {
    // 无法序列化的请求体不写入审计，也绝不阻断业务响应。
    return { redacted: true, reason: 'unserializable' };
  }
}

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

    return next.handle().pipe(
      tap({
        next: () => this.write(req, 200),
        error: (err: unknown) => {
          const status =
            err && typeof err === 'object' && 'status' in err
              ? Number((err as { status: number }).status)
              : 500;
          this.write(req, Number.isFinite(status) ? status : 500);
        },
      }),
    );
  }

  private write(req: Request & { user?: AuthUser }, status: number): void {
    const userId = req.user?.sub ?? null;
    const path = req.path;
    const action = `${req.method} ${path}`;
    const payload = auditPayload(path, req.body as unknown);
    void this.prisma.auditLog
      .create({
        data: {
          userId,
          action,
          method: req.method,
          path,
          status,
          ip: req.ip ?? null,
          userAgent:
            typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : null,
          payload,
        },
      })
      .catch((err: unknown) => {
        // 审计写入失败不影响业务
        void err;
      });
  }
}
