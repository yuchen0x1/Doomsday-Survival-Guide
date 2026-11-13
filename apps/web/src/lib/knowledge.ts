import type {
  AnimalSpecies,
  AnimalTrack,
  DisasterScenario,
  FirstAidGuide,
  HazardRecord,
  HomeStats,
  InsectSpecies,
  KnowledgeArticle,
  MedicineEntry,
  PlantSpecies,
  QuizQuestion,
  SearchDocument,
  SupplyItem,
  SurvivalSkill,
} from '@apocalypse/core';
import { getCategory, SearchIndex } from '@apocalypse/core';
import {
  animals,
  animalTracks,
  articles,
  firstAidGuides,
  getDataset,
  getHomeCounts,
  getSearchDocuments,
  hazards,
  insects,
  medicines,
  plants,
  quizQuestions,
  scenarios,
  skills,
  supplies,
} from '@apocalypse/knowledge-data';

/**
 * 知识访问层：三端共用的知识查询接口。
 * 数据全部打包在应用内 —— 天然离线可用。
 */

export function dataset() {
  return getDataset();
}

/* ---------- 搜索 ---------- */
let index: SearchIndex | null = null;
export function searchIndex(): SearchIndex {
  if (!index) index = new SearchIndex().build(getSearchDocuments());
  return index;
}
export function search(q: string, limit = 30, opts?: { kind?: string; category?: string }) {
  return searchIndex().search(q, { limit, ...opts });
}
export function searchDocuments(): SearchDocument[] {
  return getSearchDocuments();
}

/* ---------- 单条查询 ---------- */
export const getArticle = (id: string) => articles.find((a) => a.id === id);
export const getPlant = (id: string) => plants.find((p) => p.id === id);
export const getAnimal = (id: string) => animals.find((a) => a.id === id);
export const getAnimalTracks = (animalId: string): AnimalTrack[] =>
  animalTracks.filter((t) => t.animalId === animalId);
export const getInsect = (id: string) => insects.find((i) => i.id === id);
export const getMedicine = (id: string) => medicines.find((m) => m.id === id);
export const getFirstAid = (id: string) => firstAidGuides.find((f) => f.id === id);
export const getSkill = (id: string) => skills.find((s) => s.id === id);
export const getSupply = (id: string) => supplies.find((s) => s.id === id);
export const getScenario = (id: string) => scenarios.find((s) => s.id === id || s.slug === id);
export const getHazard = (id: string) => hazards.find((h) => h.id === id);
export const getQuiz = (id: string) => quizQuestions.find((q) => q.id === id);

/* ---------- 列表 / 分类 ---------- */
export const articlesByCategory = (slug: string) => articles.filter((a) => a.categorySlug === slug);
export const plantsByCategory = (slug: string) => plants.filter((p) => p.category === slug);
export const animalsByClass = (slug: string) => animals.filter((a) => a.animalClass === slug);
export const skillsByCategory = (slug: string) => skills.filter((s) => s.categorySlug === slug);
export const suppliesByCategory = (slug: string) => supplies.filter((s) => s.category === slug);
export const firstAidByCategory = (slug: string) =>
  firstAidGuides.filter((f) => f.categorySlug === slug);

export function articlesByTag(tag: string) {
  return articles.filter((a) => a.tags.includes(tag));
}

/** 按 id 批量取“相关知识”（跨类型） */
export function resolveRefs(ids: string[]): { id: string; title: string; href: string }[] {
  return ids
    .map((id) => {
      const a = getArticle(id);
      if (a) return { id, title: a.title, href: `/article/${id}` };
      const p = getPlant(id);
      if (p) return { id, title: p.name, href: `/plants/${id}` };
      const an = getAnimal(id);
      if (an) return { id, title: an.name, href: `/animals/${id}` };
      const ins = getInsect(id);
      if (ins) return { id, title: ins.name, href: `/insects/${id}` };
      const m = getMedicine(id);
      if (m) return { id, title: m.name, href: `/medicines/${id}` };
      const f = getFirstAid(id);
      if (f) return { id, title: f.title, href: `/first-aid/${id}` };
      const s = getSkill(id);
      if (s) return { id, title: s.title, href: `/skills/${id}` };
      const su = getSupply(id);
      if (su) return { id, title: su.name, href: `/supplies/${id}` };
      const sc = getScenario(id);
      if (sc) return { id, title: sc.title, href: `/simulator/${sc.id}` };
      const h = getHazard(id);
      if (h) return { id, title: h.title, href: `/hazard/${id}` };
      return null;
    })
    .filter((x): x is { id: string; title: string; href: string } => x !== null);
}

