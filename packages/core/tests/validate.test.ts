import { describe, it, expect } from 'vitest';
import { validateContentMeta, credibilityRank } from '../src/validate';
import type { ContentMeta, SourceReference } from '../src/types';

const now = '2026-11-08T00:00:00.000Z';

function baseMeta(patch: Partial<ContentMeta> = {}, sources: SourceReference[] = []): ContentMeta {
  return {
    id: 't-1',
    reviewStatus: 'draft',
    version: 1,
    dangerLevel: 'L0',
    sources,
    createdAt: now,
    updatedAt: now,
    ...patch,
  };
}

const govSource: SourceReference = { id: 's1', name: '国家疾控中心', type: 'government', credibility: 'A' };
const dSource: SourceReference = { id: 's2', name: '匿名网络贴', type: 'community', credibility: 'D' };

const hasCode = (issues: { code: string }[], code: string) => issues.some((i) => i.code === code);

describe('内容质量规则', () => {
  it('AI 内容不得标 A 级', () => {
    const issues = validateContentMeta('t-1', '测试', baseMeta({ aiGenerated: true }, [govSource]));
    expect(hasCode(issues, 'AI_CANNOT_RATE_A')).toBe(true);
  });

  it('人工内容标 A 级不报 AI_CANNOT_RATE_A', () => {
    const issues = validateContentMeta('t-1', '测试', baseMeta({}, [govSource]));
    expect(hasCode(issues, 'AI_CANNOT_RATE_A')).toBe(false);
  });

  it('已发布必须有来源', () => {
    const issues = validateContentMeta('t-1', '测试', baseMeta({ reviewStatus: 'published' }));
    expect(hasCode(issues, 'PUBLISHED_NO_SOURCE')).toBe(true);
  });

  it('已发布必须有审核记录', () => {
    const issues = validateContentMeta('t-1', '测试', baseMeta({ reviewStatus: 'published' }, [govSource]));
    expect(hasCode(issues, 'PUBLISHED_NO_REVIEW')).toBe(true);
  });

  it('D 级来源不得发布', () => {
    const issues = validateContentMeta('t-1', '测试',
      baseMeta({ reviewStatus: 'published', reviewedAt: now, reviewedBy: 'editor' }, [dSource]));
    expect(hasCode(issues, 'PUBLISHED_D_CREDIBILITY')).toBe(true);
  });

  it('AI 内容未审核不得发布', () => {
    const issues = validateContentMeta('t-1', '测试',
      baseMeta({ reviewStatus: 'published', aiGenerated: true, reviewedAt: now, reviewedBy: 'editor' }, [govSource]));
    expect(hasCode(issues, 'AI_PENDING_ONLY')).toBe(true);
  });

  it('危险等级低于规则要求时报 DANGER_TOO_LOW 类错误', () => {
    // 正文含“剧毒/致命”，meta 却标 L1
    const issues = validateContentMeta('t-1', '剧毒植物',
      baseMeta({ dangerLevel: 'L1' }, [govSource]), '这种植物剧毒，误食可致命');
    expect(issues.some((i) => i.code.includes('DANGER'))).toBe(true);
  });

  it('合规内容零 error', () => {
    const issues = validateContentMeta('t-1', '绳结入门',
      baseMeta({ reviewStatus: 'published', dangerLevel: 'L0', reviewedAt: now, reviewedBy: 'editor' }, [govSource]),
      '方形结的打法');
    expect(issues.filter((i) => i.level === 'error')).toHaveLength(0);
  });

  it('credibilityRank 顺序 A>D', () => {
    expect(credibilityRank('A')).toBeGreaterThan(credibilityRank('B'));
    expect(credibilityRank('D')).toBe(1);
  });
});
