import { SUPPLY_CATEGORY_LABELS } from '@apocalypse/core';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { EmptyState, PageHeader, Tag } from '../../components/ui';
import { search, supplies } from '../../lib/knowledge';

/** 生存物资百宝箱列表 */
export default function SupplyList() {
  const [cat, setCat] = useState('');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    supplies.forEach((s) => {
      m.set(s.category, (m.get(s.category) ?? 0) + 1);
    });
    return m;
  }, []);

  const filtered = useMemo(() => {
    let list = query.trim()
      ? (search(query, 100, { kind: 'supply' })
          .map((r) => supplies.find((s) => `supply:${s.id}` === r.document.id))
          .filter(Boolean) as typeof supplies)
      : supplies;
    if (cat) list = list.filter((s) => s.category === cat);
    return list;
  }, [cat, query]);

  return (
    <div className="fade-in">
      <PageHeader
        icon="box"
        title="生存物资百宝箱"
        subtitle={`${supplies.length} 件物资 · 用途 / 保存 / 期限 / 替代品 · 管理你的应急库存`}
        actions={
          <>
            <Link to="/inventory" className="btn btn-sand">
              <Icon name="clipboard" size={15} /> 我的物资清单
            </Link>
            <div className="relative w-full sm:w-52">
              <Icon
                name="search"
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
              />
              <input
                className="field !pl-9"
                placeholder="搜索物资…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Tag active={!cat} onClick={() => setCat('')}>
          全部 <span className="font-mono opacity-60">{supplies.length}</span>
        </Tag>
        {Object.entries(SUPPLY_CATEGORY_LABELS).map(([key, label]) => {
          const n = counts.get(key) ?? 0;
          if (n === 0) return null;
          return (
            <Tag key={key} active={cat === key} onClick={() => setCat(cat === key ? '' : key)}>
              {label} <span className="font-mono opacity-60">{n}</span>
            </Tag>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="box" title="没有匹配的物资" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s) => (
            <div key={s.id} className="panel group flex flex-col p-4">
              <div className="flex items-center justify-between">
                <span className="micro-label">{SUPPLY_CATEGORY_LABELS[s.category]}</span>
                <span
                  className="danger-badge"
                  style={{
                    color:
                      s.defaultPriority === 1
                        ? 'var(--color-danger)'
                        : s.defaultPriority === 2
                          ? 'var(--color-warn)'
                          : 'var(--color-ink-faint)',
                  }}
                >
                  P{s.defaultPriority}
                </span>
              </div>
              <Link
                to={`/supplies/${s.id}`}
                className="mt-2.5 text-[14.5px] font-semibold group-hover:text-[var(--color-sand)]"
              >
                {s.name}
              </Link>
              <p className="mt-1.5 line-clamp-2 flex-1 text-[12px] leading-relaxed text-[var(--color-ink-dim)]">
                {s.purpose}
              </p>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-[var(--color-ink-faint)]">
                <span className="flex items-center gap-1">
                  <Icon name="clock" size={11} />
                  {s.shelfLife.slice(0, 14)}
                </span>
                <span>{s.unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