/** 根据 refId（"plant:xxx" 或纯 id）解析详情链接与标题 */
export function resolveRef(refId: string): { title: string; href: string } | null {
  const [kind, id] = refId.includes(':') ? refId.split(':') : ['', refId];
  switch (kind) {
    case 'article': {
      const x = getArticle(id);
      return x ? { title: x.title, href: `/article/${id}` } : null;
    }
    case 'plant': {
      const x = getPlant(id);
      return x ? { title: x.name, href: `/plants/${id}` } : null;
    }
    case 'animal': {
      const x = getAnimal(id);
      return x ? { title: x.name, href: `/animals/${id}` } : null;
    }
    case 'insect': {
      const x = getInsect(id);
      return x ? { title: x.name, href: `/insects/${id}` } : null;
    }
    case 'medicine': {
      const x = getMedicine(id);
      return x ? { title: x.name, href: `/medicines/${id}` } : null;
    }
    case 'first_aid': {
      const x = getFirstAid(id);
      return x ? { title: x.title, href: `/first-aid/${id}` } : null;
    }
    case 'skill': {
      const x = getSkill(id);
      return x ? { title: x.title, href: `/skills/${id}` } : null;
    }
    case 'supply': {
      const x = getSupply(id);
      return x ? { title: x.name, href: `/supplies/${id}` } : null;
    }
    case 'scenario': {
      const x = getScenario(id);
      return x ? { title: x.title, href: `/simulator/${x.id}` } : null;
    }
    case 'hazard': {
      const x = getHazard(id);
      return x ? { title: x.title, href: `/hazard/${id}` } : null;
    }
    default:
      return resolveRefs([refId])[0] ?? null;
  }
}

/* ---------- 首页统计（来自真实数据） ---------- */
export function homeStats(): HomeStats {
  const c = getHomeCounts();
  return {
    articles: c.articles,
    plants: c.plants,
    animals: c.animals,
    skills: c.skills,
    offlineDownloaded: 0, // 由离线模块填充
    bookmarks: 0, // 由 store 填充
  };
}

/* ---------- 每日知识 ---------- */
export function dailyPick(date = new Date()): KnowledgeArticle {
  const day = Math.floor(date.setHours(0, 0, 0, 0) / 86400000);
  const published = articles.filter((a) => a.meta.reviewStatus === 'published');
  const pool = published.length > 0 ? published : articles;
  return pool[day % pool.length];
}

/* ---------- 类型重导出（页面直接用） ---------- */
export type {
  AnimalSpecies,
  DisasterScenario,
  FirstAidGuide,
  HazardRecord,
  InsectSpecies,
  KnowledgeArticle,
  MedicineEntry,
  PlantSpecies,
  QuizQuestion,
  SupplyItem,
  SurvivalSkill,
};
export {
  animals,
  animalTracks,
  articles,
  firstAidGuides,
  getCategory,
  getHomeCounts,
  hazards,
  insects,
  medicines,
  plants,
  quizQuestions,
  scenarios,
  skills,
  supplies,
};

/* ---------- 统计（管理后台 / 数据概览） ---------- */
export function datasetSummary() {
  const c = getHomeCounts();
  const byReview = { draft: 0, pending_review: 0, reviewed: 0, published: 0, retired: 0 };
  const byDanger = { L0: 0, L1: 0, L2: 0, L3: 0, L4: 0 };
  const allMeta = [
    ...articles.map((x) => x.meta),
    ...plants.map((x) => x.meta),
    ...animals.map((x) => x.meta),
    ...firstAidGuides.map((x) => x.meta),
    ...skills.map((x) => x.meta),
    ...medicines.map((x) => x.meta),
    ...hazards.map((x) => x.meta),
    ...scenarios.map((x) => x.meta),
  ];
  for (const m of allMeta) {
    byReview[m.reviewStatus] = (byReview[m.reviewStatus] ?? 0) + 1;
    byDanger[m.dangerLevel] = (byDanger[m.dangerLevel] ?? 0) + 1;
  }
  return { counts: c, byReview, byDanger, total: allMeta.length };
}
