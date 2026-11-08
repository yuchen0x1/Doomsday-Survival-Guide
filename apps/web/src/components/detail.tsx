import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BookmarkKind, ContentMeta } from '@apocalypse/core';
import { Icon } from './Icon';
import { Panel, DangerBadge, CredBadge, StatusBadge, Tag } from './ui';
import { useApp } from '../lib/store';

/** 打开详情页时自动写入阅读历史 */
export function useHistory(kind: BookmarkKind, refId: string, title: string) {
  const addHistory = useApp((s) => s.addHistory);
  useEffect(() => {
    if (refId && title) addHistory({ kind, refId, title });
  }, [kind, refId, title, addHistory]);
}

/** 收藏切换按钮 */
export function BookmarkButton({ kind, refId, title }: { kind: BookmarkKind; refId: string; title: string }) {
  const bookmarks = useApp((s) => s.bookmarks);
  const toggle = useApp((s) => s.toggleBookmark);
  const active = bookmarks.some((b) => b.refId === refId);
  return (
    <button
      className={`btn ${active ? 'btn-sand' : ''}`}
      onClick={() => toggle({ kind, refId, title })}
      title={active ? '取消收藏' : '加入收藏'}
    >
      <Icon name="bookmark" size={15} style={{ fill: active ? 'var(--color-sand)' : 'none' }} />
      {active ? '已收藏' : '收藏'}
    </button>
  );
}

/** 返回按钮 */
export function BackButton({ fallback = '/knowledge' }: { fallback?: string }) {
  const nav = useNavigate();
  return (
    <button className="btn btn-ghost mb-3 !px-2.5" onClick={() => nav(fallback)}>
      <Icon name="arrow-left" size={15} /> 返回
    </button>
  );
}

/** 内容元信息条：审核状态 / 可信度 / 危险等级 / 更新时间 */
export function MetaBar({ meta, extra }: { meta: ContentMeta; extra?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px]">
      <DangerBadge level={meta.dangerLevel} />
      <StatusBadge status={meta.reviewStatus} />
      {meta.sources[0] && <CredBadge level={meta.sources[0].credibility} />}
      <span className="font-mono text-[var(--color-ink-faint)]">v{meta.version}</span>
      {meta.updatedAt && <span className="font-mono text-[var(--color-ink-faint)]">更新 {meta.updatedAt.slice(0, 10)}</span>}
      {meta.aiGenerated && <Tag>AI 生成待审核</Tag>}
      {extra}
    </div>
  );
}

