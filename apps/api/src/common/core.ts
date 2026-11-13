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
  computeRequiredDanger,
  DANGER_LABELS,
  DANGER_ORDER,
  isDangerAtLeast,
  maxDanger,
  REVIEW_RULES,
} from '../../../../packages/core/src/danger';
export type {
  AnimalSpecies,
  AnimalTrack,
  Bookmark,
  ContentMeta,
  Credibility,
  DangerLevel,
  DisasterScenario,
  FirstAidGuide,
  HazardRecord,
  HomeStats,
  InsectSpecies,
  KnowledgeArticle,
  MedicineEntry,
  PlantSpecies,
  QuizQuestion,
  ReviewStatus,
  ScenarioChoice,
  ScenarioStep,
  SourceReference,
  SourceType,
  SupplyItem,
  SurvivalSkill,
} from '../../../../packages/core/src/types';

export type {
  DatasetBundle,
  ValidationIssue,
} from '../../../../packages/core/src/validate';
export {
  credibilityRank,
  validateAnimal,
  validateArticle,
  validateContentMeta,
  validateFirstAid,
  validateMedicine,
  validatePlant,
  validateSkill,
} from '../../../../packages/core/src/validate';
