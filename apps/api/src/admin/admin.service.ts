import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { canTransition, isReviewStatus } from '../common/content-state';
import {
  AUTHORITATIVE_SOURCE_TYPES,
  KIND_DEFS,
  buildMeta,
  extraTextOf,
  titleOf,
  type ContentKind,
  type SourceRow,
} from '../common/kinds';
import { validateContentMeta, type ContentMeta, type ValidationIssue } from '../common/core';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../common/decorators';

const PROTECTED_FIELDS = new Set([
  'id',
  'createdAt',
  'updatedAt',
  'version',
  'reviewStatus',
  'reviewedAt',
  'reviewedBy',
  'reviewNote',
  'aiGenerated',
]);

const MEDICAL_CATEGORY_SLUGS = new Set(['first-aid', 'medicines']);

export interface StatusInput {
  status: string;
  note?: string;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private delegate(kind: ContentKind): any {
    return (this.prisma as unknown as Record<string, unknown>)[KIND_DEFS[kind].delegate];
  }

  private async loadSources(ids: string[]): Promise<SourceRow[]> {
    const unique = [...new Set(ids)];
    if (unique.length === 0) return [];
    return this.prisma.source.findMany({ where: { id: { in: unique } } });
  }

  /* ---------------- 内容 CRUD ---------------- */

