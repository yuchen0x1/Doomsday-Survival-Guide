import type { ContentMeta, DangerLevel, ReviewStatus, SourceReference } from '@apocalypse/core';

/** 统一基准时间：内容版本 v1 的创建/更新时间 */
export const DATA_VERSION_DATE = '2026-11-08T00:00:00.000Z';

export interface MetaInput {
  dangerLevel?: DangerLevel;
  reviewStatus?: ReviewStatus;
  sources: SourceReference[];
  version?: number;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  aiGenerated?: boolean;
}

/**
 * 构造内容元数据。
 * 约定：
 * - 由权威来源支撑的正式内容 → reviewStatus: 'reviewed' / 'published'，reviewedBy: 'editorial-team'
 * - 仅多来源交叉、仍需确认 → 'reviewed' 且 credibility 由各来源自身携带
 * - 证据不足 → D 级来源 + 'pending_review'
 * - aiGenerated 内容一律 'pending_review'
 */
export function meta(input: MetaInput): ContentMeta {
  // 随包发布的权威内容即视为已发布；AI 生成内容一律进入待审核
  const reviewStatus = input.reviewStatus ?? (input.aiGenerated ? 'pending_review' : 'published');
  return {
    id: '',
    reviewStatus,
    reviewNote: input.reviewNote,
    reviewedAt: reviewStatus === 'draft' ? undefined : (input.reviewedAt ?? DATA_VERSION_DATE),
    reviewedBy: reviewStatus === 'draft' ? undefined : (input.reviewedBy ?? 'editorial-team'),
    version: input.version ?? 1,
    dangerLevel: input.dangerLevel ?? 'L0',
    sources: input.sources,
    createdAt: DATA_VERSION_DATE,
    updatedAt: DATA_VERSION_DATE,
    aiGenerated: input.aiGenerated ?? false,
  };
}

/** 快捷来源构造 */
export function src(
  id: string,
  name: string,
  type: SourceReference['type'],
  credibility: SourceReference['credibility'],
  extra: Partial<SourceReference> = {},
): SourceReference {
  return { id, name, type, credibility, verifiedAt: DATA_VERSION_DATE, verifiedBy: 'editorial-team', ...extra };
}
