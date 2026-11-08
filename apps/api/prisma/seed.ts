/**
 * 种子数据：
 *  1) 管理员账号（ADMIN_EMAIL / ADMIN_PASSWORD，bcrypt 哈希）
 *  2) SystemSetting 系统配置
 *  3) 从 @apocalypse/knowledge-data 同步已发布知识内容（幂等：按 id upsert）
 *
 * 运行：pnpm db:seed（= prisma db seed → tsx prisma/seed.ts）
 */
import { loadEnvFiles } from '../src/config/load-env';

loadEnvFiles();

import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { SOURCES, getDataset } from '@apocalypse/knowledge-data';
import type { ContentMeta, SourceReference } from '@apocalypse/core';

const prisma = new PrismaClient();

function toDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** ContentMeta → 表上的 meta 字段组 */
function metaColumns(meta: ContentMeta): Record<string, unknown> {
  return {
    dangerLevel: meta.dangerLevel,
    reviewStatus: meta.reviewStatus,
    reviewNote: meta.reviewNote ?? null,
    reviewedAt: toDate(meta.reviewedAt),
    reviewedBy: meta.reviewedBy ?? null,
    aiGenerated: meta.aiGenerated ?? false,
    version: meta.version ?? 1,
    sourceIds: meta.sources.map((s) => s.id),
    createdAt: toDate(meta.createdAt) ?? new Date(),
    updatedAt: toDate(meta.updatedAt) ?? new Date(),
  };
}

function splitMeta(meta: ContentMeta): {
  update: Record<string, unknown>;
  create: Record<string, unknown>;
} {
  const full = metaColumns(meta);
  const { createdAt: _c, updatedAt: _u, ...rest } = full;
  return { update: rest, create: full };
}

function sourceRow(s: SourceReference) {
  return {
    name: s.name,
    url: s.url ?? null,
    publisher: s.publisher ?? null,
    publishedAt: toDate(s.publishedAt),
    verifiedAt: toDate(s.verifiedAt),
    verifiedBy: s.verifiedBy ?? null,
    type: s.type,
    credibility: s.credibility,
  };
}

async function seedSources(): Promise<number> {
  const dataset = getDataset();
  const byId = new Map<string, SourceReference>();
  for (const source of Object.values(SOURCES)) byId.set(source.id, source);
  const collections = [
    dataset.articles,
    dataset.plants,
    dataset.animals,
    dataset.insects,
    dataset.medicines,
    dataset.firstAid,
    dataset.skills,
    dataset.supplies,
    dataset.scenarios,
    dataset.hazards,
  ];
  for (const list of collections) {
    for (const item of list) {
      for (const source of item.meta.sources) byId.set(source.id, source);
    }
  }
  let count = 0;
  for (const source of byId.values()) {
    const row = sourceRow(source);
    await prisma.source.upsert({
      where: { id: source.id },
      update: row,
      create: { id: source.id, ...row },
    });
    count += 1;
  }
  return count;
}

async function seedAdmin(): Promise<string> {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@survival.local').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'change-me-initial-admin-password';
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'ADMIN', status: 'active' },
    create: {
      email,
      name: '系统管理员',
      passwordHash,
      role: 'ADMIN',
      status: 'active',
    },
  });
  return user.id;
}

async function seedSettings(): Promise<number> {
  const settings: { key: string; value: unknown; description: string }[] = [
    {
      key: 'site.name',
      value: 'APOCALYPSE SURVIVAL 末日生存指南',
      description: '站点名称',
    },
    {
      key: 'review.policy',
      value: {
        transition: ['draft', 'pending_review', 'reviewed', 'published', 'retired'],
        requireSourceForPublish: true,
        requireReviewRecordForPublish: true,
        dCredibilityCannotPublish: true,
        aiCannotRateA: true,
        medicalRequiresAuthoritativeSource: true,
        dangerLevelFromReviewRules: true,
      },
      description: '内容审核规则（与 packages/core/validate.ts 一致）',
    },
    {
      key: 'ai.settings',
      value: {
        model: process.env.AI_MODEL ?? 'mimo-v2.6-Flash',
        baseUrl: process.env.AI_BASE_URL ?? 'https://api.xiaomimimo.com/v1',
        rateLimitPerMin: Number(process.env.AI_RATE_LIMIT_PER_MIN ?? 20),
        keyConfigured: Boolean((process.env.AI_API_KEY ?? '').trim()),
      },
      description: 'AI 助手配置（密钥永不入库）',
    },
    {
      key: 'seed.version',
      value: '1.0.0',
      description: '种子数据版本',
    },
    {
      key: 'seed.lastRunAt',
      value: new Date().toISOString(),
      description: '最近一次 seed 执行时间',
    },
  ];
  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value as object, description: setting.description },
      create: {
        key: setting.key,
        value: setting.value as object,
        description: setting.description,
      },
    });
  }
  return settings.length;
}

