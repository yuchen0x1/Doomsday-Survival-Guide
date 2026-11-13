import { getDataset } from '@apocalypse/knowledge-data';
import { describe, expect, it } from 'vitest';
import { resolveRef, resolveRefs } from '../src/lib/knowledge';

/**
 * 路由一致性回归测试。
 * 曾发现：文章 relatedIds 指向 /knowledge/:categorySlug（分类页）、
 * 危险记录指向 /hazards/:id（404），与 App.tsx 实际路由 /article/:id、/hazard/:id 不符。
 * 此测试锁定所有解析出来的 href 前缀与真实路由一致。
 */

const ROUTE_PREFIXES: Record<string, string> = {
  article: '/article/',
  plant: '/plants/',
  animal: '/animals/',
  insect: '/insects/',
  medicine: '/medicines/',
  first_aid: '/first-aid/',
  skill: '/skills/',
  supply: '/supplies/',
  scenario: '/simulator/',
  hazard: '/hazard/',
};

const ds = getDataset();

describe('resolveRef / resolveRefs 路由一致性', () => {
  it('每种带前缀的 refId 都解析到正确的详情路由', () => {
    const samples: [string, string][] = [
      ['article', ds.articles[0].id],
      ['plant', ds.plants[0].id],
      ['animal', ds.animals[0].id],
      ['insect', ds.insects[0].id],
      ['medicine', ds.medicines[0].id],
      ['first_aid', ds.firstAid[0].id],
      ['skill', ds.skills[0].id],
      ['supply', ds.supplies[0].id],
      ['scenario', ds.scenarios[0].id],
      ['hazard', ds.hazards[0].id],
    ];
    for (const [kind, id] of samples) {
      const ref = resolveRef(`${kind}:${id}`);
      expect(ref, `${kind}:${id} 未解析`).not.toBeNull();
      expect(ref!.href, `${kind}:${id} 路由前缀错误`).toBe(`${ROUTE_PREFIXES[kind]}${id}`);
      expect(ref!.title.length).toBeGreaterThan(0);
    }
  });

  it('纯 id 也能解析（收藏/历史用的是纯 id）', () => {
    expect(resolveRef(ds.articles[0].id)?.href).toBe(`/article/${ds.articles[0].id}`);
    expect(resolveRef(ds.hazards[0].id)?.href).toBe(`/hazard/${ds.hazards[0].id}`);
  });

  it('全部文章的 relatedIds 都能解析且链接前缀合法', () => {
    let total = 0;
    for (const a of ds.articles) {
      expect(a.relatedIds.length, `${a.id} 相关知识为空`).toBeGreaterThanOrEqual(3);
      const links = resolveRefs(a.relatedIds);
      expect(links.length, `${a.id} 相关知识全部无法解析`).toBe(a.relatedIds.length);
      for (const link of links) {
        expect(link.href.startsWith('/'), `非法 href: ${link.href}`).toBe(true);
        // 不得再退化为分类页或列表页
        expect(
          link.href.startsWith('/knowledge/'),
          `${a.id} 文章链接退化为分类页: ${link.href}`,
        ).toBe(false);
        expect(link.href.startsWith('/hazards/'), `${a.id} 危险链接错误: ${link.href}`).toBe(false);
        total++;
      }
    }
    expect(total).toBeGreaterThanOrEqual(180);
  });

  it('不存在的 id 返回 null / 被过滤', () => {
    expect(resolveRef('article:not-exist')).toBeNull();
    expect(resolveRefs(['not-exist'])).toEqual([]);
  });

  it('题库 sourceRefId 全部指向真实条目', () => {
    for (const q of ds.quizQuestions) {
      const ref = resolveRef(q.sourceRefId);
      expect(ref, `${q.id} 来源 ${q.sourceRefId} 无法解析`).not.toBeNull();
    }
  });
});
