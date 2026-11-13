import type {
  AnimalSpecies,
  DisasterScenario,
  FirstAidGuide,
  HazardRecord,
  KnowledgeArticle,
  MedicineEntry,
  PlantSpecies,
  SurvivalSkill,
} from '@apocalypse/core';
import { computeRequiredDanger, DANGER_ORDER } from '@apocalypse/core';

/**
 * 危险等级归一化：内容加载时按审核规则（REVIEW_RULES）强制提升危险等级。
 *
 * 规格要求：L0-L4 危险预警由审核规则确定，AI/作者不得自行降级。
 * 文本口径与 core/validate.ts 完全一致（同字段拼接），保证
 * validateDataset 与运行时展示使用同一套判定。
 */

function enforceLevel(meta: { dangerLevel: string }, text: string): void {
  const required = computeRequiredDanger(text);
  if (DANGER_ORDER[required.level] > DANGER_ORDER[meta.dangerLevel as 'L0']) {
    meta.dangerLevel = required.level;
  }
}

const articleText = (a: KnowledgeArticle): string =>
  `${a.title} ${a.summary} ${a.sections.map((s) => s.body).join(' ')}`;

const plantText = (p: PlantSpecies): string =>
  `${p.name} ${p.toxicity} ${p.uses.join(' ')} ${p.edibilityWarning}`;

const animalText = (a: AnimalSpecies): string =>
  `${a.name} ${a.appearance} ${a.possibleInjury} ${a.biteFirstAid}`;

const firstAidText = (f: FirstAidGuide): string =>
  `${f.title} ${f.summary} ${f.dangerSignals.join(' ')} ${f.steps.join(' ')}`;

const skillText = (s: SurvivalSkill): string => `${s.title} ${s.summary} ${s.cautions.join(' ')}`;

const medicineText = (m: MedicineEntry): string => `${m.name} ${m.purpose} ${m.risks.join(' ')}`;

const hazardText = (h: HazardRecord): string =>
  `${h.title} ${h.description} ${h.indicators.join(' ')} ${h.prevention.join(' ')} ${h.emergencyResponse.join(' ')}`;

const scenarioText = (s: DisasterScenario): string =>
  `${s.title} ${s.summary} ${s.debrief.join(' ')}`;

export function normalizeDatasetDanger(input: {
  articles: KnowledgeArticle[];
  plants: PlantSpecies[];
  animals: AnimalSpecies[];
  firstAid: FirstAidGuide[];
  skills: SurvivalSkill[];
  medicines: MedicineEntry[];
  hazards: HazardRecord[];
  scenarios: DisasterScenario[];
}): void {
  for (const a of input.articles) enforceLevel(a.meta, articleText(a));
  for (const p of input.plants) enforceLevel(p.meta, plantText(p));
  for (const a of input.animals) enforceLevel(a.meta, animalText(a));
  for (const f of input.firstAid) enforceLevel(f.meta, firstAidText(f));
  for (const s of input.skills) enforceLevel(s.meta, skillText(s));
  for (const m of input.medicines) enforceLevel(m.meta, medicineText(m));
  for (const h of input.hazards) enforceLevel(h.meta, hazardText(h));
  for (const s of input.scenarios) enforceLevel(s.meta, scenarioText(s));
}
