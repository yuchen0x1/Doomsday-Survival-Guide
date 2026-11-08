import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CATEGORIES, getCategory } from '@apocalypse/core';
import type { DangerLevel } from '@apocalypse/core';
import { Icon } from '../../components/Icon';
import { PageHeader, Tabs, Tag, DangerBadge, EmptyState, Panel } from '../../components/ui';
import { articles, search } from '../../lib/knowledge';

type SortKey = 'default' | 'difficulty' | 'danger';

/** 生存知识图鉴：多级分类 + 搜索 + 标签/难度/危险等级筛选 */
export default function KnowledgeList() {
  const { categorySlug } = useParams();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [maxDanger, setMaxDanger] = useState<DangerLevel | null>(null);
  const [sort, setSort] = useState<SortKey>('default');

  const activeCategory = categorySlug ? getCategory(categorySlug) : undefined;

  const filtered = useMemo(() => {
    let list = query.trim()
      ? search(query, 200, { kind: 'article' }).map((r) => articles.find((a) => `article:${a.id}` === r.document.id)).filter(Boolean)
      : activeCategory
        ? articles.filter((a) => a.categorySlug === activeCategory.slug)
        : articles;
    let out = list as typeof articles;
    if (tag) out = out.filter((a) => a.tags.includes(tag));
    if (difficulty) out = out.filter((a) => a.difficulty === difficulty);
    if (maxDanger) {
      const order: DangerLevel[] = ['L0', 'L1', 'L2', 'L3', 'L4'];
      const maxIdx = order.indexOf(maxDanger);
      out = out.filter((a) => order.indexOf(a.meta.dangerLevel) <= maxIdx);
    }
    if (sort === 'difficulty') out = [...out].sort((a, b) => a.difficulty - b.difficulty);
    if (sort === 'danger') out = [...out].sort((a, b) => order2(b.meta.dangerLevel) - order2(a.meta.dangerLevel));
    return out;
  }, [query, activeCategory, tag, difficulty, maxDanger, sort]);

  const allTags = useMemo(() => {
    const pool = activeCategory ? articles.filter((a) => a.categorySlug === activeCategory.slug) : articles;
    const set = new Set<string>();
    pool.forEach((a) => a.tags.forEach((t) => set.add(t)));
    return Array.from(set).slice(0, 24);
  }, [activeCategory]);

  return (
    <div className="fade-in">
      <PageHeader
        icon={activeCategory?.icon ?? 'book'}
        title={activeCategory?.name ?? '生存知识图鉴'}
        subtitle={activeCategory?.description ?? `${CATEGORIES.length} 个一级分类 · ${articles.length} 篇知识文章 · 全部离线可用`}
        actions={
          <div className="relative w-full sm:w-64">
            <Icon name="search" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
            <input className="field !pl-9" placeholder="在图鉴中搜索…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        }
      />

      {/* 分类导航（水平 chips） */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <Link to="/knowledge">
          <Tag active={!activeCategory}>全部 <span className="font-mono opacity-60">{articles.length}</span></Tag>
        </Link>
        {CATEGORIES.map((c) => {
          const n = articles.filter((a) => a.categorySlug === c.slug).length;
          if (n === 0) return null;
          return (
            <Link key={c.slug} to={`/knowledge/${c.slug}`}>
              <Tag active={activeCategory?.slug === c.slug}>{c.name} <span className="font-mono opacity-60">{n}</span></Tag>
            </Link>
          );
        })}
      </div>

      {/* 筛选栏 */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-panel)] px-3.5 py-2.5">
        <select className="field !w-auto !py-1.5 text-[12px]" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="default">默认排序</option>
          <option value="difficulty">按难度</option>
          <option value="danger">按危险等级</option>
        </select>
        <select className="field !w-auto !py-1.5 text-[12px]" value={difficulty ?? ''} onChange={(e) => setDifficulty(e.target.value ? Number(e.target.value) : null)}>
          <option value="">全部难度</option>
          {[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>难度 {d}</option>)}
        </select>
        <select className="field !w-auto !py-1.5 text-[12px]" value={maxDanger ?? ''} onChange={(e) => setMaxDanger((e.target.value || null) as DangerLevel | null)}>
          <option value="">全部危险等级</option>
          <option value="L0">≤ L0 普通</option>
          <option value="L1">≤ L1 注意事项</option>
          <option value="L2">≤ L2 潜在危险</option>
          <option value="L3">≤ L3 高危险</option>
          <option value="L4">全部（含 L4 致命）</option>
        </select>
        {(tag || difficulty || maxDanger || query) && (
          <button className="btn btn-ghost !py-1.5 text-[12px]" onClick={() => { setTag(null); setDifficulty(null); setMaxDanger(null); setQuery(''); }}>
            <Icon name="close" size={13} /> 清除筛选
          </button>
        )}
        <span className="ml-auto font-mono text-[11px] text-[var(--color-ink-faint)]">{filtered.length} 条结果</span>
      </div>

      {/* 标签筛选 */}
      {allTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {allTags.map((t) => (
            <Tag key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)}># {t}</Tag>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon="search" title="没有匹配的知识条目" hint="试试更换关键词或清除筛选条件。" action={<button className="btn" onClick={() => { setQuery(''); setTag(null); setDifficulty(null); setMaxDanger(null); }}>重置</button>} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <Link key={a.id} to={`/article/${a.id}`} className="panel group flex flex-col p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--color-edge-hi)]">
              <div className="flex items-center justify-between gap-2">
                <span className="micro-label flex items-center gap-1.5">
                  <Icon name={getCategory(a.categorySlug)?.icon ?? 'book'} size={12} />
                  {getCategory(a.categorySlug)?.name}
                </span>
                <DangerBadge level={a.meta.dangerLevel} small />
              </div>
              <h3 className="mt-2.5 line-clamp-2 text-[14px] font-semibold leading-snug group-hover:text-[var(--color-sand)]">{a.title}</h3>
              <p className="mt-1.5 line-clamp-2 flex-1 text-[12px] leading-relaxed text-[var(--color-ink-faint)]">{a.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[10px] text-[var(--color-ink-faint)]">难度 {'●'.repeat(a.difficulty)}{'○'.repeat(5 - a.difficulty)}</span>
                {a.tags.slice(0, 2).map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function order2(l: DangerLevel): number {
  return { L0: 0, L1: 1, L2: 2, L3: 3, L4: 4 }[l];
}
