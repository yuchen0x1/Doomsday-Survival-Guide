import type {
  Credibility as PrismaCredibility,
  DangerLevel as PrismaDangerLevel,
  ReviewStatus as PrismaReviewStatus,
  SourceType as PrismaSourceType,
} from '@prisma/client';

/**
 * 内容 kind 注册表：路由参数 → Prisma model → 领域序列化。
 * 序列化结果字段与 packages/core/src/types.ts 一一对齐。
 */

export type ContentKind =
  | 'articles'
  | 'plants'
  | 'animals'
  | 'insects'
  | 'medicines'
  | 'first-aid'
  | 'skills'
  | 'supplies'
  | 'scenarios'
  | 'hazards'
  | 'quizzes';

export const CONTENT_KINDS: ContentKind[] = [
  'articles',
  'plants',
  'animals',
  'insects',
  'medicines',
  'first-aid',
  'skills',
  'supplies',
  'scenarios',
  'hazards',
  'quizzes',
];

export function isContentKind(value: string): value is ContentKind {
  return (CONTENT_KINDS as string[]).includes(value);
}

/* ---------------- 来源与 meta ---------------- */

export interface SourceRow {
  id: string;
  name: string;
  url: string | null;
  publisher: string | null;
  publishedAt: Date | null;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  type: PrismaSourceType;
  credibility: PrismaCredibility;
}

export interface SourceRef {
  id: string;
  name: string;
  url?: string;
  publisher?: string;
  publishedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  type: string;
  credibility: string;
}

export function toSourceRef(s: SourceRow): SourceRef {
  return {
    id: s.id,
    name: s.name,
    url: s.url ?? undefined,
    publisher: s.publisher ?? undefined,
    publishedAt: s.publishedAt ? s.publishedAt.toISOString() : undefined,
    verifiedAt: s.verifiedAt ? s.verifiedAt.toISOString() : undefined,
    verifiedBy: s.verifiedBy ?? undefined,
    type: s.type,
    credibility: s.credibility,
  };
}

export interface MetaColumns {
  id: string;
  reviewStatus: PrismaReviewStatus;
  reviewNote: string | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  aiGenerated: boolean;
  version: number;
  dangerLevel: PrismaDangerLevel;
  sourceIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** 由行 + 来源构建 ContentMeta（与 core.ContentMeta 结构一致） */
export function buildMeta(row: MetaColumns, sources: SourceRow[]): Record<string, unknown> {
  return {
    id: row.id,
    reviewStatus: row.reviewStatus,
    reviewNote: row.reviewNote ?? undefined,
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : undefined,
    reviewedBy: row.reviewedBy ?? undefined,
    version: row.version,
    dangerLevel: row.dangerLevel,
    sources: sources.map(toSourceRef),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    aiGenerated: row.aiGenerated,
  };
}

/* ---------------- kind 定义 ---------------- */

export interface KindDef {
  kind: ContentKind;
  /** PrismaService 上的 delegate 属性名 */
  delegate: string;
  /** 分类字段名（用于 category 过滤与展示） */
  categoryField: 'categorySlug' | 'category' | null;
  titleField: string;
  /** 用于 D 级可见性排除的字段 */
  dExcludeField?: 'confidence' | 'identificationConfidence';
  /** 生成校验用的正文文本 */
  extraText: (row: Record<string, unknown>) => string;
  /** 详情附加关系（动物足迹 / 场景步骤） */
  detail?: (prisma: unknown, row: Record<string, unknown>) => Promise<Record<string, unknown>>;
  /** 序列化（含 meta） */
  serialize: (row: Record<string, unknown>, sources: SourceRow[]) => Record<string, unknown>;
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' ? v : fallback);

function serializeAnimalTracks(rows: unknown): Record<string, unknown>[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: str(row.id),
      animalId: str(row.animalId),
      description: str(row.description),
      size: str(row.size),
      gait: row.gait == null ? undefined : str(row.gait),
      image: row.image == null ? undefined : str(row.image),
    };
  });
}

