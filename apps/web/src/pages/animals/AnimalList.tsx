import { ANIMAL_CLASS_LABELS } from '@apocalypse/core';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { CredBadge, DangerBadge, EmptyState, PageHeader, Tag } from '../../components/ui';
import { animals, search } from '../../lib/knowledge';

/** 动物图鉴列表 */
export default function AnimalList() {
  const [cls, setCls] = useState('');
  const [query, setQuery] = useState('');
  const [dangerOnly, setDangerOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = query.trim()
      ? (search(query, 100, { kind: 'animal' })
          .map((r) => animals.find((a) => `animal:${a.id}` === r.document.id))
          .filter(Boolean) as typeof animals)
      : animals;
    if (cls) list = list.filter((a) => a.animalClass === cls);
    if (dangerOnly) list = list.filter((a) => a.dangerLevel === 'L3' || a.dangerLevel === 'L4');
    return list;
  }, [cls, query, dangerOnly]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    animals.forEach((a) => {
      m.set(a.animalClass, (m.get(a.animalClass) ?? 0) + 1);
    });
    return m;
  }, []);

  return (
    <div className="fade-in">
      <PageHeader
        icon="paw"
        title="动物图鉴"
        subtitle={`${animals.length} 种动物 · 外形 / 栖息 / 足迹痕迹 / 危险等级 / 咬伤处置 · 未知物种一律按风险处理`}
        actions={
          <div className="relative w-full sm:w-56">
            <Icon
              name="search"
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
            />
            <input
              className="field !pl-9"
              placeholder="搜索名称/学名/别名…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <Tag active={!cls} onClick={() => setCls('')}>
          全部 <span className="font-mono opacity-60">{animals.length}</span>
        </Tag>
        {Object.entries(ANIMAL_CLASS_LABELS).map(([key, label]) => {
          const n = counts.get(key) ?? 0;
          if (n === 0) return null;
          return (
            <Tag key={key} active={cls === key} onClick={() => setCls(cls === key ? '' : key)}>
              {label} <span className="font-mono opacity-60">{n}</span>
            </Tag>
          );
        })}
        <span className="mx-1 h-4 w-px bg-[var(--color-edge)]" />
        <Tag active={dangerOnly} onClick={() => setDangerOnly(!dangerOnly)}>
          <Icon name="warning" size={11} /> 仅危险动物
        </Tag>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="paw" title="没有匹配的动物" hint="换个关键词或清除筛选试试。" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((a) => (
            <Link
              key={a.id}
              to={`/animals/${a.id}`}
              className="panel group flex flex-col p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--color-edge-hi)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="micro-label">{ANIMAL_CLASS_LABELS[a.animalClass]}</span>
                <DangerBadge level={a.dangerLevel} small />
              </div>
              <div className="mt-3 flex h-20 items-center justify-center rounded-[3px] border border-[var(--color-edge)] bg-gradient-to-br from-[var(--color-warn-dim)]/50 to-[var(--color-pit)]">
                <span className="font-serif text-[34px] font-bold text-[var(--color-sand)] opacity-70">
                  {a.name.slice(0, 1)}
                </span>
              </div>
              <h3 className="mt-3 text-[14.5px] font-semibold group-hover:text-[var(--color-sand)]">
                {a.name}
              </h3>
              <p className="mt-0.5 truncate font-mono text-[11px] italic text-[var(--color-ink-faint)]">
                {a.scientificName}
              </p>
              <div className="mt-2 flex-1 line-clamp-2 text-[12px] leading-relaxed text-[var(--color-ink-dim)]">
                {a.appearance}
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <CredBadge level={a.identificationConfidence} />
                <span className="text-[10.5px] text-[var(--color-ink-faint)]">
                  {a.activityTime.split('，')[0]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