  async list(
    kind: ContentKind,
    query: { page?: number; limit?: number; status?: string },
  ): Promise<Record<string, unknown>> {
    const delegate = this.delegate(kind);
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const where: Record<string, unknown> = {};
    if (query.status) {
      if (!isReviewStatus(query.status)) {
        throw new BadRequestException({
          code: 'INVALID_STATUS',
          message: `未知审核状态：${query.status}`,
        });
      }
      where.reviewStatus = query.status;
    }
    const [rows, total] = await Promise.all([
      delegate.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }) as Promise<Record<string, unknown>[]>,
      delegate.count({ where }) as Promise<number>,
    ]);
    const def = KIND_DEFS[kind];
    const sources = await this.loadSources(
      rows.flatMap((r) => (Array.isArray(r.sourceIds) ? (r.sourceIds as string[]) : [])),
    );
    const byId = new Map(sources.map((s) => [s.id, s]));
    return {
      kind,
      items: rows.map((r) =>
        def.serialize(
          r,
          (Array.isArray(r.sourceIds) ? (r.sourceIds as string[]) : [])
            .map((id) => byId.get(id))
            .filter((s): s is SourceRow => Boolean(s)),
        ),
      ),
      total,
      page,
      limit,
    };
  }

  async create(
    kind: ContentKind,
    body: Record<string, unknown>,
    actor: AuthUser,
  ): Promise<Record<string, unknown>> {
    const def = KIND_DEFS[kind];
    const delegate = this.delegate(kind);
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (PROTECTED_FIELDS.has(key) || key === 'sourceIds') continue;
      data[key] = value;
    }
    const id = typeof body.id === 'string' && body.id ? body.id : `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record = await delegate.create({
      data: {
        ...data,
        id,
        reviewStatus: 'draft',
        aiGenerated: body.aiGenerated === true,
        sourceIds: Array.isArray(body.sourceIds) ? (body.sourceIds as string[]) : [],
        version: 1,
      },
    });
    await this.syncTags(kind, record.id as string, Array.isArray(body.tags) ? (body.tags as string[]) : []);
    await this.prisma.auditLog.create({
      data: {
        userId: actor.sub,
        action: `CREATE ${kind}`,
        method: 'POST',
        path: `/api/admin/content/${kind}`,
        status: 201,
        payload: { id: record.id } as Prisma.InputJsonValue,
      },
    });
    const sources = await this.loadSources(record.sourceIds as string[]);
    return def.serialize(record as Record<string, unknown>, sources);
  }

  async update(
    kind: ContentKind,
    id: string,
    body: Record<string, unknown>,
    actor: AuthUser,
  ): Promise<Record<string, unknown>> {
    const def = KIND_DEFS[kind];
    const delegate = this.delegate(kind);
    const existing = (await delegate.findUnique({ where: { id } })) as Record<string, unknown> | null;
    if (!existing) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '内容不存在' });
    }
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (PROTECTED_FIELDS.has(key) || key === 'id') continue;
      data[key] = value;
    }
    const record = (await delegate.update({
      where: { id },
      data: { ...data, version: { increment: 1 } },
    })) as Record<string, unknown>;
    if (Array.isArray(body.tags)) {
      await this.syncTags(kind, id, body.tags as string[]);
    }
    await this.prisma.auditLog.create({
      data: {
        userId: actor.sub,
        action: `UPDATE ${kind}`,
        method: 'PATCH',
        path: `/api/admin/content/${kind}/${id}`,
        status: 200,
        payload: { id } as Prisma.InputJsonValue,
      },
    });
    const sources = await this.loadSources(record.sourceIds as string[]);
    return def.serialize(record, sources);
  }

  /* ---------------- 状态机迁移 + 审核规则 ---------------- */

  async transition(
    kind: ContentKind,
    id: string,
    input: StatusInput,
    actor: AuthUser,
  ): Promise<Record<string, unknown>> {
    const def = KIND_DEFS[kind];
    const delegate = this.delegate(kind);
    const row = (await delegate.findUnique({ where: { id } })) as Record<string, unknown> | null;
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '内容不存在' });
    }
    const to = input.status;
    if (!isReviewStatus(to)) {
      throw new BadRequestException({
        code: 'INVALID_STATUS',
        message: `未知审核状态：${to}`,
      });
    }
    const from = row.reviewStatus as import('../common/core').ReviewStatus;
    if (!canTransition(from, to)) {
      throw new ConflictException({
        code: 'INVALID_TRANSITION',
        message: `不允许的状态迁移：${from} → ${to}`,
      });
    }

    const now = new Date();
    const reviewedAt = to === 'published' ? now : row.reviewedAt;
    const reviewedBy = to === 'published' ? actor.email : row.reviewedBy;
    const sources = await this.loadSources(row.sourceIds as string[]);
    const metaRow = { ...row, reviewStatus: to, reviewedAt, reviewedBy };
    const meta = buildMeta(
      metaRow as unknown as import('../common/kinds').MetaColumns,
      sources,
    ) as unknown as ContentMeta;

    const issues: ValidationIssue[] = validateContentMeta(
      id,
      titleOf(kind, row),
      meta,
      extraTextOf(kind, row),
    );

    // 急救 / 药物 / 医疗类文章发布前必须有权威来源
    if (to === 'published' && this.needsAuthoritativeSource(kind, row)) {
      const hasAuthoritative = sources.some((s) => AUTHORITATIVE_SOURCE_TYPES.has(s.type));
      if (!hasAuthoritative) {
        issues.push({
          level: 'error',
          code: 'NO_AUTHORITATIVE_SOURCE',
          targetId: id,
          message: `《${titleOf(kind, row)}》：医疗急救类内容必须有权威来源（government/medical/academic/ngo）`,
        });
      }
    }

    const errors = issues.filter((i) => i.level === 'error');
    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'CONTENT_VALIDATION_FAILED',
        message: errors.map((e) => e.message).join('；'),
        issues: errors,
      });
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = (await delegate.update({
        where: { id },
        data: {
          reviewStatus: to,
          reviewNote: input.note ?? null,
          reviewedAt,
          reviewedBy,
          version: { increment: 1 },
        },
      })) as Record<string, unknown>;
      await tx.reviewRecord.create({
        data: {
          contentKind: kind,
          contentId: id,
          fromStatus: from,
          toStatus: to,
          decision: to,
          note: input.note ?? null,
          reviewerId: actor.sub,
          reviewerEmail: actor.email,
        },
      });
      return next;
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actor.sub,
        action: `TRANSITION ${kind} ${from}->${to}`,
        method: 'POST',
        path: `/api/admin/content/${kind}/${id}/status`,
        status: 200,
        payload: { id, from, to } as Prisma.InputJsonValue,
      },
    });

    const serialized = def.serialize(updated, sources);
    (serialized as Record<string, unknown>).reviewIssues = issues;
    return serialized;
  }

  private needsAuthoritativeSource(
    kind: ContentKind,
    row: Record<string, unknown>,
  ): boolean {
    if (kind === 'first-aid' || kind === 'medicines') return true;
    if (kind === 'articles') {
      return MEDICAL_CATEGORY_SLUGS.has(String(row.categorySlug));
    }
    return false;
  }

  private async syncTags(kind: string, contentId: string, tags: string[]): Promise<void> {
    await this.prisma.contentTag.deleteMany({ where: { kind, contentId } });
    const unique = [...new Set(tags.filter((t) => typeof t === 'string' && t.length > 0))];
    if (unique.length > 0) {
      await this.prisma.contentTag.createMany({
        data: unique.map((tag) => ({ kind, contentId, tag })),
      });
    }
  }

  /* ---------------- 来源 ---------------- */

  async createSource(body: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      throw new BadRequestException({ code: 'INVALID_SOURCE', message: '来源名称必填' });
    }
    const source = await this.prisma.source.create({
      data: {
        name: body.name,
        url: typeof body.url === 'string' ? body.url : null,
        publisher: typeof body.publisher === 'string' ? body.publisher : null,
        publishedAt: body.publishedAt ? new Date(String(body.publishedAt)) : null,
        verifiedAt: body.verifiedAt ? new Date(String(body.verifiedAt)) : null,
        verifiedBy: typeof body.verifiedBy === 'string' ? body.verifiedBy : null,
        type: (body.type as 'manual') ?? 'manual',
        credibility: (body.credibility as 'C') ?? 'C',
      },
    });
    return source as unknown as Record<string, unknown>;
  }

  async listSources(): Promise<Record<string, unknown>[]> {
    const sources = await this.prisma.source.findMany({ orderBy: { createdAt: 'desc' } });
    return sources as unknown as Record<string, unknown>[];
  }

  /* ---------------- 审计与统计 ---------------- */

  async audit(query: { page?: number; limit?: number }): Promise<Record<string, unknown>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(200, Math.max(1, query.limit ?? 50));
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count(),
    ]);
    return { items, total, page, limit };
  }

  async stats(): Promise<Record<string, unknown>> {
    const kindStatusCounts: Record<string, Record<string, number>> = {};
    let pendingReview = 0;
    let published = 0;
    let totalContent = 0;
    for (const kind of Object.keys(KIND_DEFS) as ContentKind[]) {
      const delegate = this.delegate(kind);
      const grouped = (await delegate.groupBy({
        by: ['reviewStatus'],
        _count: { _all: true },
      })) as { reviewStatus: string; _count: { _all: number } }[];
      const counts: Record<string, number> = {};
      for (const g of grouped) {
        counts[g.reviewStatus] = g._count._all;
        totalContent += g._count._all;
        if (g.reviewStatus === 'pending_review') pendingReview += g._count._all;
        if (g.reviewStatus === 'published') published += g._count._all;
      }
      kindStatusCounts[kind] = counts;
    }
    const [users, sources, reviewRecords, auditLogs, sessions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.source.count(),
      this.prisma.reviewRecord.count(),
      this.prisma.auditLog.count(),
      this.prisma.userSession.count({ where: { revokedAt: null } }),
    ]);
    return {
      totalContent,
      published,
      pendingReview,
      users,
      activeSessions: sessions,
      sources,
      reviewRecords,
      auditLogs,
      byKind: kindStatusCounts,
    };
  }

  async reviews(kind?: ContentKind, id?: string): Promise<Record<string, unknown>[]> {
    const where: Record<string, unknown> = {};
    if (kind) where.contentKind = kind;
    if (id) where.contentId = id;
    return this.prisma.reviewRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    }) as unknown as Promise<Record<string, unknown>[]>;
  }
}
