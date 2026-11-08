/**
 * 运行时直连 monorepo 源码的共享规则。
 *
 * 为什么用相对路径而不是裸标识符 `@apocalypse/core`：
 * 该包的 package.json exports 指向 .ts 源码（供 Vite/Web 使用），
 * 编译产物 dist 里的 require() 无法加载 .ts。改为相对路径后，
 * tsc 会把这些源文件一并编译进 dist，相对路径在运行时同样成立。
 * 类型导入仍可使用裸标识符（配合 tsconfig paths）。
 */
export {
  DANGER_ORDER,
  DANGER_LABELS,
  REVIEW_RULES,
  computeRequiredDanger,
  isDangerAtLeast,
  maxDanger,
} from '../../../../packages/core/src/danger';

export {
  validateContentMeta,
  validateArticle,
  validatePlant,
  validateAnimal,
  validateFirstAid,
  validateSkill,
  validateMedicine,
  credibilityRank,
} from '../../../../packages/core/src/validate';

export type {
  ValidationIssue,
  DatasetBundle,
} from '../../../../packages/core/src/validate';

export type {
  ContentMeta,
  DangerLevel,
  Credibility,
  ReviewStatus,
  SourceType,
  SourceReference,
  KnowledgeArticle,
  PlantSpecies,
  AnimalSpecies,
  AnimalTrack,
  InsectSpecies,
  MedicineEntry,
  FirstAidGuide,
  SurvivalSkill,
  SupplyItem,
  DisasterScenario,
  ScenarioStep,
  ScenarioChoice,
  HazardRecord,
  QuizQuestion,
  Bookmark,
  HomeStats,
} from '../../../../packages/core/src/types';
