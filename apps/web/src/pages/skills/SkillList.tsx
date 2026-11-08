import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SKILL_CATEGORIES } from '@apocalypse/core';
import { Icon } from '../../components/Icon';
import { PageHeader, Tag, DangerBadge, EmptyState } from '../../components/ui';
import { skills, search } from '../../lib/knowledge';

/** 生存技能与制作工坊列表 */
export default function SkillList() {
  const [cat, setCat] = useState('');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    skills.forEach((s) => m.set(s.categorySlug, (m.get(s.categorySlug) ?? 0) + 1));
    return m;
  }, []);

  const filtered = useMemo(() => {
    let list = query.trim()
      ? search(query, 80, { kind: 'skill' }).map((r) => skills.find((s) => `skill:${s.id}` === r.document.id)).filter(Boolean) as typeof skills
      : skills;
    if (cat) list = list.filter((s) => s.categorySlug === cat);
    return list;
  }, [cat, query]);

  return (
    <div className="fade-in">
      <PageHeader
        icon="hammer"
        title="生存技能与制作工坊"
        subtitle={`${skills.length} 个分步教程 · 材料 / 工具 / 难度 / 失败原因 / 安全检查 · 高危操作仅提供安全指引`}
        actions={
          <div className="relative w-full sm:w-56">
            <Icon name="search" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
            <input className="field !pl-9" placeholder="搜索教程…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Tag active={!cat} onClick={() => setCat('')}>全部 <span className="font-mono opacity-60">{skills.length}</span></Tag>
        {SKILL_CATEGORIES.map((c) => {
          const n = counts.get(c.slug) ?? 0;
          if (n === 0) return null;
          return <Tag key={c.slug} active={cat === c.slug} onClick={() => setCat(cat === c.slug ? '' : c.slug)}>{c.name} <span className="font-mono opacity-60">{n}</span></Tag>;
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="hammer" title="没有匹配的教程" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <Link key={s.id} to={`/skills/${s.id}`} className="panel group flex flex-col p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--color-edge-hi)]">
              <div className="flex items-center justify-between gap-2">
                <span className="micro-label">{SKILL_CATEGORIES.find((c) => c.slug === s.categorySlug)?.name ?? s.categorySlug}</span>
                <DangerBadge level={s.dangerLevel} small />
              </div>
              <h3 className="mt-2.5 text-[14.5px] font-semibold leading-snug group-hover:text-[var(--color-sand)]">{s.title}</h3>
              <p className="mt-1.5 line-clamp-2 flex-1 text-[12px] leading-relaxed text-[var(--color-ink-dim)]">{s.summary}</p>
              <div className="mt-3 flex items-center gap-2.5 text-[11px] text-[var(--color-ink-faint)]">
                <span>难度 {'●'.repeat(s.difficulty)}{'○'.repeat(5 - s.difficulty)}</span>
                <span className="flex items-center gap-1"><Icon name="clock" size={11} />{s.estimatedMinutes}min</span>
                <span className="flex items-center gap-1"><Icon name="list" size={11} />{s.steps.length}步</span>
                {s.verification === 'verified' ? (
                  <span className="ml-auto flex items-center gap-1 text-[var(--color-moss-hi)]"><Icon name="check" size={11} />已验证</span>
                ) : (
                  <span className="ml-auto flex items-center gap-1 text-[var(--color-warn)]"><Icon name="clock" size={11} />待审核</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
