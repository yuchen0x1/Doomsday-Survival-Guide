import { DANGER_LABELS, type DangerLevel } from '@apocalypse/core';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { DangerBadge, EmptyState, PageHeader, Tag } from '../../components/ui';
import { hazards, search } from '../../lib/knowledge';

/** 危险预警列表 */
export default function HazardList() {
  const [query, setQuery] = useState('');
  const [minLevel, setMinLevel] = useState<DangerLevel>('L0');

  const order: DangerLevel[] = ['L0', 'L1', 'L2', 'L3', 'L4'];

  const filtered = useMemo(() => {
    let list = query.trim()
      ? (search(query, 60, { kind: 'hazard' })
          .map((r) => hazards.find((h) => `hazard:${h.id}` === r.document.id))
          .filter(Boolean) as typeof hazards)
      : hazards;
    const minIdx = order.indexOf(minLevel);
    list = list.filter((h) => order.indexOf(h.meta.dangerLevel) >= minIdx);
    return list.sort(
      (a, b) => order.indexOf(b.meta.dangerLevel) - order.indexOf(a.meta.dangerLevel),
    );
  }, [query, minLevel]);

  return (
    <div className="fade-in">
      <PageHeader
        icon="warning"
        title="危险预警系统"
        subtitle={`${hazards.length} 条危险记录 · 统一 L0-L4 危险等级 · 等级由审核规则确定`}
        actions={
          <div className="relative w-full sm:w-56">
            <Icon
              name="search"
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
            />
            <input
              className="field !pl-9"
              placeholder="搜索危险记录…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        }
      />

      {/* 等级说明 + 筛选 */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {order.map((l) => (
          <button
            type="button"
            key={l}
            onClick={() => setMinLevel(minLevel === l ? 'L0' : l)}
            className={`panel px-3 py-2.5 text-left transition-colors ${minLevel === l ? 'border-[var(--color-sand)]' : 'hover:border-[var(--color-edge-hi)]'}`}
          >
            <div className="flex items-center justify-between">
              <span
                className="font-mono text-[15px] font-bold"
                style={{
                  color:
                    l === 'L0'
                      ? 'var(--color-info)'
                      : l === 'L1'
                        ? 'var(--color-sand)'
                        : l === 'L2'
                          ? 'var(--color-warn)'
                          : 'var(--color-danger)',
                }}
              >
                {l}
              </span>
              {minLevel === l && (
                <Icon name="check" size={13} className="text-[var(--color-sand)]" />
              )}
            </div>
            <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-dim)]">
              {DANGER_LABELS[l]}
            </div>
          </button>
        ))}
      </div>
      <div className="mb-4 text-[11.5px] text-[var(--color-ink-faint)]">
        当前筛选：显示 {DANGER_LABELS[minLevel]} 及以上等级（点击卡片切换）
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="warning" title="没有匹配的危险记录" hint="调整等级筛选或关键词。" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((h) => (
            <Link
              key={h.id}
              to={`/hazard/${h.id}`}
              className="panel group p-4 transition-all hover:-translate-y-0.5"
              style={{
                borderLeft: `3px solid ${h.meta.dangerLevel === 'L4' || h.meta.dangerLevel === 'L3' ? 'var(--color-danger)' : h.meta.dangerLevel === 'L2' ? 'var(--color-warn)' : 'var(--color-sand)'}`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14.5px] font-semibold group-hover:text-[var(--color-sand)]">
                  {h.title}
                </span>
                <DangerBadge level={h.meta.dangerLevel} small />
              </div>
              <div className="mt-1.5 micro-label">{h.category}</div>
              <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--color-ink-dim)]">
                {h.description}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1">
                {h.indicators.slice(0, 3).map((i, idx) => (
                  <Tag key={idx}>⚠ {i}</Tag>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
