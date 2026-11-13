import { computeRequiredDanger, DANGER_ORDER } from './danger';
import type {
  AnimalSpecies,
  ContentMeta,
  Credibility,
  DangerLevel,
  FirstAidGuide,
  KnowledgeArticle,
  MedicineEntry,
  PlantSpecies,
  SurvivalSkill,
} from './types';

export interface ValidationIssue {
  level: 'error' | 'warning';
  code: string;
  targetId: string;
  message: string;
}

/**
 * 知识质量控制规则（AI 知识质量控制章节的代码化）。
 * - A 级可信度不得由 AI 自行标记
 * - 涉及食用性 / 毒性 / 药用 / 医疗急救必须有可靠来源
 * - 已发布内容必须完成审核并带来源
 * - 危险等级必须满足审核规则的最低要求
 */

const MEDICAL_CATEGORIES = new Set(['first-aid', 'medicines']);
const HIGH_RISK_PLANT_CATEGORIES = new Set(['toxic', 'irritant', 'medicinal', 'edible']);
const AUTHORITATIVE_TYPES = new Set(['government', 'medical', 'academic', 'ngo']);

export function validateContentMeta(
  targetId: string,
  title: string,
  meta: ContentMeta,
  extraText = '',
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const text = `${title} ${extraText}`;

  // 规则 1：AI 不得自行标记 A 级
  if (meta.aiGenerated && meta.sources.some((s) => s.credibility === 'A')) {
    issues.push({
      level: 'error',
      code: 'AI_CANNOT_RATE_A',
      targetId,
      message: `《${title}》：AI 生成内容不得标记为 A 级可信度`,
    });
  }

  // 规则 2：已发布必须有来源与审核记录
  if (meta.reviewStatus === 'published') {
    if (meta.sources.length === 0) {
      issues.push({
        level: 'error',
        code: 'PUBLISHED_NO_SOURCE',
        targetId,
        message: `《${title}》：已发布内容必须登记资料来源`,
      });
    }
    if (!meta.reviewedAt || !meta.reviewedBy) {
      issues.push({
        level: 'error',
        code: 'PUBLISHED_NO_REVIEW',
        targetId,
        message: `《${title}》：已发布内容必须有审核时间与审核人`,
      });
    }
    if (meta.sources.some((s) => s.credibility === 'D')) {
      issues.push({
        level: 'error',
        code: 'PUBLISHED_D_CREDIBILITY',
        targetId,
        message: `《${title}》：D 级（未核实）内容不得发布`,
      });
    }
  }

  // 规则 3：AI 生成内容必须处于待审核
  if (meta.aiGenerated && meta.reviewStatus === 'published') {
    issues.push({
      level: 'error',
      code: 'AI_PENDING_ONLY',
      targetId,
      message: `《${title}》：AI 生成内容未经人工审核不得发布`,
    });
  }

  // 规则 4：来源必须带可信度与类型
  for (const s of meta.sources) {
    if (!s.type || !s.credibility) {
      issues.push({
        level: 'error',
        code: 'SOURCE_INCOMPLETE',
        targetId,
        message: `《${title}》：来源「${s.name}」缺少类型或可信度`,
      });
    }
    if (s.credibility === 'A' && !AUTHORITATIVE_TYPES.has(s.type)) {
      issues.push({
        level: 'warning',
        code: 'A_SOURCE_TYPE',
        targetId,
        message: `《${title}》：来源「${s.name}」标为 A 级但类型非权威机构`,
      });
    }
  }

  // 规则 5：危险等级不得低于审核规则要求
  const required = computeRequiredDanger(text);
  if (DANGER_ORDER[meta.dangerLevel] < DANGER_ORDER[required.level]) {
    issues.push({
      level: 'error',
      code: 'DANGER_TOO_LOW',
      targetId,
      message: `《${title}》：当前危险等级 ${meta.dangerLevel} 低于审核规则要求的 ${required.level}（${required.reasons[0] ?? ''}）`,
    });
  }

  return issues;
}

