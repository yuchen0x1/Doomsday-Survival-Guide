import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DANGER_LABELS, type SearchDocKind } from '@apocalypse/core';
import { Icon } from '../components/Icon';
import { PageHeader, Tag, DangerBadge, EmptyState, Panel } from '../components/ui';
import { search, searchDocuments } from '../lib/knowledge';

const KIND_LABELS: Record<SearchDocKind, { label: string; icon: string; prefix: string }> = {
  article: { label: '知识文章', icon: 'book', prefix: '/article/' },
  plant: { label: '植物', icon: 'leaf', prefix: '/plants/' },
  animal: { label: '动物', icon: 'paw', prefix: '/animals/' },
  insect: { label: '昆虫', icon: 'bug', prefix: '/insects/' },
  medicine: { label: '药物', icon: 'pill', prefix: '/medicines/' },
  first_aid: { label: '急救', icon: 'firstaid', prefix: '/first-aid/' },
  skill: { label: '技能', icon: 'hammer', prefix: '/skills/' },
  supply: { label: '物资', icon: 'box', prefix: '/supplies/' },
  scenario: { label: '模拟场景', icon: 'flame', prefix: '/simulator/' },
  hazard: { label: '危险记录', icon: 'warning', prefix: '/hazard/' },
};

/** 全局搜索：跨 10 类知识的统一检索 */
export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [kind, setKind] = useState<SearchDocKind | ''>('');
  const [submitted, setSubmitted] = useState(params.get('q') ?? '');

  useEffect(() => {
    const q = params.get('q') ?? '';
    setQuery(q);
    if (q) setSubmitted(q);
  }, [params]);

  const results = useMemo(() => {
    if (!submitted.trim()) return [];
    return search(submitted, 60, kind ? { kind } : undefined);
  }, [submitted, kind]);

  const kindCounts = useMemo(() => {
    const m = new Map<string, number>();
    results.forEach((r) => m.set(r.document.kind, (m.get(r.document.kind) ?? 0) + 1));
    return m;
  }, [results]);

  const totalDocs = searchDocuments().length;

  const doSubmit = (q: string) => {
    setSubmitted(q);
    setParams(q ? { q } : {});
  };

  return (
    <div className="fade-in">
      <PageHeader icon="search" title="全局搜索" subtitle={`知识库共 ${totalDocs} 个可检索条目 · 中英文分词 · 离线可用`} />

      <form onSubmit={(e) => { e.preventDefault(); doSubmit(query); }} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Icon name="search" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
          <input
            className="field !py-3 !pl-11 !text-[15px]" autoFocus
            placeholder="搜索：植物名 / 急救 / 净水 / 蛇咬伤 / 停电…"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary !px-5" type="submit">搜索</button>
      </form>

      {/* 类型过滤 */}
      {results.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <Tag active={!kind} onClick={() => setKind('')}>全部 <span className="font-mono opacity-60">{results.length}</span></Tag>
          {Array.from(kindCounts.entries()).map(([k, n]) => (
            <Tag key={k} active={kind === k} onClick={() => setKind(kind === (k as SearchDocKind) ? '' : (k as SearchDocKind))}>
              {KIND_LABELS[k as SearchDocKind]?.label} <span className="font-mono opacity-60">{n}</span>
            </Tag>
          ))}
        </div>
      )}

      {!submitted.trim() ? (
        <div>
          <span className="micro-label">热门检索</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {['净水', '心肺复苏', '蛇咬伤', '可食用植物', '停电', '庇护所', '失温', '绳结', '洪水', '食物保存'].map((t) => (
              <button key={t} className="btn !py-1.5 text-[12.5px]" onClick={() => { setQuery(t); doSubmit(t); }}>{t}</button>
            ))}
          </div>
          <div className="mt-6"><EmptyState icon="search" title="输入关键词开始检索" hint="支持中文与英文；索引在本地构建，断网同样可用。" /></div>
        </div>
      ) : results.length === 0 ? (
        <EmptyState icon="search" title={`没有找到与「${submitted}」匹配的内容`} hint="换个更短的关键词试试，或浏览知识图鉴按分类查找。" />
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="font-mono text-[11.5px] text-[var(--color-ink-faint)]">
            {results.length} 条结果 · 按相关度排序
          </div>
          {results.map((r) => {
            const meta = KIND_LABELS[r.document.kind];
            const href = r.document.kind === 'scenario'
              ? `/simulator/${r.document.id.replace('scenario:', '')}`
              : `${meta.prefix}${r.document.id.split(':')[1]}`;
            return (
              <Link key={r.document.id} to={href} className="panel group flex items-start gap-3 p-3.5 transition-colors hover:border-[var(--color-edge-hi)]">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] text-[var(--color-moss-hi)]">
                  <Icon name={meta.icon} size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold group-hover:text-[var(--color-sand)]">{r.document.title}</span>
                    <span className="danger-badge" style={{ color: 'var(--color-info)' }}>{meta.label}</span>
                    <DangerBadge level={r.document.dangerLevel} small />
                  </div>
                  <p className="mt-1 line-clamp-2 text-[12.5px] text-[var(--color-ink-dim)]">{r.document.subtitle}</p>
                  {r.document.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {r.document.tags.slice(0, 4).map((t) => <span key={t} className="text-[10.5px] text-[var(--color-ink-faint)]">#{t}</span>)}
                    </div>
                  )}
                </div>
                <span className="mt-1 shrink-0 font-mono text-[11px] text-[var(--color-ink-faint)]">{r.score.toFixed(2)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
