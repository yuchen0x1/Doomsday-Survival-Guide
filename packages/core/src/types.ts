/**
 * APOCALYPSE SURVIVAL 共享类型契约
 * Web / Windows(Tauri) / 移动(Capacitor) / API 四端统一使用。
 */

/* ============ 全局枚举 ============ */

/** 危险等级：由内容审核规则确定，AI 不得自行生成 */
export type DangerLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';

/** 知识可信度等级 */
export type Credibility = 'A' | 'B' | 'C' | 'D';

/** 内容审核状态机 */
export type ReviewStatus = 'draft' | 'pending_review' | 'reviewed' | 'published' | 'retired';

/** 内容来源类型 */
export type SourceType =
  | 'government'
  | 'medical'
  | 'academic'
  | 'ngo'
  | 'manual'
  | 'community'
  | 'ai_generated';

export interface SourceReference {
  id: string;
  name: string;
  url?: string;
  publisher?: string;
  publishedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  type: SourceType;
  credibility: Credibility;
}

export interface ContentMeta {
  id: string;
  reviewStatus: ReviewStatus;
  reviewNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  version: number;
  dangerLevel: DangerLevel;
  sources: SourceReference[];
  createdAt: string;
  updatedAt: string;
  /** AI 生成标记：AI 生成内容默认 pending_review，不得直接发布 */
  aiGenerated?: boolean;
}

/* ============ 知识分类 ============ */

export interface KnowledgeCategory {
  slug: string;
  name: string;
  description: string;
  icon: string;
  parent: string | null;
  order: number;
}

/* ============ 知识文章 ============ */

export interface ArticleSection {
  heading: string;
  body: string;
}

export interface KnowledgeArticle {
  id: string;
  categorySlug: string;
  title: string;
  aliases: string[];
  summary: string;
  coverImage?: string;
  environment?: string[];
  scenarios?: string[];
  sections: ArticleSection[];
  steps?: string[];
  tools?: string[];
  precautions?: string[];
  contraindications?: string[];
  tags: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  relatedIds: string[];
  offlineReady: boolean;
  meta: ContentMeta;
}

/* ============ 植物图鉴 ============ */

export type PlantCategory =
  | 'edible'
  | 'medicinal'
  | 'toxic'
  | 'irritant'
  | 'fiber'
  | 'material'
  | 'utility';

export interface PlantSpecies {
  id: string;
  category: PlantCategory;
  name: string;
  scientificName: string;
  aliases: string[];
  family: string;
  image?: string;
  leaf: string;
  flower: string;
  fruit: string;
  stem: string;
  root: string;
  season: string;
  distribution: string;
  habitat: string;
  usableParts: string[];
  uses: string[];
  /** 毒性说明：未知必须写“未知”，不得臆测 */
  toxicity: string;
  lookalikes: { name: string; note: string }[];
  confusionRisk: string;
  /** 误食风险描述 + 等级 */
  edibilityWarning: string;
  confidence: Credibility;
  tags: string[];
  meta: ContentMeta;
}

/* ============ 动物图鉴 ============ */

export type AnimalClass =
  | 'mammal'
  | 'bird'
  | 'reptile'
  | 'amphibian'
  | 'fish'
  | 'insect'
  | 'arthropod'
  | 'dangerous';

export interface AnimalTrack {
  id: string;
  animalId: string;
  description: string;
  size: string;
  gait?: string;
  image?: string;
}

export interface AnimalSpecies {
  id: string;
  animalClass: AnimalClass;
  name: string;
  scientificName: string;
  aliases: string[];
  image?: string;
  appearance: string;
  habitat: string;
  activityTime: string;
  behavior: string;
  diet: string;
  tracks: string[];
  feces: string;
  dangerLevel: DangerLevel;
  possibleInjury: string;
  safetyMeasures: string;
  biteFirstAid: string;
  distribution: string;
  /** 模型推测与核实资料必须区分 */
  identificationConfidence: Credibility;
  identificationNote?: string;
  tags: string[];
  meta: ContentMeta;
}

/* ============ 昆虫 / 药物 ============ */

export interface InsectSpecies {
  id: string;
  name: string;
  scientificName: string;
  aliases: string[];
  image?: string;
  appearance: string;
  habitat: string;
  season: string;
  behavior: string;
  dangerLevel: DangerLevel;
  stingBiteRisk: string;
  firstAid: string;
  uses?: string[];
  distribution: string;
  confidence: Credibility;
  tags: string[];
  meta: ContentMeta;
}

