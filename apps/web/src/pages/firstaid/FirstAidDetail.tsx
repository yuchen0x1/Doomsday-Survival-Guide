import { useParams } from 'react-router-dom';
import { getCategory } from '@apocalypse/core';
import { Icon } from '../../components/Icon';
import { Panel, EmptyState, Tag } from '../../components/ui';
import {
  BackButton, BookmarkButton, HazardBanner, MetaBar, RelatedLinks, SourceList,
  StepList, TipList, useHistory,
} from '../../components/detail';
import { getFirstAid, resolveRefs } from '../../lib/knowledge';

/** 急救详情：危险信号 / 正确步骤 / 错误做法 / 何时就医 */
export default function FirstAidDetail() {
  const { id } = useParams();
  const guide = id ? getFirstAid(id) : undefined;
  useHistory('first_aid', guide?.id ?? '', guide?.title ?? '');

  if (!guide) {
    return (
      <div className="fade-in">
        <BackButton fallback="/first-aid" />
        <EmptyState icon="firstaid" title="未找到该急救指南" action={<a className="btn btn-primary" href="/first-aid">返回急救百科</a>} />
      </div>
    );
  }

  const related = resolveRefs(guide.relatedIds);

  return (
    <div className="fade-in">
      <BackButton fallback="/first-aid" />
      <HazardBanner level={guide.meta.dangerLevel} text="医疗急救操作存在风险。本指南不能替代专业医疗培训与诊断；危及生命的情况立即拨打 120。" />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 text-[12px] text-[var(--color-ink-dim)]">
            <a href="/first-aid" className="hover:text-[var(--color-ink)]">急救百科</a>
            <Icon name="chevron" size={11} />
            <span>{getCategory(guide.categorySlug)?.name ?? guide.categorySlug}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-[22px] font-bold leading-snug">{guide.title}</h1>
            <div className="flex gap-2">
              <BookmarkButton kind="first_aid" refId={guide.id} title={guide.title} />
              <button className="btn" onClick={() => window.print()}><Icon name="print" size={14} /> 打印</button>
            </div>
          </div>

          <div className="mt-3"><MetaBar meta={guide.meta} /></div>

          <Panel className="mt-4 p-4">
            <p className="text-[14px] leading-[1.9] text-[var(--color-ink)]">{guide.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="micro-label mr-1">适用情况</span>
              {guide.applicable.map((a) => <Tag key={a}>{a}</Tag>)}
            </div>
          </Panel>

          {/* 危险信号（醒目） */}
          <div className="mt-4 rounded-[3px] border border-[var(--color-danger)] bg-[var(--color-danger-dim)]/30 p-4">
            <div className="mb-2.5 flex items-center gap-2 text-[13.5px] font-bold text-[var(--color-danger)]">
              <Icon name="warning" size={16} /> 危险信号（出现即刻呼叫 120）
            </div>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {guide.dangerSignals.map((s, i) => (
                <li key={i} className="flex gap-2 text-[13px] text-[var(--color-ink)]"><span className="text-[var(--color-danger)]">●</span>{s}</li>
              ))}
            </ul>
          </div>

          {/* 立即采取的安全措施 */}
          <div className="mt-4">
            <TipList title="立即采取的安全措施" items={guide.immediateSafety} tone="moss" />
          </div>

          {/* 正确急救步骤 */}
          <Panel className="mt-4 p-4">
            <span className="micro-label">正确的急救步骤 · PROCEDURE</span>
            <div className="mt-3.5"><StepList steps={guide.steps} /></div>
          </Panel>

          {/* 需要避免的错误 */}
          <div className="mt-4">
            <TipList title="需要避免的错误做法" items={guide.wrongActions} tone="danger" />
          </div>

          {/* 何时必须就医 */}
          <div className="mt-4 rounded-[3px] border-l-2 border-[var(--color-info)] bg-[var(--color-pit)] px-4 py-3">
            <div className="mb-2 flex items-center gap-2 text-[12.5px] font-bold text-[var(--color-info)]">
              <Icon name="firstaid" size={14} /> 何时必须寻求医疗帮助
            </div>
            <ul className="flex flex-col gap-1.5">
              {guide.whenToSeekHelp.map((w, i) => (
                <li key={i} className="flex gap-2 text-[13px] text-[var(--color-ink-dim)]"><span className="text-[var(--color-info)]">▸</span>{w}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">{guide.tags.map((t) => <Tag key={t}># {t}</Tag>)}</div>
        </div>

        <div className="flex flex-col gap-4">
          {/* 一键拨号 */}
          <a
            href="tel:120"
            className="flex items-center justify-center gap-2.5 rounded-[3px] border-2 border-[var(--color-danger)] bg-[var(--color-danger-dim)] px-4 py-4 text-[16px] font-bold text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)] hover:text-white"
          >
            <Icon name="firstaid" size={20} /> 拨打 120 急救
          </a>
          <SourceList meta={guide.meta} />
          <RelatedLinks items={related} />
          <Panel className="p-4">
            <span className="micro-label">最近审核</span>
            <p className="mt-2 font-mono text-[12.5px] text-[var(--color-ink-dim)]">
              {guide.meta.reviewedAt?.slice(0, 10) ?? '—'} · {guide.meta.reviewedBy ?? '—'}
            </p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">
              内容版本 v{guide.meta.version}。急救指南定期依据最新指南更新。
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
