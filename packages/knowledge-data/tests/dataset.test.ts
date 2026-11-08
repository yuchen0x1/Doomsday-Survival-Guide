import { describe, it, expect } from 'vitest';
import { validateDataset, computeRequiredDanger, DANGER_ORDER } from '@apocalypse/core';
import { getDataset, getSearchDocuments, getHomeCounts } from '../src/index';

/**
 * 全量知识数据质量闸门：
 * 任何数据修改后此测试必须通过，否则不得发布。
 */

const ds = getDataset();

describe('数据集完整性', () => {
  it('各知识库条目数达到交付下限', () => {
    expect(ds.articles.length).toBeGreaterThanOrEqual(60);
    expect(ds.plants.length).toBeGreaterThanOrEqual(40);
    expect(ds.animals.length).toBeGreaterThanOrEqual(30);
    expect(ds.animalTracks.length).toBeGreaterThanOrEqual(25);
    expect(ds.insects.length).toBeGreaterThanOrEqual(15);
    expect(ds.medicines.length).toBeGreaterThanOrEqual(15);
    expect(ds.firstAid.length).toBeGreaterThanOrEqual(24);
    expect(ds.skills.length).toBeGreaterThanOrEqual(30);
    expect(ds.supplies.length).toBeGreaterThanOrEqual(60);
    expect(ds.scenarios.length).toBe(12);
    expect(ds.hazards.length).toBeGreaterThanOrEqual(20);
    expect(ds.quizQuestions.length).toBeGreaterThanOrEqual(60);
  });

  it('id 全局唯一（按库内）', () => {
    for (const [name, list] of Object.entries({
      articles: ds.articles, plants: ds.plants, animals: ds.animals,
      firstAid: ds.firstAid, skills: ds.skills, medicines: ds.medicines,
      hazards: ds.hazards, quizzes: ds.quizQuestions, supplies: ds.supplies,
      scenarios: ds.scenarios, insects: ds.insects,
    })) {
      const ids = (list as { id: string }[]).map((x) => x.id);
      expect(new Set(ids).size, `${name} id 重复`).toBe(ids.length);
    }
  });

  it('搜索文档与数据集同步', () => {
    const docs = getSearchDocuments();
    expect(docs.length).toBeGreaterThanOrEqual(
      ds.articles.length + ds.plants.length + ds.animals.length,
    );
    expect(getHomeCounts().articles).toBe(ds.articles.length);
  });
});

describe('审核规则闸门（AI 知识质量控制）', () => {
  it('validateDataset 无 error 级问题', () => {
    const issues = validateDataset({
      articles: ds.articles, plants: ds.plants, animals: ds.animals,
      firstAid: ds.firstAid, skills: ds.skills, medicines: ds.medicines,
    });
    const errors = issues.filter((i) => i.level === 'error');
    // 打印便于定位（不阻断 warning）
    if (errors.length > 0) {
      console.error('数据质量问题：', errors.slice(0, 20));
    }
    expect(errors).toHaveLength(0);
  });

  it('AI 生成内容无一标 A 级', () => {
    const all = [...ds.articles, ...ds.plants, ...ds.animals, ...ds.firstAid, ...ds.skills, ...ds.medicines];
    for (const x of all) {
      if (x.meta.aiGenerated) {
        expect(x.meta.sources.some((s) => s.credibility === 'A'), `${x.id} AI 内容标了 A 级`).toBe(false);
      }
    }
  });

  it('已发布内容均有来源与审核记录', () => {
    const all = [...ds.articles, ...ds.plants, ...ds.animals, ...ds.firstAid, ...ds.skills, ...ds.medicines];
    for (const x of all) {
      if (x.meta.reviewStatus === 'published') {
        expect(x.meta.sources.length, `${x.id} 发布但无来源`).toBeGreaterThan(0);
        expect(x.meta.reviewedAt, `${x.id} 发布但无审核时间`).toBeTruthy();
        expect(x.meta.reviewedBy, `${x.id} 发布但无审核人`).toBeTruthy();
      }
    }
  });

  it('危险等级不低于审核规则要求', () => {
    const samples: { id: string; text: string; level: string }[] = [
      ...ds.articles.map((a) => ({ id: a.id, text: `${a.title} ${a.summary}`, level: a.meta.dangerLevel })),
      ...ds.firstAid.map((f) => ({ id: f.id, text: f.title, level: f.meta.dangerLevel })),
      ...ds.hazards.map((h) => ({ id: h.id, text: h.title, level: h.meta.dangerLevel })),
    ];
    const violations: string[] = [];
    for (const s of samples) {
      const req = computeRequiredDanger(s.text);
      if (DANGER_ORDER[req.level] > DANGER_ORDER[s.level as 'L0']) {
        violations.push(`${s.id}: 标 ${s.level} 但规则要求 ${req.level}（${s.text.slice(0, 20)}）`);
      }
    }
    if (violations.length > 0) console.error('危险等级不足：', violations.slice(0, 20));
    expect(violations).toHaveLength(0);
  });

  it('场景模拟器都标注为模拟且有决策树', () => {
    expect(ds.scenarios).toHaveLength(12);
    for (const s of ds.scenarios) {
      expect(s.steps.length, `${s.id} 无步骤`).toBeGreaterThan(0);
      const withChoices = s.steps.filter((st) => st.choices.length > 0);
      expect(withChoices.length, `${s.id} 无决策点`).toBeGreaterThan(0);
    }
  });

  it('急救内容均为已发布且带权威来源', () => {
    for (const f of ds.firstAid) {
      expect(f.meta.reviewStatus, `${f.id} 急救未发布`).toBe('published');
      const auth = f.meta.sources.find((s) =>
        ['government', 'medical', 'academic', 'ngo'].includes(s.type));
      expect(auth, `${f.id} 急救缺权威来源`).toBeTruthy();
    }
  });
});
