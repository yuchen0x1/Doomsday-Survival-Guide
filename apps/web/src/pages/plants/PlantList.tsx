import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PLANT_CATEGORY_LABELS } from '@apocalypse/core';
import { Icon } from '../../components/Icon';
import { PageHeader, Tag, DangerBadge, EmptyState, CredBadge } from '../../components/ui';
import { plants, search } from '../../lib/knowledge';

/** 植物图鉴列表：分类 + 搜索 + 危险筛选 */
export default function PlantList() {
  const [cat, setCat] = useState<string>('');
  const [query, setQuery] = useState('');
  const [toxicOnly, setToxicOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = query.trim()
      ? search(query, 100, { kind: 'plant' }).map((r) => plants.find((p) => `plant:${p.id}` === r.document.id)).filter(Boolean) as typeof plants
      : plants;
    if (cat) list = list.filter((p) => p.category === cat);
    if (toxicOnly) list = list.filter((p) => p.category === 'toxic' || p.category === 'irritant' || p.meta.dangerLevel === 'L3' || p.meta.dangerLevel === 'L4');
    return list;
  }, [cat, query, toxicOnly]);

  const cats = useMemo(() => {
    const counts = new Map<string, number>();
    plants.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    return counts;
  }, []);

  return (
    <div className="fade-in">
      <PageHeader
        icon="leaf"
        title="植物图鉴"
        subtitle={`${plants.length} 种植物 · 可食用 / 药用 / 有毒 / 纤维 / 材料 · 禁止仅凭图片判断可食`}
        actions={
          <>
            <Link to="/plants/identify" className="btn btn-primary"><Icon name="camera" size={15} /> 拍照识别</Link>
            <div className="relative w-full sm:w-56">
              <Icon name="search" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
              <input className="field !pl-9" placeholder="搜索名称/学名/别名…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <Tag active={!cat} onClick={() => setCat('')}>全部 <span className="font-mono opacity-60">{plants.length}</span></Tag>
        {Object.entries(PLANT_CATEGORY_LABELS).map(([key, label]) => (
          <Tag key={key} active={cat === key} onClick={() => setCat(cat === key ? '' : key)}>
            {label} <span className="font-mono opacity-60">{cats.get(key) ?? 0}</span>
          </Tag>
        ))}
        <span className="mx-1 h-4 w-px bg-[var(--color-edge)]" />
        <Tag active={toxicOnly} onClick={() => setToxicOnly(!toxicOnly)}>
          <Icon name="warning" size={11} /> 仅显示危险种
        </Tag>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="leaf" title="没有匹配的植物" hint="换个关键词试试，或清除筛选条件。" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <Link key={p.id} to={`/plants/${p.id}`} className="panel group flex flex-col p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--color-edge-hi)]">
              <div className="flex items-center justify-between gap-2">
                <span className="micro-label">{PLANT_CATEGORY_LABELS[p.category]}</span>
                <DangerBadge level={p.meta.dangerLevel} small />
              </div>
              {/* 无图片时用首字生成视觉占位 */}
              <div className="mt-3 flex h-20 items-center justify-center rounded-[3px] border border-[var(--color-edge)] bg-gradient-to-br from-[var(--color-moss-dim)] to-[var(--color-pit)]">
                <span className="font-serif text-[34px] font-bold text-[var(--color-moss-hi)] opacity-70">{p.name.slice(0, 1)}</span>
              </div>
              <h3 className="mt-3 text-[14.5px] font-semibold group-hover:text-[var(--color-sand)]">{p.name}</h3>
              <p className="mt-0.5 truncate font-mono text-[11px] italic text-[var(--color-ink-faint)]">{p.scientificName}</p>
              <div className="mt-2 flex-1 line-clamp-2 text-[12px] leading-relaxed text-[var(--color-ink-dim)]">{p.toxicity}</div>
              <div className="mt-2.5 flex items-center justify-between">
                <CredBadge level={p.confidence} />
                {p.aliases.length > 0 && <span className="truncate text-[10.5px] text-[var(--color-ink-faint)]">{p.aliases[0]}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