export interface MedicineEntry {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  image?: string;
  /** 通用用途说明 —— 不提供个体化处方 */
  purpose: string;
  commonForms: string[];
  keyPoints: string[];
  risks: string[];
  contraindications: string[];
  storage: string;
  /** 明确声明：非医嘱，用药前咨询专业人员 */
  disclaimer: string;
  dangerLevel: DangerLevel;
  sources: SourceReference[];
  tags: string[];
  meta: ContentMeta;
}

/* ============ 急救 ============ */

export interface FirstAidGuide {
  id: string;
  categorySlug: string;
  title: string;
  summary: string;
  image?: string;
  applicable: string[];
  dangerSignals: string[];
  immediateSafety: string[];
  wrongActions: string[];
  steps: string[];
  whenToSeekHelp: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  relatedIds: string[];
  offlineReady: boolean;
  meta: ContentMeta;
}

/* ============ 生存技能 ============ */

export interface SkillStep {
  index: number;
  instruction: string;
  image?: string;
  warning?: string;
}

export interface SurvivalSkill {
  id: string;
  categorySlug: string;
  title: string;
  summary: string;
  coverImage?: string;
  purpose: string;
  scenarios: string[];
  materials: string[];
  tools: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedMinutes: number;
  steps: SkillStep[];
  cautions: string[];
  failureReasons: string[];
  safetyChecklist: string[];
  alternatives: string[];
  tags: string[];
  relatedIds: string[];
  /** verified=经过验证的实操教程；pending=AI生成待审核 */
  verification: 'verified' | 'pending_review';
  dangerLevel: DangerLevel;
  offlineReady: boolean;
  meta: ContentMeta;
}

/* ============ 物资 ============ */

export type SupplyCategory =
  | 'food'
  | 'water'
  | 'medical'
  | 'camping'
  | 'lighting'
  | 'communication'
  | 'tools'
  | 'protection'
  | 'energy'
  | 'hygiene'
  | 'repair'
  | 'agriculture';

export interface SupplyItem {
  id: string;
  category: SupplyCategory;
  name: string;
  image?: string;
  purpose: string;
  usage: string;
  storageMethod: string;
  shelfLife: string;
  scenarios: string[];
  risks: string[];
  substitutes: string[];
  relatedTutorialIds: string[];
  unit: string;
  defaultPriority: 1 | 2 | 3;
  tags: string[];
  meta: ContentMeta;
}

/** 用户物资清单条目（本地存储） */
export interface InventoryEntry {
  id: string;
  supplyId: string;
  name: string;
  category: SupplyCategory;
  quantity: number;
  unit: string;
  minQuantity: number;
  priority: 1 | 2 | 3;
  expiresAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  entryId: string;
  delta: number;
  reason: string;
  at: string;
}

/* ============ 灾害场景 ============ */

export interface ScenarioChoice {
  id: string;
  label: string;
  consequence: string;
  nextStepId?: string;
  riskLevel: DangerLevel;
  /** 正确/推荐程度：用于学习评分，不显示给用户 */
  quality: 'good' | 'acceptable' | 'bad';
}

export interface ScenarioStep {
  id: string;
  scene: string;
  environment: string[];
  knownHazards: string[];
  availableResources: string[];
  partyStatus: string;
  timeLimit?: string;
  objective: string;
  recommended: string[];
  discouraged: string[];
  choices: ScenarioChoice[];
}

export interface DisasterScenario {
  id: string;
  slug: string;
  title: string;
  summary: string;
  image?: string;
  tags: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  steps: ScenarioStep[];
  /** 必须标注为模拟 */
  isSimulation: true;
  debrief: string[];
  relatedArticleIds: string[];
  meta: ContentMeta;
}

/* ============ 危险记录 ============ */

export interface HazardRecord {
  id: string;
  title: string;
  category: string;
  dangerLevel: DangerLevel;
  description: string;
  indicators: string[];
  prevention: string[];
  emergencyResponse: string[];
  region?: string;
  meta: ContentMeta;
}

/* ============ 计算器 ============ */

export interface CalculatorParam {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  help: string;
}

export interface CalculatorResult {
  key: string;
  label: string;
  value: number;
  unit: string;
  note?: string;
}

export interface CalculatorDef {
  id: string;
  slug: string;
  name: string;
  description: string;
  params: CalculatorParam[];
  /** 公式人类可读说明（计算依据） */
  formula: string;
  basis: string;
  compute: (input: Record<string, number>) => CalculatorResult[];
}

/* ============ 学习系统 ============ */

