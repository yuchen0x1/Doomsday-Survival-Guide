import { Injectable, NotFoundException } from '@nestjs/common';
import { type ContentKind, KIND_DEFS, type SourceRow } from '../common/kinds';
import { isVisibleTo, type ViewerRole } from '../common/visibility';
import { PrismaService } from '../prisma/prisma.service';

export interface ListQuery {
  page?: number;
  limit?: number;
  category?: string;
  danger?: string;
  status?: string;
  tag?: string;
}

export interface PagedResult {
  kind: ContentKind;
  items: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
}

/** 各 kind 的可搜索字段（仅使用模型真实存在的列） */
const SEARCH_FIELDS: Record<ContentKind, string[]> = {
  articles: ['title', 'summary'],
  plants: ['name', 'scientificName'],
  animals: ['name', 'scientificName'],
  insects: ['name', 'scientificName'],
  medicines: ['name', 'purpose'],
  'first-aid': ['title', 'summary'],
  skills: ['title', 'summary'],
  supplies: ['name', 'purpose'],
  scenarios: ['title', 'summary'],
  hazards: ['title', 'description'],
  quizzes: ['question'],
};

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private delegate(kind: ContentKind): any {
    return (this.prisma as unknown as Record<string, unknown>)[KIND_DEFS[kind].delegate];
  }

  async loadSources(ids: string[]): Promise<SourceRow[]> {
    const unique = [...new Set(ids)];
    if (unique.length === 0) return [];
    return this.prisma.source.findMany({ where: { id: { in: unique } } });
  }

  /** 构建查询条件：普通用户强制 published + D 级剔除 */
  private async buildWhere(
    kind: ContentKind,
    query: ListQuery,
    role: ViewerRole,
  ): Promise<Record<string, unknown>> {
    const def = KIND_DEFS[kind];
    const and: Record<string, unknown>[] = [];
    if (role !== 'ADMIN') {
      and.push({ reviewStatus: 'published' });
      if (def.dExcludeField) {
        and.push({ NOT: { [def.dExcludeField]: 'D' } });
      }
      const dSources = await this.prisma.source.findMany({
        where: { credibility: 'D' },
        select: { id: true },
      });
      const dIds = dSources.map((s) => s.id);
      if (dIds.length > 0) {
        and.push({ NOT: { sourceIds: { hasSome: dIds } } });
      }
    } else if (query.status) {
      and.push({ reviewStatus: query.status });
    }
    if (query.category && def.categoryField) {
      and.push({ [def.categoryField]: query.category });
    }
    if (query.danger) and.push({ dangerLevel: query.danger });
    if (query.tag) and.push({ tags: { has: query.tag } });
    return and.length > 0 ? { AND: and } : {};
  }

  async list(kind: ContentKind, query: ListQuery, role: ViewerRole): Promise<PagedResult> {
    const def = KIND_DEFS[kind];
    const delegate = this.delegate(kind);
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const where = await this.buildWhere(kind, query, role);

    const [rows, total] = await Promise.all([
      delegate.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }) as Promise<Record<string, unknown>[]>,
      delegate.count({ where }) as Promise<number>,
    ]);

    const sourceIds = rows.flatMap((r) =>
      Array.isArray(r.sourceIds) ? (r.sourceIds as string[]) : [],
    );
    const sources = await this.loadSources(sourceIds);
    const byId = new Map(sources.map((s) => [s.id, s]));
    const rowSources = (r: Record<string, unknown>): SourceRow[] =>
      (Array.isArray(r.sourceIds) ? (r.sourceIds as string[]) : [])
        .map((id) => byId.get(id))
        .filter((s): s is SourceRow => Boolean(s));

    const visibleRows = rows.filter((r) =>
      isVisibleTo(
        {
          reviewStatus: r.reviewStatus as string,
          sources: rowSources(r),
          confidence: typeof r.confidence === 'string' ? r.confidence : undefined,
          identificationConfidence:
            typeof r.identificationConfidence === 'string' ? r.identificationConfidence : undefined,
        },
        role,
      ),
    );

    return {
      kind,
      items: visibleRows.map((r) => def.serialize(r, rowSources(r))),
      total,
      page,
      limit,
    };
  }

  async detail(kind: ContentKind, id: string, role: ViewerRole): Promise<Record<string, unknown>> {
    const def = KIND_DEFS[kind];
    const delegate = this.delegate(kind);
    const row = (await delegate.findUnique({ where: { id } })) as Record<string, unknown> | null;
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '内容不存在' });
    }
    const sources = await this.loadSources(
      Array.isArray(row.sourceIds) ? (row.sourceIds as string[]) : [],
    );
    const visible = isVisibleTo(
      {
        reviewStatus: row.reviewStatus as string,
        sources,
        confidence: typeof row.confidence === 'string' ? row.confidence : undefined,
        identificationConfidence:
          typeof row.identificationConfidence === 'string'
            ? row.identificationConfidence
            : undefined,
      },
      role,
    );
    if (!visible) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '内容不存在或未发布' });
    }
    let extra: Record<string, unknown> = {};
    if (def.detail) {
      extra = await def.detail(this.prisma, row);
    }
    return def.serialize({ ...row, ...extra }, sources);
  }

  async search(q: string, role: ViewerRole, limit = 20): Promise<Record<string, unknown>[]> {
    const keyword = q.trim();
    if (!keyword) return [];
    const results: Record<string, unknown>[] = [];
    for (const kind of Object.keys(KIND_DEFS) as ContentKind[]) {
      if (results.length >= limit) break;
      const def = KIND_DEFS[kind];
      const delegate = this.delegate(kind);
      const where = await this.buildWhere(kind, {}, role);
      const fields = SEARCH_FIELDS[kind];
      const or = fields.map((field) => ({
        [field]: { contains: keyword, mode: 'insensitive' },
      }));
      const rows = (await delegate.findMany({
        where: Object.keys(where).length > 0 ? { AND: [where, { OR: or }] } : { OR: or },
        orderBy: { updatedAt: 'desc' },
        take: Math.min(10, limit - results.length),
      })) as Record<string, unknown>[];

      const sources = await this.loadSources(
        rows.flatMap((r) => (Array.isArray(r.sourceIds) ? (r.sourceIds as string[]) : [])),
      );
      const byId = new Map(sources.map((s) => [s.id, s]));
      for (const row of rows) {
        const rowSources = (Array.isArray(row.sourceIds) ? (row.sourceIds as string[]) : [])
          .map((id) => byId.get(id))
          .filter((s): s is SourceRow => Boolean(s));
        if (
          !isVisibleTo(
            {
              reviewStatus: row.reviewStatus as string,
              sources: rowSources,
              confidence: typeof row.confidence === 'string' ? row.confidence : undefined,
              identificationConfidence:
                typeof row.identificationConfidence === 'string'
                  ? row.identificationConfidence
                  : undefined,
            },
            role,
          )
        ) {
          continue;
        }
        const title =
          typeof row[def.titleField] === 'string' ? (row[def.titleField] as string) : '';
        const subtitle =
          typeof row.summary === 'string'
            ? (row.summary as string)
            : typeof row.scientificName === 'string'
              ? (row.scientificName as string)
              : typeof row.purpose === 'string'
                ? (row.purpose as string)
                : '';
        results.push({
          kind,
          id: String(row.id),
          title,
          subtitle: subtitle.slice(0, 120),
          category:
            def.categoryField && typeof row[def.categoryField] === 'string'
              ? (row[def.categoryField] as string)
              : '',
          tags: Array.isArray(row.tags) ? row.tags : [],
          dangerLevel: String(row.dangerLevel ?? 'L0'),
        });
      }
    }
    return results;
  }

  /** 首页统计：全部来自真实计数（游客/用户只统计已发布） */
  async homeStats(role: ViewerRole, userId?: string): Promise<Record<string, number>> {
    const publicOnly = role !== 'ADMIN';
    const count = async (kind: ContentKind): Promise<number> => {
      const def = KIND_DEFS[kind];
      const delegate = this.delegate(kind);
      const where = publicOnly ? { reviewStatus: 'published' } : {};
      const base = (await delegate.count({ where })) as number;
      if (!publicOnly || !def.dExcludeField) return base;
      const excluded = (await delegate.count({
        where: { AND: [where, { [def.dExcludeField]: 'D' }] },
      })) as number;
      return base - excluded;
    };

    const [
      articles,
      plants,
      animals,
      insects,
      skills,
      medicines,
      firstAid,
      supplies,
      scenarios,
      hazards,
      quizzes,
      bookmarks,
      offlineDownloaded,
    ] = await Promise.all([
      count('articles'),
      count('plants'),
      count('animals'),
      count('insects'),
      count('skills'),
      count('medicines'),
      count('first-aid'),
      count('supplies'),
      count('scenarios'),
      count('hazards'),
      count('quizzes'),
      userId ? this.prisma.bookmark.count({ where: { userId } }) : 0,
      userId ? this.prisma.offlinePackage.count({ where: { userId, status: 'downloaded' } }) : 0,
    ]);

    return {
      articles,
      plants,
      animals: animals + insects,
      insects,
      skills,
      medicines,
      firstAid,
      supplies,
      scenarios,
      hazards,
      quizzes,
      total:
        articles +
        plants +
        animals +
        insects +
        skills +
        medicines +
        firstAid +
        supplies +
        scenarios +
        hazards +
        quizzes,
      bookmarks,
      offlineDownloaded,
    };
  }
}
