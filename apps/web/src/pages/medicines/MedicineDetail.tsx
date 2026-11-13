import { Link, useParams } from 'react-router-dom';
import {
  BackButton,
  BookmarkButton,
  HazardBanner,
  MetaBar,
  SourceList,
  TipList,
  useHistory,
} from '../../components/detail';
import { Icon } from '../../components/Icon';
import { EmptyState, Panel, Tag } from '../../components/ui';
import { getMedicine } from '../../lib/knowledge';

/** 药物详情（含免责声明） */
export default function MedicineDetail() {
  const { id } = useParams();
  const med = id ? getMedicine(id) : undefined;
  useHistory('medicine', med?.id ?? '', med?.name ?? '');

  if (!med) {
    return (
      <div className="fade-in">
        <BackButton fallback="/medicines" />
        <EmptyState
          icon="pill"
          title="未找到该药物"
          action={
            <Link className="btn btn-primary" to="/medicines">
              返回药物图鉴
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <BackButton fallback="/medicines" />
      <HazardBanner
        level={med.meta.dangerLevel}
        text="本条目为药物知识介绍。使用任何药物前请阅读说明书并咨询医师或药师，紧急情况立即就医。"
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-[22px] font-bold">{med.name}</h1>
              {med.aliases.length > 0 && (
                <p className="mt-1 text-[12.5px] text-[var(--color-ink-faint)]">
                  别名：{med.aliases.join('、')}
                </p>
              )}
            </div>
            <BookmarkButton kind="medicine" refId={med.id} title={med.name} />
          </div>

          <div className="mt-3">
            <MetaBar meta={med.meta} />
          </div>

          <Panel className="mt-4 p-4">
            <span className="micro-label">用途说明</span>
            <p className="mt-2 text-[13.5px] leading-[1.9] text-[var(--color-ink-dim)]">
              {med.purpose}
            </p>
          </Panel>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Panel className="p-4">
              <span className="micro-label">常见剂型</span>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {med.commonForms.map((f) => (
                  <Tag key={f}>{f}</Tag>
                ))}
              </div>
            </Panel>
            <Panel className="p-4">
              <span className="micro-label">储存方法</span>
              <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--color-ink-dim)]">
                {med.storage}
              </p>
            </Panel>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <TipList title="关键要点" items={med.keyPoints} tone="info" />
            <TipList title="风险与副作用" items={med.risks} tone="warn" />
          </div>

          <div className="mt-4">
            <TipList title="禁忌事项" items={med.contraindications} tone="danger" />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {med.tags.map((t) => (
              <Tag key={t}># {t}</Tag>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[3px] border border-[var(--color-danger)] bg-[var(--color-danger-dim)]/40 p-4">
            <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--color-danger)]">
              <Icon name="warning" size={15} /> 免责声明
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--color-ink-dim)]">
              {med.disclaimer}
            </p>
          </div>
          <SourceList meta={med.meta} />
        </div>
      </div>
    </div>
  );
}