export type QuizType = 'plant' | 'animal' | 'first_aid' | 'skill';

export interface QuizQuestion {
  id: string;
  type: QuizType;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  /** 题目必须可追溯到知识来源 */
  sourceRefId: string;
  sourceTitle: string;
  difficulty: 1 | 2 | 3;
}

export interface QuizRecord {
  id: string;
  questionId: string;
  chosenIndex: number;
  correct: boolean;
  at: string;
}

export interface LearningProgress {
  answered: number;
  correct: number;
  wrongBook: string[];
  streakDays: number;
  lastStudyDate?: string;
}

/* ============ 收藏 / 历史 / 笔记 ============ */

export type BookmarkKind =
  | 'article'
  | 'plant'
  | 'animal'
  | 'insect'
  | 'medicine'
  | 'first_aid'
  | 'skill'
  | 'supply'
  | 'scenario'
  | 'hazard';

export interface Bookmark {
  id: string;
  kind: BookmarkKind;
  refId: string;
  title: string;
  tags: string[];
  note?: string;
  collection?: string;
  createdAt: string;
}

export interface ReadingHistoryItem {
  refId: string;
  kind: BookmarkKind;
  title: string;
  at: string;
}

export interface UserNote {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/* ============ 个人生存档案 ============ */

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface SurvivalProfile {
  id: string;
  displayName: string;
  householdSize: number;
  skills: string[];
  contacts: EmergencyContact[];
  shelterPlan: string;
  notes: string;
  updatedAt: string;
}

/* ============ 离线包 ============ */

export interface OfflinePackage {
  id: string;
  name: string;
  description: string;
  /** 包含的知识分类 slug */
  categorySlugs: string[];
  sizeBytes: number;
  version: string;
  downloadedAt?: string;
  status: 'not_downloaded' | 'downloading' | 'downloaded' | 'update_available';
  progress?: number;
}

/* ============ AI ============ */

export type AIToolName =
  | 'search_knowledge'
  | 'search_plants'
  | 'search_animals'
  | 'search_first_aid'
  | 'search_items'
  | 'search_skills'
  | 'calculate_supplies'
  | 'get_offline_status';

export interface AIToolCall {
  name: AIToolName;
  arguments: Record<string, unknown>;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: AIToolCall[];
  toolResults?: { name: string; result: unknown }[];
  createdAt: string;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

/** AI 回答结构化骨架 */
export interface AIAnswerStructure {
  analysis: string;
  risks: string[];
  priority: string;
  recommended: string[];
  discouraged: string[];
  relatedKnowledge: { id: string; title: string }[];
  sources: string[];
  uncertainty: string;
}

/* ============ 地图 ============ */

export type MapMarkerKind = 'water' | 'shelter' | 'danger' | 'route' | 'supply' | 'custom';

export interface MapMarker {
  id: string;
  kind: MapMarkerKind;
  name: string;
  lat: number;
  lng: number;
  note?: string;
  /** 未经核实的地点不得标记为安全避难点 */
  verified: boolean;
  private: boolean;
  createdAt: string;
}

export interface MapRoute {
  id: string;
  name: string;
  points: { lat: number; lng: number }[];
  distanceMeters?: number;
  createdAt: string;
}

/* ============ 搜索 ============ */

export type SearchDocKind =
  | 'article'
  | 'plant'
  | 'animal'
  | 'insect'
  | 'medicine'
  | 'first_aid'
  | 'skill'
  | 'supply'
  | 'scenario'
  | 'hazard';

export interface SearchDocument {
  id: string;
  kind: SearchDocKind;
  title: string;
  subtitle: string;
  category: string;
  tags: string[];
  dangerLevel: DangerLevel;
  /** 用于匹配的正文（脱敏摘要） */
  body: string;
}

export interface SearchResult {
  document: SearchDocument;
  score: number;
}

/* ============ 首页统计（必须来自真实数据） ============ */

export interface HomeStats {
  articles: number;
  plants: number;
  animals: number;
  skills: number;
  offlineDownloaded: number;
  bookmarks: number;
}

/* ============ 内容审核规则 ============ */

export interface ReviewRule {
  /** 匹配的分类 / 字段 */
  match: string[];
  /** 命中时强制的最低危险等级 */
  minDangerLevel: DangerLevel;
  reason: string;
}

/* ============ 平台 ============ */

export type Platform = 'web' | 'desktop' | 'mobile';

export interface PlatformInfo {
  platform: Platform;
  online: boolean;
  hasCamera: boolean;
  hasLocalDb: boolean;
}
