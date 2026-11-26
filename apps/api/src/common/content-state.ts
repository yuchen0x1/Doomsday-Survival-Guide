import type { ReviewStatus } from './core';

/**
 * 内容审核状态机（纯函数，可单测）。
 * 合法边：draft → pending_review → reviewed → published → retired
 */
export const REVIEW_TRANSITIONS: Record<ReviewStatus, ReviewStatus[]> = {
  draft: ['pending_review'],
  pending_review: ['reviewed'],
  reviewed: ['published'],
  published: ['retired'],
  retired: [],
};

export const REVIEW_STATUS_LIST: ReviewStatus[] = [
  'draft',
  'pending_review',
  'reviewed',
  'published',
  'retired',
];

export function isReviewStatus(value: string): value is ReviewStatus {
  return (REVIEW_STATUS_LIST as string[]).includes(value);
}

/** 是否允许 from → to 迁移 */
export function canTransition(from: ReviewStatus, to: ReviewStatus): boolean {
  if (from === to) return false;
  return REVIEW_TRANSITIONS[from]?.includes(to) ?? false;
}

/** 从某状态出发的合法目标状态 */
export function allowedTargets(from: ReviewStatus): ReviewStatus[] {
  return REVIEW_TRANSITIONS[from] ?? [];
}

/**
 * 内容字段被修改后的审核状态。
 * 已提交/已审核/已发布内容一旦改动，原审核结论失效，必须退回草稿重新走审核；
 * 草稿和已下架内容不对外可见，保持原状态。
 */
export function reviewStatusAfterEdit(status: ReviewStatus): ReviewStatus {
  if (status === 'pending_review' || status === 'reviewed' || status === 'published') {
    return 'draft';
  }
  return status;
}
