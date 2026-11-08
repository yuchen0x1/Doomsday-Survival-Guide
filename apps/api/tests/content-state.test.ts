import { describe, expect, it } from 'vitest';
import {
  REVIEW_STATUS_LIST,
  REVIEW_TRANSITIONS,
  allowedTargets,
  canTransition,
  isReviewStatus,
} from '../src/common/content-state';

// 纯函数测试：不依赖数据库 / Nest 容器。
// 状态为字符串字面量，运行时直接比较即可；用 any 断言避开跨包类型导入。
const t = (from: string, to: string): boolean =>
  canTransition(from as never, to as never);
const targets = (from: string): string[] => allowedTargets(from as never) as string[];

describe('内容审核状态机', () => {
  it('REVIEW_TRANSITIONS 与约定一致', () => {
    expect(REVIEW_TRANSITIONS).toEqual({
      draft: ['pending_review'],
      pending_review: ['reviewed'],
      reviewed: ['published'],
      published: ['retired'],
      retired: [],
    });
  });

  it('合法边全部允许：draft→pending_review→reviewed→published→retired', () => {
    const legal: [string, string][] = [
      ['draft', 'pending_review'],
      ['pending_review', 'reviewed'],
      ['reviewed', 'published'],
      ['published', 'retired'],
    ];
    for (const [from, to] of legal) {
      expect(t(from, to), `${from}→${to} 应允许`).toBe(true);
    }
  });

  it('非法边全部拒绝（跨级 / 回退 / retired 起边 / 同状态）', () => {
    const illegal: [string, string][] = [
      // 跨级
      ['draft', 'reviewed'],
      ['draft', 'published'],
      ['draft', 'retired'],
      ['pending_review', 'published'],
      ['pending_review', 'retired'],
      ['reviewed', 'retired'],
      // 回退
      ['pending_review', 'draft'],
      ['reviewed', 'draft'],
      ['reviewed', 'pending_review'],
      ['published', 'draft'],
      ['published', 'pending_review'],
      ['published', 'reviewed'],
      // retired 出发的任意边
      ['retired', 'draft'],
      ['retired', 'pending_review'],
      ['retired', 'reviewed'],
      ['retired', 'published'],
      ['retired', 'retired'],
      // 同状态
      ['draft', 'draft'],
      ['pending_review', 'pending_review'],
      ['reviewed', 'reviewed'],
      ['published', 'published'],
    ];
    for (const [from, to] of illegal) {
      expect(t(from, to), `${from}→${to} 应拒绝`).toBe(false);
    }
  });

  it('retired 是终态：到任何状态（含自身）都拒绝', () => {
    for (const to of REVIEW_STATUS_LIST) {
      expect(t('retired', to), `retired→${to} 应拒绝`).toBe(false);
    }
  });

  it('同状态一律拒绝', () => {
    for (const status of REVIEW_STATUS_LIST) {
      expect(t(status, status), `${status}→${status} 应拒绝`).toBe(false);
    }
  });

  it('allowedTargets 返回每个状态的合法目标', () => {
    expect(targets('draft')).toEqual(['pending_review']);
    expect(targets('pending_review')).toEqual(['reviewed']);
    expect(targets('reviewed')).toEqual(['published']);
    expect(targets('published')).toEqual(['retired']);
    expect(targets('retired')).toEqual([]);
  });

  it('allowedTargets 与 canTransition 一致', () => {
    for (const from of REVIEW_STATUS_LIST) {
      const allowed = targets(from);
      for (const to of REVIEW_STATUS_LIST) {
        expect(t(from, to)).toBe(allowed.includes(to));
      }
    }
  });

  it('REVIEW_STATUS_LIST 与 isReviewStatus', () => {
    expect(REVIEW_STATUS_LIST).toEqual([
      'draft',
      'pending_review',
      'reviewed',
      'published',
      'retired',
    ]);
    for (const status of REVIEW_STATUS_LIST) {
      expect(isReviewStatus(status)).toBe(true);
    }
    expect(isReviewStatus('unknown')).toBe(false);
    expect(isReviewStatus('Published')).toBe(false);
    expect(isReviewStatus('')).toBe(false);
    expect(isReviewStatus('DRAFT')).toBe(false);
  });
});
