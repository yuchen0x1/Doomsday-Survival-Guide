import { useParams } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { Panel, EmptyState } from '../../components/ui';
import { BackButton, BookmarkButton, HazardBanner, MetaBar, SourceList, TipList, useHistory } from '../../components/detail';
import { getHazard } from '../../lib/knowledge';

/** 危险记录详情 */
export default function HazardDetail() {
  const { id } = useParams();
  const h = id ? getHazard(id) : undefined;
  useHistory('hazard', h?.id ?? '', h?.title ?? '');

  if (!h) {
    return (
      <div className="fade-in">
        <BackButton fallback="/hazards" />
        <EmptyState icon="warning" title="未找到该危险记录" action={<a className="btn btn-primary" href="/hazards">返回危险预警</a>} />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <BackButton fallback="/hazards" />
      <HazardBanner level={h.meta.dangerLevel} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[22px] font-bold">{h.title}</h1>
              </div>
              <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">分类：{h.category}{h.region ? ` · 区域：${h.region}` : ''}</p>
            </div>
            <BookmarkButton kind="hazard" refId={h.id} title={h.title} />
          </div>

          <div className="mt-3"><MetaBar meta={h.meta} /></div>

          <Panel className="mt-4 p-4">
            <p className="text-[14px] leading-[1.9] text-[var(--color-ink-dim)]">{h.description}</p>
          </Panel>

          <div className="mt-4 rounded-[3px] border border-[var(--color-danger)] bg-[var(--color-danger-dim)]/30 p-4">
            <div className="mb-2.5 flex items-center gap-2 text-[13.5px] font-bold text-[var(--color-danger)]">
              <Icon name="eye" size={15} /> 识别征兆
            </div>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {h.indicators.map((x, i) => (
                <li key={i} className="flex gap-2 text-[13px] text-[var(--color-ink)]"><span className="text-[var(--color-danger)]">●</span>{x}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <TipList title="预防措施" items={h.prevention} tone="moss" />
            <TipList title="应急处置" items={h.emergencyResponse} tone="danger" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SourceList meta={h.meta} />
          <a href="tel:119" className="flex items-center justify-center gap-2 rounded-[3px] border-2 border-[var(--color-danger)] px-4 py-3.5 text-[15px] font-bold text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)] hover:text-white">
            <Icon name="firstaid" size={18} /> 火警 / 救援 119
          </a>
          <a href="tel:110" className="flex items-center justify-center gap-2 rounded-[3px] border border-[var(--color-edge)] px-4 py-3 text-[14px] text-[var(--color-ink-dim)] transition-colors hover:border-[var(--color-sand)] hover:text-[var(--color-ink)]">
            <Icon name="phone" size={16} /> 报警 110
          </a>
        </div>
      </div>
    </div>
  );
}
