import type {
  AnimalSpecies,
  AnimalTrack,
  DisasterScenario,
  FirstAidGuide,
  HazardRecord,
  InsectSpecies,
  KnowledgeArticle,
  MedicineEntry,
  PlantSpecies,
  QuizQuestion,
  SearchDocument,
  SupplyItem,
  SurvivalSkill,
} from '@apocalypse/core';
import { buildSearchDocuments } from '@apocalypse/core';
import { animals, animalTracks } from './animals';
import { articles } from './articles';
import { firstAidGuides } from './firstAid';
import { hazards } from './hazards';
import { insects } from './insects';
import { medicines } from './medicines';
import { normalizeDatasetDanger } from './normalize';
import { plants } from './plants';
import { quizQuestions } from './quizzes';
import { scenarios } from './scenarios';
import { skills } from './skills';
import { pick, SOURCES } from './sources';
import { supplies } from './supplies';

export * from './helpers';
export * from './sources';

export interface KnowledgeDataset {
  articles: KnowledgeArticle[];
  plants: PlantSpecies[];
  animals: AnimalSpecies[];
  animalTracks: AnimalTrack[];
  insects: InsectSpecies[];
  medicines: MedicineEntry[];
  firstAid: FirstAidGuide[];
  skills: SurvivalSkill[];
  supplies: SupplyItem[];
  scenarios: DisasterScenario[];
  hazards: HazardRecord[];
  quizQuestions: QuizQuestion[];
}

let cached: KnowledgeDataset | null = null;
let cachedDocs: SearchDocument[] | null = null;

/** 获取全量知识数据集（单例，避免重复展开大数组） */
export function getDataset(): KnowledgeDataset {
  if (!cached) {
    cached = {
      articles,
      plants,
      animals,
      animalTracks,
      insects,
      medicines,
      firstAid: firstAidGuides,
      skills,
      supplies,
      scenarios,
      hazards,
      quizQuestions,
    };
    // 危险等级由审核规则强制确定（规则优先于人工/AI 标注，只升不降）
    normalizeDatasetDanger(cached);
  }
  return cached;
}

/** 构建全局搜索文档（供 SearchIndex 使用） */
export function getSearchDocuments(): SearchDocument[] {
  if (!cachedDocs) {
    const d = getDataset();
    cachedDocs = buildSearchDocuments({
      articles: d.articles.map((a) => ({ ...a, dangerLevel: a.meta.dangerLevel })),
      plants: d.plants.map((p) => ({ ...p, dangerLevel: p.meta.dangerLevel })),
      animals: d.animals.map((a) => ({ ...a, dangerLevel: a.meta.dangerLevel })),
      insects: d.insects.map((i) => ({ ...i, dangerLevel: i.meta.dangerLevel })),
      medicines: d.medicines.map((m) => ({ ...m, dangerLevel: m.meta.dangerLevel })),
      firstAid: d.firstAid.map((f) => ({ ...f, dangerLevel: f.meta.dangerLevel })),
      skills: d.skills.map((s) => ({ ...s, dangerLevel: s.dangerLevel })),
      supplies: d.supplies.map((s) => ({ ...s, dangerLevel: s.meta.dangerLevel })),
      scenarios: d.scenarios.map((s) => ({ ...s, dangerLevel: s.meta.dangerLevel })),
      hazards: d.hazards.map((h) => ({ ...h, dangerLevel: h.meta.dangerLevel })),
    });
  }
  return cachedDocs;
}

/** 首页统计（必须来自实际数据，禁止写死） */
export function getHomeCounts() {
  const d = getDataset();
  return {
    articles: d.articles.length,
    plants: d.plants.length,
    animals: d.animals.length + d.insects.length,
    skills: d.skills.length,
    firstAid: d.firstAid.length,
    supplies: d.supplies.length,
    scenarios: d.scenarios.length,
    hazards: d.hazards.length,
    medicines: d.medicines.length,
    quizQuestions: d.quizQuestions.length,
  };
}

export {
  animals,
  animalTracks,
  articles,
  firstAidGuides,
  hazards,
  insects,
  medicines,
  pick,
  plants,
  quizQuestions,
  SOURCES,
  scenarios,
  skills,
  supplies,
};