export function validateArticle(a: KnowledgeArticle): ValidationIssue[] {
  const issues = validateContentMeta(
    a.id,
    a.title,
    a.meta,
    `${a.summary} ${a.sections.map((s) => s.body).join(' ')}`,
  );
  if (a.sections.length === 0) {
    issues.push({
      level: 'error',
      code: 'EMPTY_SECTIONS',
      targetId: a.id,
      message: `《${a.title}》：正文不能为空`,
    });
  }
  if (!a.summary || a.summary.length < 10) {
    issues.push({
      level: 'warning',
      code: 'SHORT_SUMMARY',
      targetId: a.id,
      message: `《${a.title}》：简介过短`,
    });
  }
  if (MEDICAL_CATEGORIES.has(a.categorySlug)) {
    const hasMedSource = a.meta.sources.some((s) => AUTHORITATIVE_TYPES.has(s.type));
    if (!hasMedSource) {
      issues.push({
        level: 'error',
        code: 'MEDICAL_NO_AUTHORITATIVE_SOURCE',
        targetId: a.id,
        message: `《${a.title}》：医疗急救类内容必须有权威来源`,
      });
    }
  }
  return issues;
}

export function validatePlant(p: PlantSpecies): ValidationIssue[] {
  const issues = validateContentMeta(
    p.id,
    p.name,
    p.meta,
    `${p.toxicity} ${p.uses.join(' ')} ${p.edibilityWarning}`,
  );
  if (!p.scientificName) {
    issues.push({
      level: 'error',
      code: 'NO_SCIENTIFIC_NAME',
      targetId: p.id,
      message: `《${p.name}》：植物必须登记学名`,
    });
  }
  if (HIGH_RISK_PLANT_CATEGORIES.has(p.category)) {
    const hasSource = p.meta.sources.length > 0;
    if (!hasSource) {
      issues.push({
        level: 'error',
        code: 'PLANT_NO_SOURCE',
        targetId: p.id,
        message: `《${p.name}》：涉及食用/毒性/药用的植物必须有来源`,
      });
    }
  }
  if (p.category === 'toxic' && DANGER_ORDER[p.meta.dangerLevel] < DANGER_ORDER.L3) {
    issues.push({
      level: 'error',
      code: 'TOXIC_NEED_L3',
      targetId: p.id,
      message: `《${p.name}》：有毒植物危险等级不得低于 L3`,
    });
  }
  if (p.category === 'edible' && !p.lookalikes.length) {
    issues.push({
      level: 'warning',
      code: 'EDIBLE_NO_LOOKALIKE',
      targetId: p.id,
      message: `《${p.name}》：可食用植物建议登记易混淆植物`,
    });
  }
  if (p.confidence === 'D' && p.meta.reviewStatus === 'published') {
    issues.push({
      level: 'error',
      code: 'D_NOT_PUBLISHED',
      targetId: p.id,
      message: `《${p.name}》：D 级可信度不得发布`,
    });
  }
  return issues;
}

export function validateAnimal(a: AnimalSpecies): ValidationIssue[] {
  const issues = validateContentMeta(
    a.id,
    a.name,
    a.meta,
    `${a.appearance} ${a.possibleInjury} ${a.biteFirstAid}`,
  );
  if (!a.scientificName) {
    issues.push({
      level: 'warning',
      code: 'NO_SCIENTIFIC_NAME',
      targetId: a.id,
      message: `《${a.name}》：建议登记学名`,
    });
  }
  if (DANGER_ORDER[a.dangerLevel] >= DANGER_ORDER.L3 && !a.safetyMeasures) {
    issues.push({
      level: 'error',
      code: 'DANGEROUS_NO_SAFETY',
      targetId: a.id,
      message: `《${a.name}》：L3 以上危险动物必须给出安全措施`,
    });
  }
  if (!a.identificationNote && a.identificationConfidence === 'C') {
    issues.push({
      level: 'warning',
      code: 'LOW_CONF_NO_NOTE',
      targetId: a.id,
      message: `《${a.name}》：低可信度识别应附说明`,
    });
  }
  return issues;
}

