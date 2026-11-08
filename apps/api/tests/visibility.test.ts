import { describe, expect, it } from 'vitest';
import {
  filterVisible,
  hasUnverifiedCredibility,
  isVisibleTo,
  type VisibleRow,
} from '../src/common/visibility';

const publishedClean: VisibleRow = {
  reviewStatus: 'published',
  sources: [{ credibility: 'A' }],
};

describe('公开列表可见性', () => {
  it('GUEST / USER 只能看到 published（非 published 一律不可见）', () => {
    for (const status of ['draft', 'pending_review', 'reviewed', 'retired']) {
      const row: VisibleRow = { reviewStatus: status as VisibleRow['reviewStatus'] };
      expect(isVisibleTo(row, 'GUEST'), `${status} 对 GUEST 应不可见`).toBe(false);
      expect(isVisibleTo(row, 'USER'), `${status} 对 USER 应不可见`).toBe(false);
    }
    expect(isVisibleTo(publishedClean, 'GUEST')).toBe(true);
    expect(isVisibleTo(publishedClean, 'USER')).toBe(true);
  });

  it('ADMIN 可见全部审核状态', () => {
    for (const status of ['draft', 'pending_review', 'reviewed', 'published', 'retired']) {
      const row: VisibleRow = { reviewStatus: status as VisibleRow['reviewStatus'] };
      expect(isVisibleTo(row, 'ADMIN'), `${status} 对 ADMIN 应可见`).toBe(true);
    }
  });

  it('D 级可信度识别：来源 / 置信度 / 识别置信度', () => {
    expect(
      hasUnverifiedCredibility({ reviewStatus: 'published', sources: [{ credibility: 'D' }] }),
    ).toBe(true);
    expect(
      hasUnverifiedCredibility({
        reviewStatus: 'published',
        sources: [{ credibility: 'A' }, { credibility: 'D' }],
      }),
    ).toBe(true);
    expect(hasUnverifiedCredibility({ reviewStatus: 'published', confidence: 'D' })).toBe(true);
    expect(
      hasUnverifiedCredibility({ reviewStatus: 'published', identificationConfidence: 'D' }),
    ).toBe(true);
    expect(
      hasUnverifiedCredibility({ reviewStatus: 'published', sources: [{ credibility: 'A' }] }),
    ).toBe(false);
    expect(hasUnverifiedCredibility({ reviewStatus: 'published' })).toBe(false);
  });

  it('已发布但含 D 级来源 / D 级置信度，不得出现在公开列表', () => {
    const rows: VisibleRow[] = [
      { reviewStatus: 'published', sources: [{ credibility: 'A' }] }, // 唯一可见
      { reviewStatus: 'published', sources: [{ credibility: 'D' }] }, // D 来源剔除
      { reviewStatus: 'published', confidence: 'D' }, // D 置信度剔除
      { reviewStatus: 'published', identificationConfidence: 'D' }, // D 识别置信度剔除
      { reviewStatus: 'draft' }, // 非 published 剔除
      { reviewStatus: 'pending_review', sources: [{ credibility: 'A' }] }, // 非 published 剔除
      { reviewStatus: 'reviewed' }, // 非 published 剔除
      { reviewStatus: 'retired', sources: [{ credibility: 'A' }] }, // 非 published 剔除
    ];

    const guestRows = filterVisible(rows, 'GUEST');
    expect(guestRows).toHaveLength(1);
    expect(guestRows[0].sources).toEqual([{ credibility: 'A' }]);
    expect(filterVisible(rows, 'USER')).toEqual(guestRows);
  });

  it('GUEST 与 USER 视角一致；ADMIN 不受 D 级 / 状态限制', () => {
    const rows: VisibleRow[] = [
      publishedClean,
      { reviewStatus: 'published', sources: [{ credibility: 'D' }] },
      { reviewStatus: 'draft' },
    ];
    expect(filterVisible(rows, 'GUEST')).toEqual([publishedClean]);
    expect(filterVisible(rows, 'USER')).toEqual(filterVisible(rows, 'GUEST'));
    expect(filterVisible(rows, 'ADMIN')).toHaveLength(3);
  });
});
