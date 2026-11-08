import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CALCULATORS, getCalculator } from '@apocalypse/core';
import { Icon } from '../components/Icon';
import { PageHeader, Panel, EmptyState, Tag } from '../components/ui';

/**
 * 生存计算器：全部公式带说明、单位、输入范围与计算依据。
 */
export default function CalculatorsPage() {
  const { slug } = useParams();
  const active = slug ? getCalculator(slug) : CALCULATORS[0];
  const [values, setValues] = useState<Record<string, number>>({});

  const input = useMemo(() => {
    const base: Record<string, number> = {};
    active?.params.forEach((p) => { base[p.key] = values[p.key] ?? p.defaultValue; });
    return base;
  }, [active, values]);

  const results = useMemo(() => (active ? active.compute(input) : []), [active, input]);

  if (!active) {
    return <div className="fade-in"><EmptyState icon="calculator" title="未找到该计算器" /></div>;
  }

  return (
    <div className="fade-in">
      <PageHeader icon="calculator" title="生存计算器" subtitle="8 类应急估算工具 · 公式透明 · 单位明确 · 计算依据可追溯" />

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        {/* 左：计算器列表 */}
        <div className="flex flex-col gap-1.5">
          {CALCULATORS.map((c) => (
            <a key={c.id} href={`/calculator/${c.slug}`}
              className={`panel flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] transition-colors ${
                active.id === c.id ? '!border-[var(--color-sand)] bg-[var(--color-riser)]' : 'hover:border-[var(--color-edge-hi)]'
              }`}>
              <Icon name="calculator" size={14} className="text-[var(--color-sand)]" />
              {c.name}
            </a>
          ))}
        </div>

        {/* 右：计算区 */}
        <div>
          <Panel className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-bold">{active.name}</h2>
                <p className="mt-1 text-[13px] text-[var(--color-ink-dim)]">{active.description}</p>
              </div>
            </div>

            {/* 输入参数 */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {active.params.map((p) => (
                <label key={p.key} className="block">
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-[12.5px] text-[var(--color-ink-dim)]">{p.label}{p.unit && <span className="ml-1 text-[var(--color-ink-faint)]">（{p.unit}）</span>}</span>
                    <span className="font-mono text-[10.5px] text-[var(--color-ink-faint)]">{p.min}–{p.max}</span>
                  </div>
                  <input
                    type="number" className="field font-mono"
                    min={p.min} max={p.max} step={p.step}
                    value={input[p.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [p.key]: Number(e.target.value) }))}
                  />
                  <input
                    type="range" className="mt-2 w-full accent-[var(--color-moss-hi)]"
                    min={p.min} max={p.max} step={p.step} value={input[p.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [p.key]: Number(e.target.value) }))}
                  />
                  {p.help && <p className="mt-1 text-[11px] text-[var(--color-ink-faint)]">{p.help}</p>}
                </label>
              ))}
            </div>

            {/* 结果 */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {results.map((r) => (
                <div key={r.key} className="rounded-[3px] border border-[var(--color-moss)] bg-[var(--color-moss-dim)]/30 p-3.5">
                  <div className="micro-label">{r.label}</div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="font-mono text-[24px] font-bold text-[var(--color-ink)]">
                      {r.value < 0 ? '—' : r.value.toLocaleString('zh-CN')}
                    </span>
                    <span className="text-[11px] text-[var(--color-ink-faint)]">{r.unit}</span>
                  </div>
                  {r.note && <p className="mt-1.5 text-[11.5px] text-[var(--color-sand)]">{r.note}</p>}
                </div>
              ))}
            </div>
          </Panel>

          {/* 公式与依据 */}
          <Panel className="mt-4 p-5">
            <span className="micro-label">计算公式 · FORMULA</span>
            <p className="mt-2 rounded-[3px] bg-[var(--color-pit)] px-4 py-3 font-mono text-[13px] leading-relaxed text-[var(--color-sand)]">
              {active.formula}
            </p>
            <div className="mt-4 micro-label">计算依据 · BASIS</div>
            <p className="mt-2 text-[13px] leading-[1.9] text-[var(--color-ink-dim)]">{active.basis}</p>
            <p className="mt-3 text-[11.5px] text-[var(--color-ink-faint)]">
              注：所有估算均为规划参考值，实际需求因个体、环境与任务强度而异。输入范围外的数值会被截断或需要谨慎解读。
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