/** 资料来源列表 */
export function SourceList({ meta }: { meta: ContentMeta }) {
  const [open, setOpen] = useState(false);
  if (meta.sources.length === 0) return null;
  return (
    <Panel className="p-4">
      <button className="flex w-full items-center justify-between" onClick={() => setOpen((o) => !o)}>
        <span className="micro-label">资料来源 · SOURCES（{meta.sources.length}）</span>
        <Icon name={open ? 'chevron-down' : 'chevron'} size={14} className="text-[var(--color-ink-faint)]" />
      </button>
      {open && (
        <ul className="mt-3 flex flex-col gap-2.5">
          {meta.sources.map((s) => (
            <li key={s.id} className="flex items-start gap-2 text-[12.5px]">
              <Icon name="external" size={13} className="mt-0.5 shrink-0 text-[var(--color-ink-faint)]" />
              <div>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer noopener" className="text-[var(--color-info)] hover:underline">{s.name}</a>
                ) : <span>{s.name}</span>}
                <span className="ml-2 text-[11px] text-[var(--color-ink-faint)]">
                  {s.publisher} {s.publishedAt ? `· ${s.publishedAt}` : ''} · <CredBadge level={s.credibility} />
                </span>
                {s.verifiedAt && <div className="text-[10.5px] text-[var(--color-ink-faint)]">核验 {s.verifiedAt.slice(0, 10)} · {s.verifiedBy}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/** 高危警示条（L3/L4 内容顶部醒目警告） */
export function HazardBanner({ level, text }: { level: string; text?: string }) {
  if (level !== 'L3' && level !== 'L4') return null;
  return (
    <div className="mb-4 overflow-hidden rounded-[3px] border border-[var(--color-danger)]">
      <div className="hazard-stripe h-2" />
      <div className="flex items-start gap-2.5 bg-[var(--color-danger-dim)] px-4 py-3 text-[13px]">
        <Icon name="warning" size={16} className="mt-0.5 shrink-0 text-[var(--color-danger)]" />
        <div>
          <span className="font-bold text-[var(--color-danger)]">危险警告 {level}：</span>
          <span className="text-[var(--color-ink)]">
            {text ?? (level === 'L4'
              ? '本内容涉及致命风险。请在确保自身安全的前提下参考，紧急情况立即撤离并拨打 120 / 119。'
              : '本内容涉及高危险操作或场景。请严格遵循安全步骤，必要时寻求专业帮助。')}
          </span>
        </div>
      </div>
    </div>
  );
}

/** 关联知识 */
export function RelatedLinks({ items, title = '相关知识' }: { items: { id: string; title: string; href: string }[]; title?: string }) {
  if (items.length === 0) return null;
  return (
    <Panel className="p-4">
      <span className="micro-label">{title} · RELATED</span>
      <div className="mt-3 flex flex-col gap-1.5">
        {items.map((r) => (
          <a key={r.id} href={r.href} className="flex items-center gap-2 rounded-[3px] px-2 py-1.5 text-[13px] text-[var(--color-ink-dim)] hover:bg-[var(--color-riser)] hover:text-[var(--color-ink)]">
            <Icon name="chevron" size={12} className="text-[var(--color-sand)]" />
            {r.title}
          </a>
        ))}
      </div>
    </Panel>
  );
}

/** 章节正文渲染 */
export function Sections({ sections }: { sections: { heading: string; body: string }[] }) {
  return (
    <div className="flex flex-col gap-5">
      {sections.map((s, i) => (
        <section key={i}>
          <h2 className="mb-2 flex items-center gap-2 text-[15px] font-bold text-[var(--color-ink)]">
            <span className="h-3.5 w-0.5 bg-[var(--color-sand)]" />
            {s.heading}
          </h2>
          <p className="whitespace-pre-wrap text-[13.5px] leading-[1.9] text-[var(--color-ink-dim)]">{s.body}</p>
        </section>
      ))}
    </div>
  );
}

/** 编号步骤 */
export function StepList({ steps, numbered = true }: { steps: string[]; numbered?: boolean }) {
  if (steps.length === 0) return null;
  return (
    <ol className="flex flex-col gap-2.5">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3 text-[13.5px] leading-relaxed">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--color-moss)] font-mono text-[10px] text-[var(--color-moss-hi)]">
            {numbered ? i + 1 : '•'}
          </span>
          <span className="text-[var(--color-ink-dim)]">{s}</span>
        </li>
      ))}
    </ol>
  );
}

/** 提示列表（注意事项/禁忌等） */
export function TipList({ items, tone = 'warn', title }: {
  items: string[]; tone?: 'warn' | 'danger' | 'info' | 'moss'; title?: string;
}) {
  if (items.length === 0) return null;
  const color = {
    warn: 'var(--color-warn)', danger: 'var(--color-danger)',
    info: 'var(--color-info)', moss: 'var(--color-moss-hi)',
  }[tone];
  const icon = tone === 'danger' ? 'warning' : tone === 'info' ? 'info' : tone === 'moss' ? 'check' : 'warning';
  return (
    <div className="rounded-[3px] border-l-2 bg-[var(--color-pit)] px-4 py-3" style={{ borderColor: color }}>
      {title && <div className="mb-2 text-[12px] font-bold" style={{ color }}>{title}</div>}
      <ul className="flex flex-col gap-1.5">
        {items.map((x, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-[var(--color-ink-dim)]">
            <Icon name={icon} size={13} className="mt-1 shrink-0" style={{ color }} />
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
