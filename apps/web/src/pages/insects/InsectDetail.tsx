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
import { CredBadge, EmptyState, Panel, Tag } from '../../components/ui';
import { getInsect } from '../../lib/knowledge';

/** 昆虫详情 */
export default function InsectDetail() {
  const { id } = useParams();
  const insect = id ? getInsect(id) : undefined;
  useHistory('insect', insect?.id ?? '', insect?.name ?? '');

  if (!insect) {
    return (
      <div className="fade-in">
        <BackButton fallback="/insects" />
        <EmptyState
          icon="bug"
          title="未找到该昆虫"
          action={
            <Link className="btn btn-primary" to="/insects">
              返回昆虫图鉴
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <BackButton fallback="/insects" />
      <HazardBanner level={insect.dangerLevel} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-[22px] font-bold">{insect.name}</h1>
              <p className="mt-1 font-mono text-[13px] italic text-[var(--color-sand)]">
                {insect.scientificName}
              </p>
              {insect.aliases.length > 0 && (
                <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-faint)]">
                  别名：{insect.aliases.join('、')}
                </p>
              )}
            </div>
            <BookmarkButton kind="insect" refId={insect.id} title={insect.name} />
          </div>

          <div className="mt-3">
            <MetaBar meta={insect.meta} extra={<CredBadge level={insect.confidence} />} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { label: '外形特征', value: insect.appearance, icon: 'eye' },
              { label: '栖息环境', value: insect.habitat, icon: 'mountain' },
              { label: '活跃季节', value: insect.season, icon: 'clock' },
              { label: '行为习惯', value: insect.behavior, icon: 'eye' },
              { label: '分布区域', value: insect.distribution, icon: 'earth' },
              { label: '用途（如有）', value: insect.uses?.join('、') ?? '无', icon: 'box' },
            ].map((f) => (
              <Panel key={f.label} className="p-3.5">
                <div className="flex items-center gap-1.5 micro-label">
                  <Icon name={f.icon} size={12} /> {f.label}
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--color-ink-dim)]">
                  {f.value}
                </p>
              </Panel>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <TipList
              title="蛰咬风险"
              items={[insect.stingBiteRisk]}
              tone={insect.dangerLevel === 'L3' || insect.dangerLevel === 'L4' ? 'danger' : 'warn'}
            />
            <TipList title="蛰咬后的应急处理" items={[insect.firstAid]} tone="moss" />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {insect.tags.map((t) => (
              <Tag key={t}># {t}</Tag>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex aspect-[4/3] items-center justify-center rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)]">
            <span className="font-serif text-[52px] font-bold text-[var(--color-moss-hi)] opacity-60">
              {insect.name.slice(0, 1)}
            </span>
          </div>
          <SourceList meta={insect.meta} />
        </div>
      </div>
    </div>
  );
}
