import { describe, expect, it } from 'vitest';
import { SearchIndex } from '../src/search';
import type { SearchDocument } from '../src/types';

const docs: SearchDocument[] = [
  {
    id: 'a1',
    kind: 'article',
    title: '暴雨洪涝应对',
    subtitle: '城市内涝自救',
    tags: ['洪水', '暴雨'],
    dangerLevel: 'L2',
    category: 'disaster',
    body: '洪水来临时向高处转移，不要涉水行走',
  },
  {
    id: 'p1',
    kind: 'plant',
    title: '夹竹桃',
    subtitle: 'Oleander · 剧毒观赏植物',
    tags: ['有毒', '植物'],
    dangerLevel: 'L3',
    category: 'toxic',
    body: '全株含强心苷，误食可致死',
  },
  {
    id: 's1',
    kind: 'skill',
    title: '绳结技巧',
    subtitle: '常用绳结打法',
    tags: ['绳结', '工具'],
    dangerLevel: 'L0',
    category: 'tools',
    body: '方形结、八字结、称人结的打法',
  },
  {
    id: 'f1',
    kind: 'first_aid',
    title: '心肺复苏',
    subtitle: 'CPR 操作步骤',
    tags: ['急救', 'CPR'],
    dangerLevel: 'L2',
    category: 'first-aid',
    body: '胸外按压与人工呼吸的比例',
  },
];

const idx = new SearchIndex().build(docs);

describe('SearchIndex 中文检索', () => {
  it('索引构建后 size 正确', () => {
    expect(idx.size).toBe(4);
  });

  it('精确查询命中标题', () => {
    const r = idx.search('夹竹桃');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].document.id).toBe('p1');
  });

  it('部分词查询（bigram 分词）', () => {
    const r = idx.search('洪涝');
    expect(r.some((x) => x.document.id === 'a1')).toBe(true);
  });

  it('英文与大小写不敏感', () => {
    const r = idx.search('CPR');
    expect(r.some((x) => x.document.id === 'f1')).toBe(true);
  });

  it('空查询返回空数组', () => {
    expect(idx.search('')).toEqual([]);
    expect(idx.search('   ')).toEqual([]);
  });

  it('kind 过滤', () => {
    const r = idx.search('植物', { kind: 'plant' });
    expect(r.every((x) => x.document.kind === 'plant')).toBe(true);
    expect(r.length).toBeGreaterThan(0);
  });

  it('category 过滤', () => {
    const r = idx.search('急救', { category: 'first-aid' });
    expect(r.every((x) => x.document.category === 'first-aid')).toBe(true);
  });

  it('maxDanger 过滤掉高于上限的内容', () => {
    const r = idx.search('植物', { maxDanger: 'L2' });
    expect(
      r.every(
        (x) =>
          x.document.dangerLevel === 'L0' ||
          x.document.dangerLevel === 'L1' ||
          x.document.dangerLevel === 'L2',
      ),
    ).toBe(true);
    expect(r.some((x) => x.document.id === 'p1')).toBe(false);
  });

  it('limit 生效', () => {
    expect(idx.search('的', { limit: 2 }).length).toBeLessThanOrEqual(2);
  });

  it('标题命中排在正文命中之前（字段权重）', () => {
    const r = idx.search('绳结');
    expect(r[0].document.id).toBe('s1');
  });

  it('add/remove 动态更新', () => {
    const i2 = new SearchIndex().build(docs);
    i2.add({
      id: 'x1',
      kind: 'article',
      title: '雪崩逃生',
      subtitle: '',
      tags: [],
      dangerLevel: 'L3',
      category: 'disaster',
      body: '雪崩时弃包侧向逃离',
    });
    expect(i2.size).toBe(5);
    expect(i2.search('雪崩').some((x) => x.document.id === 'x1')).toBe(true);
    i2.remove('x1');
    expect(i2.size).toBe(4);
    expect(i2.search('雪崩').some((x) => x.document.id === 'x1')).toBe(false);
  });

  it('无匹配词返回空', () => {
    expect(idx.search('量子色动力学')).toEqual([]);
  });
});
