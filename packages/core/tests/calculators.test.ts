import { describe, it, expect } from 'vitest';
import { CALCULATORS, getCalculator } from '../src/calculators';

describe('生存计算器', () => {
  it('共 8 个计算器，slug 唯一', () => {
    expect(CALCULATORS).toHaveLength(8);
    const slugs = CALCULATORS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(8);
  });

  it('每个计算器都有公式与依据（透明性要求）', () => {
    for (const c of CALCULATORS) {
      expect(c.formula.length, c.id).toBeGreaterThan(5);
      expect(c.basis.length, c.id).toBeGreaterThan(10);
      expect(c.params.length, c.id).toBeGreaterThan(0);
      for (const p of c.params) {
        expect(p.min, `${c.id}.${p.key}`).toBeLessThan(p.max);
        expect(p.defaultValue, `${c.id}.${p.key}`).toBeGreaterThanOrEqual(p.min);
        expect(p.defaultValue, `${c.id}.${p.key}`).toBeLessThanOrEqual(p.max);
      }
    }
  });

  it('getCalculator 按 slug 或 id 查找', () => {
    expect(getCalculator('water-reserve')?.name).toBe('饮水储备计算');
    expect(getCalculator('battery-life')).toBeDefined();
    expect(getCalculator('not-exist')).toBeUndefined();
  });

  it('饮水储备：4人3天冗余0.2 → 4×3×3×1.2 = 43.2L', () => {
    const c = getCalculator('water-reserve')!;
    const res = c.compute({ people: 4, days: 3, redundancy: 0.2 });
    const total = res.find((r) => r.key === 'total')!;
    expect(total.value).toBe(43.2);
    expect(total.unit).toBe('L');
    const bottles = res.find((r) => r.key === 'bottles')!;
    expect(bottles.value).toBe(Math.ceil(43.2 / 0.55));
  });

  it('电池续航：10000mAh、500mA、低温0.7 → 10000×0.85×0.7/500 = 11.9h', () => {
    const c = getCalculator('battery-life')!;
    const res = c.compute({ capacity: 10000, draw: 500, tempFactor: 0.7 });
    expect(res.find((r) => r.key === 'hours')!.value).toBe(11.9);
  });

  it('库存消耗：每日消耗为 0 时返回 -1 并带说明，不产生 NaN/Infinity', () => {
    const c = getCalculator('stock-consume')!;
    const res = c.compute({ stock: 30, daily: 0, people: 4 });
    for (const r of res) expect(Number.isFinite(r.value)).toBe(true);
    expect(res.find((r) => r.key === 'days')!.value).toBe(-1);
  });

  it('有效期管理：过期时标记禁止食用', () => {
    const c = getCalculator('expiry-manage')!;
    const res = c.compute({ total: 365, elapsed: 400 });
    const remain = res.find((r) => r.key === 'remain')!;
    expect(remain.value).toBeLessThan(0);
    expect(remain.note).toContain('禁止食用');
  });

  it('优先级计算分数被夹在 0-20', () => {
    const c = getCalculator('priority-calc')!;
    const high = c.compute({ vital: 5, shortage: 5, replaceability: 5, weight: 0 });
    expect(high.find((r) => r.key === 'score')!.value).toBeLessThanOrEqual(20);
    const low = c.compute({ vital: 1, shortage: 1, replaceability: 1, weight: 50 });
    expect(low.find((r) => r.key === 'score')!.value).toBeGreaterThanOrEqual(0);
  });

  it('能源储备：发电与需求分别计算', () => {
    const c = getCalculator('energy-store')!;
    const res = c.compute({ load: 200, panel: 100, sun: 4, autonomy: 3 });
    expect(res.find((r) => r.key === 'gen')!.value).toBe(280); // 100×4×0.7
    expect(res.find((r) => r.key === 'battery')!.value).toBe(720); // 200×3×1.2
  });
});
