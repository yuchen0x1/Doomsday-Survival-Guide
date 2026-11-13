import { getCategory } from '@apocalypse/core';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { DangerBadge, EmptyState, PageHeader, Panel, Tag } from '../../components/ui';
import { firstAidGuides, search } from '../../lib/knowledge';

/** 急救医疗百科：紧急快捷入口 + 分类浏览 */
export default function FirstAidList() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('');

  const cats = useMemo(() => {
    const m = new Map<string, number>();
    firstAidGuides.forEach((f) => {
      m.set(f.categorySlug, (m.get(f.categorySlug) ?? 0) + 1);
    });
    return m;
  }, []);

  const filtered = useMemo(() => {
    let list = query.trim()
      ? (search(query, 80, { kind: 'first_aid' })
          .map((r) => firstAidGuides.find((f) => `first_aid:${f.id}` === r.document.id))
          .filter(Boolean) as typeof firstAidGuides)
      : firstAidGuides;
    if (cat) list = list.filter((f) => f.categorySlug === cat);
    return list;
  }, [query, cat]);

  /* 紧急快捷入口：最常需要的急救 */
  const emergencies = [
    { key: 'cpr', label: '心肺复苏', icon: 'heart', color: 'var(--color-danger)' },
    { key: 'bleeding', label: '大出血', icon: 'droplet', color: 'var(--color-danger)' },
    { key: 'burns', label: '烧烫伤', icon: 'flame', color: 'var(--color-warn)' },
    { key: 'fracture', label: '骨折', icon: 'tool', color: 'var(--color-sand)' },
    { key: 'snakebite', label: '蛇咬伤', icon: 'warning', color: 'var(--color-danger)' },
    {
      key: 'heatstroke',
      label: '中暑',
      icon: 'sun' in {} ? 'flame' : 'bolt',
      color: 'var(--color-warn)',
    },
    { key: 'hypothermia', label: '失温', icon: 'cloud', color: 'var(--color-info)' },
    { key: 'choking', label: '气道梗阻', icon: 'firstaid', color: 'var(--color-danger)' },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        icon="firstaid"
        title="急救医疗百科"
        subtitle={`${firstAidGuides.length} 篇急救指南 · 依据红十字会/AHA/WHO 指南 · 紧急情况先拨打 120`}
        actions={
          <div className="relative w-full sm:w-56">
            <Icon
              name="search"
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
            />
            <input
              className="field !pl-9"
              placeholder="搜索急救主题…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        }
      />

      {/* 紧急快捷入口 */}
      <div className="mb-5 rounded-[3px] border border-[var(--color-danger)] bg-[var(--color-panel)] p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-danger)] opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-danger)]" />
          </span>
          <span className="micro-label" style={{ color: 'var(--color-danger)' }}>
            紧急急救快捷入口 · EMERGENCY
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {emergencies.map((e) => {
            const target = firstAidGuides.find((f) => f.categorySlug === e.key);
            return (
              <Link
                key={e.key}
                to={target ? `/first-aid/${target.id}` : '/first-aid'}
                className="flex flex-col items-center gap-1.5 rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] px-2 py-3 text-center transition-colors hover:border-[var(--color-danger)]"
              >
                <Icon name={e.icon} size={19} style={{ color: e.color }} />
                <span className="text-[12px] font-medium">{e.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 分类 chips */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <Tag active={!cat} onClick={() => setCat('')}>
          全部 <span className="font-mono opacity-60">{firstAidGuides.length}</span>
        </Tag>
        {Array.from(cats.entries()).map(([slug, n]) => (
          <Tag key={slug} active={cat === slug} onClick={() => setCat(cat === slug ? '' : slug)}>
            {getCategory(slug)?.name ?? slug} <span className="font-mono opacity-60">{n}</span>
          </Tag>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="firstaid"
          title="没有匹配的急救指南"
          hint="试试「心肺复苏」「止血」等关键词。"
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((f) => (
            <Link
              key={f.id}
              to={`/first-aid/${f.id}`}
              className="panel group flex flex-col p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--color-edge-hi)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="micro-label">
                  {getCategory(f.categorySlug)?.name ?? f.categorySlug}
                </span>
                <DangerBadge level={f.meta.dangerLevel} small />
              </div>
              <h3 className="mt-2.5 text-[14.5px] font-semibold leading-snug group-hover:text-[var(--color-sand)]">
                {f.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 flex-1 text-[12px] leading-relaxed text-[var(--color-ink-dim)]">
                {f.summary}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--color-danger)]">
                <Icon name="warning" size={12} />
                {f.dangerSignals.length} 项危险信号
                <span className="ml-auto text-[var(--color-ink-faint)]">
                  {f.steps.length} 步处置
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Panel className="mt-5 p-4">
        <div className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-[var(--color-ink-dim)]">
          <Icon name="info" size={15} className="mt-0.5 shrink-0 text-[var(--color-info)]" />
          <span>
            <b className="text-[var(--color-ink)]">急救原则：</b>先确保现场环境安全 → 拨打 120 →
            在专业急救接手前实施力所能及的救护。
            本百科内容基于红十字会、美国心脏协会（AHA）、世界卫生组织（WHO）公开指南整理，不替代专业医疗培训。
          </span>
        </div>
      </Panel>
    </div>
  );
}
