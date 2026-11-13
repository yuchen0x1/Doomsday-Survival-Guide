import { PLANT_CATEGORY_LABELS } from '@apocalypse/core';
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
import { getPlant } from '../../lib/knowledge';

/** 植物详情：识别特征 + 毒性 + 易混淆种 */
export default function PlantDetail() {
  const { id } = useParams();
  const plant = id ? getPlant(id) : undefined;
  useHistory('plant', plant?.id ?? '', plant?.name ?? '');

  if (!plant) {
    return (
      <div className="fade-in">
        <BackButton fallback="/plants" />
        <EmptyState
          icon="leaf"
          title="未找到该植物"
          action={
            <Link className="btn btn-primary" to="/plants">
              返回植物图鉴
            </Link>
          }
        />
      </div>
    );
  }

  const isDangerous =
    plant.meta.dangerLevel === 'L3' ||
    plant.meta.dangerLevel === 'L4' ||
    plant.category === 'toxic';

  const traits = [
    { label: '叶片', key: 'leaf', icon: 'leaf' },
    { label: '花朵', key: 'flower', icon: 'star' },
    { label: '果实', key: 'fruit', icon: 'box' },
    { label: '茎部', key: 'stem', icon: 'sprout' },
    { label: '根部', key: 'root', icon: 'earth' },
  ] as const;

  return (
    <div className="fade-in">
      <BackButton fallback="/plants" />
      <HazardBanner
        level={plant.meta.dangerLevel}
        text={
          isDangerous
            ? '本植物具有毒性或刺激性风险。禁止食用、禁止试尝、禁止自行药用；误食请立即携带样本就医。'
            : undefined
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[22px] font-bold">{plant.name}</h1>
                <span className="danger-badge" style={{ color: 'var(--color-moss-hi)' }}>
                  {PLANT_CATEGORY_LABELS[plant.category]}
                </span>
              </div>
              <p className="mt-1 font-mono text-[13px] italic text-[var(--color-sand)]">
                {plant.scientificName}
              </p>
              {plant.aliases.length > 0 && (
                <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-faint)]">
                  别名：{plant.aliases.join('、')}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <BookmarkButton kind="plant" refId={plant.id} title={plant.name} />
              <Link to="/plants/identify" className="btn">
                <Icon name="camera" size={14} /> 识别
              </Link>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <MetaBar meta={plant.meta} extra={<CredBadge level={plant.confidence} />} />
          </div>

          {/* 图片区（无真实图片时用特征占位图） */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {['叶', '花', '果'].map((part, i) => (
              <div
                key={part}
                className="flex aspect-[4/3] items-center justify-center rounded-[3px] border border-[var(--color-edge)] bg-gradient-to-br from-[var(--color-moss-dim)] via-[var(--color-pit)] to-[var(--color-panel)]"
              >
                <div className="text-center">
                  <span className="font-serif text-[40px] font-bold text-[var(--color-moss-hi)] opacity-60">
                    {plant.name[i === 0 ? 0 : Math.min(plant.name.length - 1, i)]}
                  </span>
                  <div className="micro-label mt-1">{part}片特征示意</div>
                </div>
              </div>
            ))}
          </div>

          {/* 识别特征 */}
          <Panel className="mt-5 p-4">
            <span className="micro-label">识别特征 · IDENTIFICATION</span>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {traits.map((t) => (
                <div
                  key={t.key}
                  className="rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] p-3"
                >
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--color-sand)]">
                    <Icon name={t.icon} size={13} /> {t.label}
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--color-ink-dim)]">
                    {plant[t.key]}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          {/* 生长信息 */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: '生长季节', value: plant.season, icon: 'clock' },
              { label: '地理分布', value: plant.distribution, icon: 'earth' },
              { label: '生长环境', value: plant.habitat, icon: 'mountain' },
            ].map((x) => (
              <Panel key={x.label} className="p-3.5">
                <div className="flex items-center gap-1.5 micro-label">
                  <Icon name={x.icon} size={12} /> {x.label}
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--color-ink-dim)]">
                  {x.value}
                </p>
              </Panel>
            ))}
          </div>

          {/* 毒性与误食风险 */}
          <div className="mt-4">
            <TipList
              tone={isDangerous ? 'danger' : 'warn'}
              title={`毒性说明${isDangerous ? ' · 危险' : ''}`}
              items={[plant.toxicity, plant.edibilityWarning]}
            />
          </div>

          {/* 可利用部分与用途 */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Panel className="p-4">
              <span className="micro-label">可利用部分</span>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {plant.usableParts.length > 0 ? (
                  plant.usableParts.map((u) => <Tag key={u}>{u}</Tag>)
                ) : (
                  <span className="text-[12px] text-[var(--color-ink-faint)]">未知</span>
                )}
              </div>
              <div className="mt-4 micro-label">已知用途</div>
              <ul className="mt-2 flex flex-col gap-1.5">
                {plant.uses.length > 0 ? (
                  plant.uses.map((u, i) => (
                    <li key={i} className="flex gap-2 text-[12.5px] text-[var(--color-ink-dim)]">
                      <span className="text-[var(--color-moss-hi)]">▸</span>
                      {u}
                    </li>
                  ))
                ) : (
                  <li className="text-[12px] text-[var(--color-ink-faint)]">
                    未知——未见可靠资料确认
                  </li>
                )}
              </ul>
            </Panel>

            <Panel className="p-4" accent="danger">
              <span className="micro-label">相似 / 易混淆植物</span>
              <div className="mt-2.5 flex flex-col gap-2">
                {plant.lookalikes.length > 0 ? (
                  plant.lookalikes.map((l) => (
                    <div
                      key={l.name}
                      className="rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] px-3 py-2.5"
                    >
                      <div className="text-[13px] font-medium text-[var(--color-warn)]">
                        {l.name}
                      </div>
                      <div className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-ink-dim)]">
                        {l.note}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] text-[var(--color-ink-faint)]">
                    暂无登记的易混淆种——识别时仍需多特征交叉确认。
                  </p>
                )}
                <p className="text-[12px] leading-relaxed text-[var(--color-ink-dim)]">
                  <span className="font-bold text-[var(--color-warn)]">混淆风险：</span>
                  {plant.confusionRisk}
                </p>
              </div>
            </Panel>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {plant.tags.map((t) => (
              <Tag key={t}># {t}</Tag>
            ))}
          </div>
        </div>

        {/* 右栏 */}
        <div className="flex flex-col gap-4">
          <div className="rounded-[3px] border border-[var(--color-warn)] bg-[var(--color-warn-dim)]/40 p-4">
            <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--color-warn)]">
              <Icon name="warning" size={15} /> 安全声明
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--color-ink-dim)]">
              任何植物在未获得专业确认前，
              <b className="text-[var(--color-danger)]">禁止食用或药用</b>。
              图片识别只能提供候选结果，无法替代专家鉴定。误食中毒请立即拨打 120 并保留样本。
            </p>
          </div>
          <SourceList meta={plant.meta} />
          <Panel className="p-4">
            <span className="micro-label">科属</span>
            <p className="mt-1.5 text-[13.5px]">{plant.family}</p>
            <div className="mt-3 micro-label">可信度</div>
            <div className="mt-1.5">
              <CredBadge level={plant.confidence} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
