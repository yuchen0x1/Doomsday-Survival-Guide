import type { DangerLevel, ReviewRule } from './types';

export const DANGER_ORDER: Record<DangerLevel, number> = {
  L0: 0, L1: 1, L2: 2, L3: 3, L4: 4,
};

export const DANGER_LABELS: Record<DangerLevel, string> = {
  L0: '普通信息',
  L1: '注意事项',
  L2: '潜在危险',
  L3: '高危险',
  L4: '致命风险',
};

export const DANGER_COLORS: Record<DangerLevel, string> = {
  L0: 'var(--color-info)',
  L1: 'var(--color-sand)',
  L2: 'var(--color-warn)',
  L3: 'var(--color-danger)',
  L4: 'var(--color-danger)',
};

export function isDangerAtLeast(level: DangerLevel, min: DangerLevel): boolean {
  return DANGER_ORDER[level] >= DANGER_ORDER[min];
}

/** 取两者中更高的危险等级 */
export function maxDanger(a: DangerLevel, b: DangerLevel): DangerLevel {
  return DANGER_ORDER[a] >= DANGER_ORDER[b] ? a : b;
}

/**
 * 内容审核规则：命中规则时强制提升危险等级。
 * 危险等级由规则确定，AI 不得自行生成或降级。
 */
export const REVIEW_RULES: ReviewRule[] = [
  {
    match: ['toxic', 'poison', '有毒', '误食', '剧毒'],
    minDangerLevel: 'L3',
    reason: '涉及毒性内容必须至少标注 L3 高危险',
  },
  {
    match: ['致命', 'lethal', '致死', '呼吸停止', '心脏骤停'],
    minDangerLevel: 'L4',
    reason: '涉及致命风险的内容必须标注 L4',
  },
  {
    match: ['急救', '止血', '心肺复苏', 'CPR', '烧伤', '骨折', '蛇咬'],
    minDangerLevel: 'L2',
    reason: '医疗急救内容存在操作风险，至少标注 L2',
  },
  {
    match: ['用火', '火灾', '着火', '起火', '爆炸', '触电', '电力', '有毒气体'],
    minDangerLevel: 'L3',
    reason: '火灾/爆炸/电力/有毒气体属高危操作场景，至少标注 L3',
  },
  {
    match: ['蛇', '毒蛇', '蝎', '蜘蛛', '熊', '野猪'],
    minDangerLevel: 'L3',
    reason: '危险动物接触内容至少标注 L3',
  },
  {
    match: ['极端', '洪水', '地震', '台风', '雷暴', '失温'],
    minDangerLevel: 'L2',
    reason: '灾害应对内容至少标注 L2',
  },
];

/** 根据审核规则计算内容应具有的最低危险等级 */
export function computeRequiredDanger(text: string): { level: DangerLevel; reasons: string[] } {
  let level: DangerLevel = 'L0';
  const reasons: string[] = [];
  const lower = text.toLowerCase();
  for (const rule of REVIEW_RULES) {
    if (rule.match.some((m) => lower.includes(m.toLowerCase()))) {
      if (isDangerAtLeast(rule.minDangerLevel, level)) {
        if (DANGER_ORDER[rule.minDangerLevel] > DANGER_ORDER[level]) {
          level = rule.minDangerLevel;
        }
      }
      reasons.push(rule.reason);
    }
  }
  return { level, reasons };
}
