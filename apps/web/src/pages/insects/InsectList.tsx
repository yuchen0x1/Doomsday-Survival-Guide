import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { DangerBadge, EmptyState, PageHeader, Tag } from '../../components/ui';
import { insects, search } from '../../lib/knowledge';

/** 昆虫图鉴列表 */
export default function InsectList() {
  const [query, setQuery] = useState('');
  const [dangerOnly, setDangerOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = query.trim()
      ? (search(query, 80, { kind: 'insect' })
          .map((r) => insects.find((i) => `insect:${i.id}` === r.document.id))
          .filter(Boolean) as typeof insects)
      : insects;
    if (dangerOnly)
      list = list.filter(
        (i) => i.dangerLevel === 'L2' || i.dangerLevel === 'L3' || i.dangerLevel === 'L4',
      );
    return list;
  }, [query, dangerOnly]);

  return (
    <div className="fade-in">
      <PageHeader
        icon="bug"
        title="昆虫图鉴"
        subtitle={`${insects.length} 种昆虫与节肢动物 · 蛰咬风险 · 应急处置 · 防范要点`}
        actions={
          <>
            <Tag active={dangerOnly} onClick={() => setDangerOnly(!dangerOnly)}>
              <Icon name="warning" size={11} /> 仅危险种
            </Tag>
            <div className="relative w-full sm:w-52">
              <Icon
                name="search"
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
              />
              <input
                className="field !pl-9"
                placeholder="搜索昆虫…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState icon="bug" title="没有匹配的昆虫" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((i) => (
            <Link
              key={i.id}
              to={`/insects/${i.id}`}
              className="panel group flex flex-col p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--color-edge-hi)]"
            >
              <div className="flex items-center justify-between">
                <span className="micro-label">昆虫 · INSECT</span>
                <DangerBadge level={i.dangerLevel} small />
              </div>
              <div className="mt-3 flex h-16 items-center justify-center rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)]">
                <span className="font-serif text-[28px] font-bold text-[var(--color-moss-hi)] opacity-70">
                  {i.name.slice(0, 1)}
                </span>
              </div>
              <h3 className="mt-2.5 text-[14px] font-semibold group-hover:text-[var(--color-sand)]">
                {i.name}
              </h3>
              <p className="mt-0.5 truncate font-mono text-[11px] italic text-[var(--color-ink-faint)]">
                {i.scientificName}
              </p>
              <p className="mt-2 line-clamp-2 flex-1 text-[12px] leading-relaxed text-[var(--color-ink-dim)]">
                {i.stingBiteRisk}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