function serializeScenarioSteps(rows: unknown): Record<string, unknown>[] {
  if (!Array.isArray(rows)) return [];
  return [...rows]
    .sort(
      (a, b) =>
        num((a as Record<string, unknown>).order) - num((b as Record<string, unknown>).order),
    )
    .map((r) => {
      const row = r as Record<string, unknown>;
      const choices = Array.isArray(row.choices)
        ? [...(row.choices as Record<string, unknown>[])].map((c) => ({
            id: str(c.id),
            label: str(c.label),
            consequence: str(c.consequence),
            nextStepId: c.nextStepId == null ? undefined : str(c.nextStepId),
            riskLevel: str(c.riskLevel),
            quality: str(c.quality) || 'acceptable',
          }))
        : [];
      return {
        id: str(row.id),
        scene: str(row.scene),
        environment: strList(row.environment),
        knownHazards: strList(row.knownHazards),
        availableResources: strList(row.availableResources),
        partyStatus: str(row.partyStatus),
        timeLimit: row.timeLimit == null ? undefined : str(row.timeLimit),
        objective: str(row.objective),
        recommended: strList(row.recommended),
        discouraged: strList(row.discouraged),
        choices,
      };
    });
}

export const KIND_DEFS: Record<ContentKind, KindDef> = {
  articles: {
    kind: 'articles',
    delegate: 'article',
    categoryField: 'categorySlug',
    titleField: 'title',
    extraText: (row) =>
      `${str(row.summary)} ${strList(row.steps).join(' ')} ${strList(row.precautions).join(' ')}`,
    serialize: (row, sources) => ({
      id: str(row.id),
      categorySlug: str(row.categorySlug),
      title: str(row.title),
      aliases: strList(row.aliases),
      summary: str(row.summary),
      coverImage: row.coverImage == null ? undefined : str(row.coverImage),
      environment: strList(row.environment),
      scenarios: strList(row.scenarios),
      sections: Array.isArray(row.sections) ? row.sections : [],
      steps: strList(row.steps),
      tools: strList(row.tools),
      precautions: strList(row.precautions),
      contraindications: strList(row.contraindications),
      tags: strList(row.tags),
      difficulty: num(row.difficulty, 1),
      relatedIds: strList(row.relatedIds),
      offlineReady: Boolean(row.offlineReady),
      meta: buildMeta(row as unknown as MetaColumns, sources),
    }),
  },
  plants: {
    kind: 'plants',
    delegate: 'plant',
    categoryField: 'category',
    titleField: 'name',
    dExcludeField: 'confidence',
    extraText: (row) =>
      `${str(row.toxicity)} ${strList(row.uses).join(' ')} ${str(row.edibilityWarning)}`,
    serialize: (row, sources) => ({
      id: str(row.id),
      category: str(row.category),
      name: str(row.name),
      scientificName: str(row.scientificName),
      aliases: strList(row.aliases),
      family: str(row.family),
      image: row.image == null ? undefined : str(row.image),
      leaf: str(row.leaf),
      flower: str(row.flower),
      fruit: str(row.fruit),
      stem: str(row.stem),
      root: str(row.root),
      season: str(row.season),
      distribution: str(row.distribution),
      habitat: str(row.habitat),
      usableParts: strList(row.usableParts),
      uses: strList(row.uses),
      toxicity: str(row.toxicity),
      lookalikes: Array.isArray(row.lookalikes) ? row.lookalikes : [],
      confusionRisk: str(row.confusionRisk),
      edibilityWarning: str(row.edibilityWarning),
      confidence: str(row.confidence) || 'C',
      tags: strList(row.tags),
      meta: buildMeta(row as unknown as MetaColumns, sources),
    }),
  },
  animals: {
    kind: 'animals',
    delegate: 'animal',
    categoryField: null,
    titleField: 'name',
    dExcludeField: 'identificationConfidence',
    extraText: (row) =>
      `${str(row.appearance)} ${str(row.possibleInjury)} ${str(row.biteFirstAid)} ${str(row.safetyMeasures)}`,
    detail: async (prisma, row) => {
      const p = prisma as {
        animalTrack: { findMany: (args: unknown) => Promise<unknown> };
      };
      const tracks = await p.animalTrack.findMany({ where: { animalId: str(row.id) } });
      return { trackRows: serializeAnimalTracks(tracks) };
    },
    serialize: (row, sources) => ({
      id: str(row.id),
      animalClass: str(row.animalClass),
      name: str(row.name),
      scientificName: str(row.scientificName),
      aliases: strList(row.aliases),
      image: row.image == null ? undefined : str(row.image),
      appearance: str(row.appearance),
      habitat: str(row.habitat),
      activityTime: str(row.activityTime),
      behavior: str(row.behavior),
      diet: str(row.diet),
      tracks: strList(row.tracks),
      feces: str(row.feces),
      dangerLevel: str(row.dangerLevel),
      possibleInjury: str(row.possibleInjury),
      safetyMeasures: str(row.safetyMeasures),
      biteFirstAid: str(row.biteFirstAid),
      distribution: str(row.distribution),
      identificationConfidence: str(row.identificationConfidence) || 'C',
      identificationNote: row.identificationNote == null ? undefined : str(row.identificationNote),
      tags: strList(row.tags),
      trackRows: row.trackRows ?? [],
      meta: buildMeta(row as unknown as MetaColumns, sources),
    }),
  },
  insects: {
    kind: 'insects',
    delegate: 'insect',
    categoryField: null,
    titleField: 'name',
    extraText: (row) => `${str(row.appearance)} ${str(row.stingBiteRisk)} ${str(row.firstAid)}`,
    serialize: (row, sources) => ({
      id: str(row.id),
      name: str(row.name),
      scientificName: str(row.scientificName),
      aliases: strList(row.aliases),
      image: row.image == null ? undefined : str(row.image),
      appearance: str(row.appearance),
      habitat: str(row.habitat),
      season: str(row.season),
      behavior: str(row.behavior),
      dangerLevel: str(row.dangerLevel),
      stingBiteRisk: str(row.stingBiteRisk),
      firstAid: str(row.firstAid),
      uses: strList(row.uses),
      distribution: str(row.distribution),
      confidence: str(row.confidence) || 'C',
      tags: strList(row.tags),
      meta: buildMeta(row as unknown as MetaColumns, sources),
    }),
  },
  medicines: {
    kind: 'medicines',
    delegate: 'medicine',
    categoryField: 'category',
    titleField: 'name',
    extraText: (row) =>
      `${str(row.purpose)} ${strList(row.keyPoints).join(' ')} ${strList(row.risks).join(' ')}`,
    serialize: (row, sources) => ({
      id: str(row.id),
      name: str(row.name),
      aliases: strList(row.aliases),
      category: str(row.category),
      image: row.image == null ? undefined : str(row.image),
      purpose: str(row.purpose),
      commonForms: strList(row.commonForms),
      keyPoints: strList(row.keyPoints),
      risks: strList(row.risks),
      contraindications: strList(row.contraindications),
      storage: str(row.storage),
      disclaimer: str(row.disclaimer),
      dangerLevel: str(row.dangerLevel),
      sources: sources.map(toSourceRef),
      tags: strList(row.tags),
      meta: buildMeta(row as unknown as MetaColumns, sources),
    }),
  },
  'first-aid': {
    kind: 'first-aid',
    delegate: 'firstAidGuide',
    categoryField: 'categorySlug',
    titleField: 'title',
    extraText: (row) =>
      `${str(row.summary)} ${strList(row.dangerSignals).join(' ')} ${strList(row.steps).join(' ')}`,
    serialize: (row, sources) => ({
      id: str(row.id),
      categorySlug: str(row.categorySlug),
      title: str(row.title),
      summary: str(row.summary),
      image: row.image == null ? undefined : str(row.image),
      applicable: strList(row.applicable),
      dangerSignals: strList(row.dangerSignals),
      immediateSafety: strList(row.immediateSafety),
      wrongActions: strList(row.wrongActions),
      steps: strList(row.steps),
      whenToSeekHelp: strList(row.whenToSeekHelp),
      difficulty: num(row.difficulty, 1),
      tags: strList(row.tags),
      relatedIds: strList(row.relatedIds),
      offlineReady: Boolean(row.offlineReady),
      meta: buildMeta(row as unknown as MetaColumns, sources),
    }),
  },
  skills: {
    kind: 'skills',
    delegate: 'skill',
    categoryField: 'categorySlug',
    titleField: 'title',
    extraText: (row) => `${str(row.summary)} ${strList(row.cautions).join(' ')}`,
    serialize: (row, sources) => ({
      id: str(row.id),
      categorySlug: str(row.categorySlug),
      title: str(row.title),
      summary: str(row.summary),
      coverImage: row.coverImage == null ? undefined : str(row.coverImage),
      purpose: str(row.purpose),
      scenarios: strList(row.scenarios),
      materials: strList(row.materials),
      tools: strList(row.tools),
      difficulty: num(row.difficulty, 1),
      estimatedMinutes: num(row.estimatedMinutes),
      steps: Array.isArray(row.steps) ? row.steps : [],
      cautions: strList(row.cautions),
      failureReasons: strList(row.failureReasons),
      safetyChecklist: strList(row.safetyChecklist),
      alternatives: strList(row.alternatives),
      tags: strList(row.tags),
      relatedIds: strList(row.relatedIds),
      verification: str(row.verification) === 'verified' ? 'verified' : 'pending_review',
      dangerLevel: str(row.dangerLevel),
      offlineReady: Boolean(row.offlineReady),
      meta: buildMeta(row as unknown as MetaColumns, sources),
    }),
  },
  supplies: {
    kind: 'supplies',
    delegate: 'supply',
    categoryField: 'category',
    titleField: 'name',
    extraText: (row) => `${str(row.purpose)} ${str(row.usage)} ${strList(row.risks).join(' ')}`,
    serialize: (row, sources) => ({
      id: str(row.id),
      category: str(row.category),
      name: str(row.name),
      image: row.image == null ? undefined : str(row.image),
      purpose: str(row.purpose),
      usage: str(row.usage),
      storageMethod: str(row.storageMethod),
      shelfLife: str(row.shelfLife),
      scenarios: strList(row.scenarios),
      risks: strList(row.risks),
      substitutes: strList(row.substitutes),
      relatedTutorialIds: strList(row.relatedTutorialIds),
      unit: str(row.unit) || '个',
      defaultPriority: num(row.defaultPriority, 2),
      tags: strList(row.tags),
      meta: buildMeta(row as unknown as MetaColumns, sources),
    }),
  },
  scenarios: {
    kind: 'scenarios',
    delegate: 'scenario',
    categoryField: null,
    titleField: 'title',
    extraText: (row) => `${str(row.summary)} ${strList(row.tags).join(' ')}`,
    detail: async (prisma, row) => {
      const p = prisma as {
        scenarioStep: { findMany: (args: unknown) => Promise<unknown> };
      };
      const steps = await p.scenarioStep.findMany({
        where: { scenarioId: str(row.id) },
        orderBy: { order: 'asc' },
        include: { choices: { orderBy: { order: 'asc' } } },
      });
      return { steps: serializeScenarioSteps(steps) };
    },
    serialize: (row, sources) => ({
      id: str(row.id),
      slug: str(row.slug),
      title: str(row.title),
      summary: str(row.summary),
      image: row.image == null ? undefined : str(row.image),
      tags: strList(row.tags),
      difficulty: num(row.difficulty, 1),
      steps: row.steps ?? [],
      isSimulation: true,
      debrief: strList(row.debrief),
      relatedArticleIds: strList(row.relatedArticleIds),
      meta: buildMeta(row as unknown as MetaColumns, sources),
    }),
  },
  hazards: {
    kind: 'hazards',
    delegate: 'hazard',
    categoryField: 'category',
    titleField: 'title',
    extraText: (row) =>
      `${str(row.description)} ${strList(row.prevention).join(' ')} ${strList(row.emergencyResponse).join(' ')}`,
    serialize: (row, sources) => ({
      id: str(row.id),
      title: str(row.title),
      category: str(row.category),
      dangerLevel: str(row.dangerLevel),
      description: str(row.description),
      indicators: strList(row.indicators),
      prevention: strList(row.prevention),
      emergencyResponse: strList(row.emergencyResponse),
      region: row.region == null ? undefined : str(row.region),
      meta: buildMeta(row as unknown as MetaColumns, sources),
    }),
  },
  quizzes: {
    kind: 'quizzes',
    delegate: 'quizQuestion',
    categoryField: null,
    titleField: 'question',
    extraText: (row) => `${str(row.question)} ${strList(row.options).join(' ')}`,
    serialize: (row, sources) => ({
      id: str(row.id),
      type: str(row.type),
      question: str(row.question),
      options: strList(row.options),
      answerIndex: num(row.answerIndex),
      explanation: str(row.explanation),
      sourceRefId: str(row.sourceRefId),
      sourceTitle: str(row.sourceTitle),
      difficulty: num(row.difficulty, 1),
      meta: buildMeta(row as unknown as MetaColumns, sources),
    }),
  },
};

/** 校验正文文本（发布校验用） */
export function extraTextOf(kind: ContentKind, row: Record<string, unknown>): string {
  return `${str(KIND_DEFS[kind].titleField ? row[KIND_DEFS[kind].titleField] : '')} ${KIND_DEFS[kind].extraText(row)}`;
}

export function titleOf(kind: ContentKind, row: Record<string, unknown>): string {
  return str(row[KIND_DEFS[kind].titleField]);
}

export const AUTHORITATIVE_SOURCE_TYPES = new Set(['government', 'medical', 'academic', 'ngo']);