export function validateFirstAid(f: FirstAidGuide): ValidationIssue[] {
  const issues = validateContentMeta(
    f.id,
    f.title,
    f.meta,
    `${f.summary} ${f.dangerSignals.join(' ')} ${f.steps.join(' ')}`,
  );
  if (f.steps.length === 0) {
    issues.push({
      level: 'error',
      code: 'NO_STEPS',
      targetId: f.id,
      message: `《${f.title}》：急救步骤不能为空`,
    });
  }
  if (f.dangerSignals.length === 0) {
    issues.push({
      level: 'error',
      code: 'NO_DANGER_SIGNALS',
      targetId: f.id,
      message: `《${f.title}》：必须列出危险信号`,
    });
  }
  if (f.whenToSeekHelp.length === 0) {
    issues.push({
      level: 'error',
      code: 'NO_SEEK_HELP',
      targetId: f.id,
      message: `《${f.title}》：必须说明何时必须就医`,
    });
  }
  if (!f.meta.sources.some((s) => AUTHORITATIVE_TYPES.has(s.type))) {
    issues.push({
      level: 'error',
      code: 'FIRSTAID_NO_SOURCE',
      targetId: f.id,
      message: `《${f.title}》：急救内容必须有权威医学来源`,
    });
  }
  return issues;
}

export function validateSkill(s: SurvivalSkill): ValidationIssue[] {
  const issues = validateContentMeta(s.id, s.title, s.meta, `${s.summary} ${s.cautions.join(' ')}`);
  if (s.steps.length === 0) {
    issues.push({
      level: 'error',
      code: 'NO_STEPS',
      targetId: s.id,
      message: `《${s.title}》：教程步骤不能为空`,
    });
  }
  if (s.verification === 'verified' && s.meta.reviewStatus !== 'published') {
    issues.push({
      level: 'warning',
      code: 'VERIFIED_NOT_PUBLISHED',
      targetId: s.id,
      message: `《${s.title}》：已验证教程未发布`,
    });
  }
  if (s.verification === 'pending_review' && s.meta.reviewStatus === 'published') {
    issues.push({
      level: 'error',
      code: 'PENDING_PUBLISHED',
      targetId: s.id,
      message: `《${s.title}》：待审核教程不得发布`,
    });
  }
  // 高危操作（火灾/爆炸/有毒/电力/机械）禁止提供可操作教程
  const highRisk = ['火灾', '爆炸', '有毒', '触电', '电力', '机械伤害'];
  const text = `${s.title} ${s.purpose} ${s.steps.map((x) => x.instruction).join(' ')}`;
  if (highRisk.some((k) => text.includes(k)) && s.dangerLevel === 'L0') {
    issues.push({
      level: 'error',
      code: 'HIGH_RISK_NEED_LEVEL',
      targetId: s.id,
      message: `《${s.title}》：高危操作必须标注危险等级`,
    });
  }
  return issues;
}

export function validateMedicine(m: MedicineEntry): ValidationIssue[] {
  const issues = validateContentMeta(m.id, m.name, m.meta, `${m.purpose} ${m.risks.join(' ')}`);
  if (!m.disclaimer) {
    issues.push({
      level: 'error',
      code: 'NO_DISCLAIMER',
      targetId: m.id,
      message: `《${m.name}》：药物内容必须带免责声明`,
    });
  }
  if (!m.meta.sources.length) {
    issues.push({
      level: 'error',
      code: 'MED_NO_SOURCE',
      targetId: m.id,
      message: `《${m.name}》：药物知识必须有来源`,
    });
  }
  // 禁止出现具体个体化处方剂量字样（如“每日三次每次两粒”类）
  if (/每[日天]\s*\d+\s*次/.test(m.purpose + m.keyPoints.join(''))) {
    issues.push({
      level: 'warning',
      code: 'DOSE_ADVICE',
      targetId: m.id,
      message: `《${m.name}》：疑似包含具体用药频次建议，应改为通用说明并提示遵医嘱`,
    });
  }
  return issues;
}

/** 校验整个数据集，返回全部问题（测试与 CI 使用） */
export interface DatasetBundle {
  articles: KnowledgeArticle[];
  plants: PlantSpecies[];
  animals: AnimalSpecies[];
  firstAid: FirstAidGuide[];
  skills: SurvivalSkill[];
  medicines: MedicineEntry[];
}

export function validateDataset(bundle: DatasetBundle): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const a of bundle.articles) issues.push(...validateArticle(a));
  for (const p of bundle.plants) issues.push(...validatePlant(p));
  for (const a of bundle.animals) issues.push(...validateAnimal(a));
  for (const f of bundle.firstAid) issues.push(...validateFirstAid(f));
  for (const s of bundle.skills) issues.push(...validateSkill(s));
  for (const m of bundle.medicines) issues.push(...validateMedicine(m));
  return issues;
}

export function credibilityRank(c: Credibility): number {
  return { A: 4, B: 3, C: 2, D: 1 }[c];
}