async function syncTags(
  kind: string,
  ids: string[],
  tagLists: { id: string; tags: string[] }[],
): Promise<number> {
  await prisma.contentTag.deleteMany({ where: { kind, contentId: { in: ids } } });
  const rows = tagLists.flatMap((item) =>
    [...new Set(item.tags)].map((tag) => ({ kind, contentId: item.id, tag })),
  );
  if (rows.length > 0) await prisma.contentTag.createMany({ data: rows });
  return rows.length;
}

interface StepInput {
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
  choices: {
    id: string;
    label: string;
    consequence: string;
    nextStepId?: string;
    riskLevel: 'L0' | 'L1' | 'L2' | 'L3' | 'L4';
    quality: 'good' | 'acceptable' | 'bad';
  }[];
}

async function seedContent(): Promise<Record<string, number>> {
  const dataset = getDataset();
  const counts: Record<string, number> = {};

  /* 文章 */
  const articleTags: { id: string; tags: string[] }[] = [];
  for (const a of dataset.articles) {
    const { update, create } = splitMeta(a.meta);
    await prisma.article.upsert({
      where: { id: a.id },
      update: {
        categorySlug: a.categorySlug,
        title: a.title,
        aliases: a.aliases,
        summary: a.summary,
        coverImage: a.coverImage ?? null,
        environment: a.environment ?? [],
        scenarios: a.scenarios ?? [],
        sections: a.sections as object[],
        steps: a.steps ?? [],
        tools: a.tools ?? [],
        precautions: a.precautions ?? [],
        contraindications: a.contraindications ?? [],
        tags: a.tags,
        difficulty: a.difficulty,
        relatedIds: a.relatedIds,
        offlineReady: a.offlineReady,
        ...update,
      },
      create: {
        id: a.id,
        categorySlug: a.categorySlug,
        title: a.title,
        aliases: a.aliases,
        summary: a.summary,
        coverImage: a.coverImage ?? null,
        environment: a.environment ?? [],
        scenarios: a.scenarios ?? [],
        sections: a.sections as object[],
        steps: a.steps ?? [],
        tools: a.tools ?? [],
        precautions: a.precautions ?? [],
        contraindications: a.contraindications ?? [],
        tags: a.tags,
        difficulty: a.difficulty,
        relatedIds: a.relatedIds,
        offlineReady: a.offlineReady,
        ...create,
      },
    });
    articleTags.push({ id: a.id, tags: a.tags });
  }
  counts.articles = dataset.articles.length;
  counts.articleTags = await syncTags(
    'articles',
    articleTags.map((t) => t.id),
    articleTags,
  );

  /* 植物 */
  const plantTags: { id: string; tags: string[] }[] = [];
  for (const p of dataset.plants) {
    const { update, create } = splitMeta(p.meta);
    const domain = {
      category: p.category,
      name: p.name,
      scientificName: p.scientificName,
      aliases: p.aliases,
      family: p.family,
      image: p.image ?? null,
      leaf: p.leaf,
      flower: p.flower,
      fruit: p.fruit,
      stem: p.stem,
      root: p.root,
      season: p.season,
      distribution: p.distribution,
      habitat: p.habitat,
      usableParts: p.usableParts,
      uses: p.uses,
      toxicity: p.toxicity,
      lookalikes: p.lookalikes as object[],
      confusionRisk: p.confusionRisk,
      edibilityWarning: p.edibilityWarning,
      confidence: p.confidence,
      tags: p.tags,
    };
    await prisma.plant.upsert({
      where: { id: p.id },
      update: { ...domain, ...update },
      create: { id: p.id, ...domain, ...create },
    });
    plantTags.push({ id: p.id, tags: p.tags });
  }
  counts.plants = dataset.plants.length;
  counts.plantTags = await syncTags(
    'plants',
    plantTags.map((t) => t.id),
    plantTags,
  );

  /* 动物 + 足迹 */
  const animalTags: { id: string; tags: string[] }[] = [];
  for (const a of dataset.animals) {
    const { update, create } = splitMeta(a.meta);
    const domain = {
      animalClass: a.animalClass,
      name: a.name,
      scientificName: a.scientificName,
      aliases: a.aliases,
      image: a.image ?? null,
      appearance: a.appearance,
      habitat: a.habitat,
      activityTime: a.activityTime,
      behavior: a.behavior,
      diet: a.diet,
      tracks: a.tracks,
      feces: a.feces,
      dangerLevel: a.dangerLevel,
      possibleInjury: a.possibleInjury,
      safetyMeasures: a.safetyMeasures,
      biteFirstAid: a.biteFirstAid,
      distribution: a.distribution,
      identificationConfidence: a.identificationConfidence,
      identificationNote: a.identificationNote ?? null,
      tags: a.tags,
    };
    await prisma.animal.upsert({
      where: { id: a.id },
      update: { ...domain, ...update },
      create: { id: a.id, ...domain, ...create },
    });
    const tracks = dataset.animalTracks.filter((t) => t.animalId === a.id);
    if (tracks.length > 0) {
      await prisma.animalTrack.deleteMany({ where: { animalId: a.id } });
      await prisma.animalTrack.createMany({
        data: tracks.map((t) => ({
          animalId: a.id,
          description: t.description,
          size: t.size,
          gait: t.gait ?? null,
          image: t.image ?? null,
        })),
      });
    }
    animalTags.push({ id: a.id, tags: a.tags });
  }
  counts.animals = dataset.animals.length;
  counts.animalTracks = dataset.animalTracks.length;
  counts.animalTags = await syncTags(
    'animals',
    animalTags.map((t) => t.id),
    animalTags,
  );

  /* 昆虫 */
  const insectTags: { id: string; tags: string[] }[] = [];
  for (const i of dataset.insects) {
    const { update, create } = splitMeta(i.meta);
    const domain = {
      name: i.name,
      scientificName: i.scientificName,
      aliases: i.aliases,
      image: i.image ?? null,
      appearance: i.appearance,
      habitat: i.habitat,
      season: i.season,
      behavior: i.behavior,
      dangerLevel: i.dangerLevel,
      stingBiteRisk: i.stingBiteRisk,
      firstAid: i.firstAid,
      uses: i.uses ?? [],
      distribution: i.distribution,
      confidence: i.confidence,
      tags: i.tags,
    };
    await prisma.insect.upsert({
      where: { id: i.id },
      update: { ...domain, ...update },
      create: { id: i.id, ...domain, ...create },
    });
    insectTags.push({ id: i.id, tags: i.tags });
  }
  counts.insects = dataset.insects.length;
  counts.insectTags = await syncTags(
    'insects',
    insectTags.map((t) => t.id),
    insectTags,
  );

  /* 药物 */
  const medicineTags: { id: string; tags: string[] }[] = [];
  for (const m of dataset.medicines) {
    const { update, create } = splitMeta(m.meta);
    const domain = {
      name: m.name,
      aliases: m.aliases,
      category: m.category,
      image: m.image ?? null,
      purpose: m.purpose,
      commonForms: m.commonForms,
      keyPoints: m.keyPoints,
      risks: m.risks,
      contraindications: m.contraindications,
      storage: m.storage,
      disclaimer: m.disclaimer,
      dangerLevel: m.dangerLevel,
      tags: m.tags,
    };
    await prisma.medicine.upsert({
      where: { id: m.id },
      update: { ...domain, ...update },
      create: { id: m.id, ...domain, ...create },
    });
    medicineTags.push({ id: m.id, tags: m.tags });
  }
  counts.medicines = dataset.medicines.length;
  counts.medicineTags = await syncTags(
    'medicines',
    medicineTags.map((t) => t.id),
    medicineTags,
  );

  /* 急救 */
  const firstAidTags: { id: string; tags: string[] }[] = [];
  for (const f of dataset.firstAid) {
    const { update, create } = splitMeta(f.meta);
    const domain = {
      categorySlug: f.categorySlug,
      title: f.title,
      summary: f.summary,
      image: f.image ?? null,
      applicable: f.applicable,
      dangerSignals: f.dangerSignals,
      immediateSafety: f.immediateSafety,
      wrongActions: f.wrongActions,
      steps: f.steps,
      whenToSeekHelp: f.whenToSeekHelp,
      difficulty: f.difficulty,
      tags: f.tags,
      relatedIds: f.relatedIds,
      offlineReady: f.offlineReady,
    };
    await prisma.firstAidGuide.upsert({
      where: { id: f.id },
      update: { ...domain, ...update },
      create: { id: f.id, ...domain, ...create },
    });
    firstAidTags.push({ id: f.id, tags: f.tags });
  }
  counts.firstAid = dataset.firstAid.length;
  counts.firstAidTags = await syncTags(
    'first-aid',
    firstAidTags.map((t) => t.id),
    firstAidTags,
  );

  /* 技能 */
  const skillTags: { id: string; tags: string[] }[] = [];
  for (const s of dataset.skills) {
    const { update, create } = splitMeta(s.meta);
    const domain = {
      categorySlug: s.categorySlug,
      title: s.title,
      summary: s.summary,
      coverImage: s.coverImage ?? null,
      purpose: s.purpose,
      scenarios: s.scenarios,
      materials: s.materials,
      tools: s.tools,
      difficulty: s.difficulty,
      estimatedMinutes: s.estimatedMinutes,
      steps: s.steps as object[],
      cautions: s.cautions,
      failureReasons: s.failureReasons,
      safetyChecklist: s.safetyChecklist,
      alternatives: s.alternatives,
      tags: s.tags,
      relatedIds: s.relatedIds,
      verification: s.verification,
      dangerLevel: s.dangerLevel,
      offlineReady: s.offlineReady,
    };
    await prisma.skill.upsert({
      where: { id: s.id },
      update: { ...domain, ...update },
      create: { id: s.id, ...domain, ...create },
    });
    skillTags.push({ id: s.id, tags: s.tags });
  }
  counts.skills = dataset.skills.length;
  counts.skillTags = await syncTags(
    'skills',
    skillTags.map((t) => t.id),
    skillTags,
  );

  /* 物资 */
  const supplyTags: { id: string; tags: string[] }[] = [];
  for (const s of dataset.supplies) {
    const { update, create } = splitMeta(s.meta);
    const domain = {
      category: s.category,
      name: s.name,
      image: s.image ?? null,
      purpose: s.purpose,
      usage: s.usage,
      storageMethod: s.storageMethod,
      shelfLife: s.shelfLife,
      scenarios: s.scenarios,
      risks: s.risks,
      substitutes: s.substitutes,
      relatedTutorialIds: s.relatedTutorialIds,
      unit: s.unit,
      defaultPriority: s.defaultPriority,
      tags: s.tags,
    };
    await prisma.supply.upsert({
      where: { id: s.id },
      update: { ...domain, ...update },
      create: { id: s.id, ...domain, ...create },
    });
    supplyTags.push({ id: s.id, tags: s.tags });
  }
  counts.supplies = dataset.supplies.length;
  counts.supplyTags = await syncTags(
    'supplies',
    supplyTags.map((t) => t.id),
    supplyTags,
  );

  /* 场景（含步骤与选项） */
  const scenarioTags: { id: string; tags: string[] }[] = [];
  for (const s of dataset.scenarios) {
    const { update, create } = splitMeta(s.meta);
    const domain = {
      slug: s.slug,
      title: s.title,
      summary: s.summary,
      image: s.image ?? null,
      tags: s.tags,
      difficulty: s.difficulty,
      isSimulation: true,
      debrief: s.debrief,
      relatedArticleIds: s.relatedArticleIds,
    };
    await prisma.scenario.upsert({
      where: { id: s.id },
      update: { ...domain, ...update },
      create: { id: s.id, ...domain, ...create },
    });
    await prisma.scenarioStep.deleteMany({ where: { scenarioId: s.id } });
    for (const [index, step] of (s.steps as StepInput[]).entries()) {
      await prisma.scenarioStep.create({
        data: {
          id: step.id,
          scenarioId: s.id,
          order: index,
          scene: step.scene,
          environment: step.environment ?? [],
          knownHazards: step.knownHazards ?? [],
          availableResources: step.availableResources ?? [],
          partyStatus: step.partyStatus,
          timeLimit: step.timeLimit ?? null,
          objective: step.objective,
          recommended: step.recommended ?? [],
          discouraged: step.discouraged ?? [],
          reviewStatus: 'published',
          dangerLevel: s.meta.dangerLevel,
          choices: {
            create: (step.choices ?? []).map((choice, choiceIndex) => ({
              id: choice.id,
              order: choiceIndex,
              label: choice.label,
              consequence: choice.consequence,
              nextStepId: choice.nextStepId ?? null,
              riskLevel: choice.riskLevel,
              quality: choice.quality,
              reviewStatus: 'published',
              dangerLevel: choice.riskLevel,
            })),
          },
        },
      });
    }
    scenarioTags.push({ id: s.id, tags: s.tags });
  }
  counts.scenarios = dataset.scenarios.length;
  counts.scenarioTags = await syncTags(
    'scenarios',
    scenarioTags.map((t) => t.id),
    scenarioTags,
  );

  /* 危害 */
  const hazardTags: { id: string; tags: string[] }[] = [];
  for (const h of dataset.hazards) {
    const { update, create } = splitMeta(h.meta);
    const domain = {
      title: h.title,
      category: h.category,
      dangerLevel: h.dangerLevel,
      description: h.description,
      indicators: h.indicators,
      prevention: h.prevention,
      emergencyResponse: h.emergencyResponse,
      region: h.region ?? null,
    };
    await prisma.hazard.upsert({
      where: { id: h.id },
      update: { ...domain, ...update },
      create: { id: h.id, ...domain, ...create },
    });
    hazardTags.push({ id: h.id, tags: [] });
  }
  counts.hazards = dataset.hazards.length;
  counts.hazardTags = await syncTags(
    'hazards',
    hazardTags.map((t) => t.id),
    hazardTags,
  );

  /* 题库 */
  for (const q of dataset.quizQuestions) {
    const { update, create } = splitMeta(fallbackMeta(q.id));
    const domain = {
      type: q.type,
      question: q.question,
      options: q.options,
      answerIndex: q.answerIndex,
      explanation: q.explanation,
      sourceRefId: q.sourceRefId,
      sourceTitle: q.sourceTitle,
      difficulty: q.difficulty,
    };
    await prisma.quizQuestion.upsert({
      where: { id: q.id },
      update: { ...domain, ...update },
      create: { id: q.id, ...domain, ...create },
    });
  }
  counts.quizzes = dataset.quizQuestions.length;

  return counts;
}

/** QuizQuestion 类型上没有 meta，落库时补齐默认 meta 字段组 */
function fallbackMeta(id: string): ContentMeta {
  const now = new Date().toISOString();
  return {
    id,
    reviewStatus: 'published',
    version: 1,
    dangerLevel: 'L0',
    sources: [],
    createdAt: now,
    updatedAt: now,
  };
}

async function main(): Promise<void> {
  console.log('▶ 开始 seed …');
  const adminId = await seedAdmin();
  console.log(`  ✓ 管理员：${process.env.ADMIN_EMAIL ?? 'admin@survival.local'} (${adminId})`);
  const settings = await seedSettings();
  console.log(`  ✓ SystemSetting：${settings} 条`);
  const sources = await seedSources();
  console.log(`  ✓ Source：${sources} 条`);
  const counts = await seedContent();
  console.log('  ✓ 知识内容：');
  for (const [key, value] of Object.entries(counts)) {
    console.log(`      - ${key}: ${value}`);
  }
  console.log('▶ seed 完成');
}

main()
  .catch((err: unknown) => {
    console.error('seed 失败：', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
