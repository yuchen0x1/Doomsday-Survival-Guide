import { describe, it, expect } from 'vitest';
import { computeRequiredDanger, isDangerAtLeast, maxDanger, DANGER_ORDER } from '../src/danger';

describe('danger 等级工具', () => {
  it('isDangerAtLeast 按序比较', () => {
    expect(isDangerAtLeast('L3', 'L2')).toBe(true);
    expect(isDangerAtLeast('L1', 'L2')).toBe(false);
    expect(isDangerAtLeast('L4', 'L4')).toBe(true);
  });

  it('maxDanger 取更高等级', () => {
    expect(maxDanger('L1', 'L3')).toBe('L3');
    expect(maxDanger('L4', 'L2')).toBe('L4');
    expect(maxDanger('L0', 'L0')).toBe('L0');
  });

  it('DANGER_ORDER 覆盖全部等级且递增', () => {
    expect(Object.keys(DANGER_ORDER)).toHaveLength(5);
    expect(DANGER_ORDER.L4).toBeGreaterThan(DANGER_ORDER.L3);
  });
});

describe('computeRequiredDanger 审核规则', () => {
  it('普通文本保持 L0', () => {
    const r = computeRequiredDanger('如何打一个牢固的方形绳结');
    expect(r.level).toBe('L0');
    expect(r.reasons).toHaveLength(0);
  });

  it('毒性内容强制至少 L3', () => {
    expect(computeRequiredDanger('这种植物全株有毒，误食会中毒').level).toBe('L3');
    expect(computeRequiredDanger('poison safety notes').level).toBe('L3');
  });

  it('致命风险强制 L4', () => {
    const r = computeRequiredDanger('该毒素可致人死亡，误食少量即可致命');
    expect(r.level).toBe('L4');
    expect(r.reasons.length).toBeGreaterThan(0);
  });

  it('急救内容至少 L2', () => {
    expect(computeRequiredDanger('心肺复苏的操作步骤').level).toBe('L2');
  });

  it('火灾/触电至少 L3', () => {
    expect(computeRequiredDanger('电器着火时的处置').level).toBe('L3');
    expect(computeRequiredDanger('触电后如何脱离电源').level).toBe('L3');
  });

  it('危险动物至少 L3', () => {
    expect(computeRequiredDanger('被毒蛇咬伤后的处理').level).toBe('L3');
  });

  it('灾害内容至少 L2，多规则取最高', () => {
    expect(computeRequiredDanger('地震时的躲避要领').level).toBe('L2');
    // 同时命中致命(L4)与毒性(L3) → 取 L4
    expect(computeRequiredDanger('剧毒气体泄漏可致命').level).toBe('L4');
  });

  it('关键词大小写不敏感', () => {
    expect(computeRequiredDanger('LETHAL dose warning').level).toBe('L4');
  });
});
