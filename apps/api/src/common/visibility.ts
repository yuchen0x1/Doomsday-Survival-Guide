import type { Credibility, ReviewStatus } from './core';

export type ViewerRole = 'GUEST' | 'USER' | 'ADMIN';

export interface VisibleRow {
  reviewStatus: ReviewStatus | string;
  sources?: { credibility: Credibility | string }[];
  confidence?: Credibility | string;
  identificationConfidence?: Credibility | string;
}

/** 是否含 D 级（未核实）可信度 —— D 级内容不得出现在已发布列表 */
export function hasUnverifiedCredibility(row: VisibleRow): boolean {
  if (row.confidence === 'D') return true;
  if (row.identificationConfidence === 'D') return true;
  if (row.sources?.some((s) => s.credibility === 'D')) return true;
  return false;
}

/**
 * 列表可见性（纯函数）：
 * - 管理员可见全部
 * - 普通用户/游客仅可见 published
 * - published 中含 D 级可信度的一律剔除（D 级不得发布）
 */
export function isVisibleTo(row: VisibleRow, role: ViewerRole): boolean {
  if (role === 'ADMIN') return true;
  if (row.reviewStatus !== 'published') return false;
  if (hasUnverifiedCredibility(row)) return false;
  return true;
}

export function filterVisible<T extends VisibleRow>(rows: T[], role: ViewerRole): T[] {
  return rows.filter((row) => isVisibleTo(row, role));
}
