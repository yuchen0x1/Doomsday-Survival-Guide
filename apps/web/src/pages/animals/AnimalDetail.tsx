import { ANIMAL_CLASS_LABELS } from '@apocalypse/core';
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
import { getAnimal, getAnimalTracks } from '../../lib/knowledge';

/** 动物详情：识别特征 + 足迹痕迹 + 安全措施 + 咬伤处置 */
export default function AnimalDetail() {
  const { id } = useParams();
  const animal = id ? getAnimal(id) : undefined;
  useHistory('animal', animal?.id ?? '', animal?.name ?? '');

  if (!animal) {
    return (
      <div className="fade-in">
        <BackButton fallback="/animals" />
        <EmptyState
          icon="paw"
          title="未找到该动物"
          action={
            <Link className="btn btn-primary" to="/animals">
              返回动物图鉴
            </Link>
          }
        />
      </div>
    );
  }

  const tracks = getAnimalTracks(animal.id);
  const dangerous = animal.dangerLevel === 'L3' || animal.dangerLevel === 'L4';

  const facts = [
    { label: '栖息环境', value: animal.habitat, icon: 'mountain' },
    { label: '活动时间', value: animal.activityTime, icon: 'clock' },
    { label: '行为习惯', value: animal.behavior, icon: 'eye' },
    { label: '食性', value: animal.diet, icon: 'leaf' },
    { label: '分布区域', value: animal.distribution, icon: 'earth' },
    { label: '粪便等痕迹', value: animal.feces, icon: 'search' },
  ];

  return (
    <div className="fade-in">
      <BackButton fallback="/animals" />
      <HazardBanner
        level={animal.dangerLevel}
        text={
          dangerous
            ? `该动物被评估为 ${animal.dangerLevel} 级风险：${animal.possibleInjury} 遇见时请保持距离并参照安全措施。`
            : undefined
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[22px] font-bold">{animal.name}</h1>
                <span className="danger-badge" style={{ color: 'var(--color-sand)' }}>
                  {ANIMAL_CLASS_LABELS[animal.animalClass]}
                </span>
              </div>
              <p className="mt-1 font-mono text-[13px] italic text-[var(--color-sand)]">
                {animal.scientificName}
              </p>
              {animal.aliases.length > 0 && (
                <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-faint)]">
                  别名：{animal.aliases.join('、')}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <BookmarkButton kind="animal" refId={animal.id} title={animal.name} />
              <button
                type="button"
                className="btn"
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
              >
                <Icon name="copy" size={14} />
              </button>
            </div>
          </div>

          <div className="mt-3">
            <MetaBar
              meta={animal.meta}
              extra={<CredBadge level={animal.identificationConfidence} />}
            />
          </div>

          {/* 识别说明（区分模型推测与核实资料） */}
          {animal.identificationNote && (
            <div className="mt-3 rounded-[3px] border border-[var(--color-info)] bg-[var(--color-info)]/10 px-4 py-2.5 text-[12.5px] text-[var(--color-ink-dim)]">
              <span className="font-bold text-[var(--color-info)]">识别说明：</span>
              {animal.identificationNote}
            </div>
          )}

          <Panel className="mt-4 p-4">
            <span className="micro-label">外形特征 · APPEARANCE</span>
            <p className="mt-2.5 text-[13.5px] leading-[1.9] text-[var(--color-ink-dim)]">
              {animal.appearance}
            </p>
          </Panel>

          {/* 基本信息网格 */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {facts.map((f) => (
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

          {/* 足迹与痕迹 */}
          <Panel className="mt-4 p-4" accent="sand">
            <span className="micro-label">足迹与痕迹识别 · TRACKS</span>
            <div className="mt-2.5 flex flex-col gap-2">
              {animal.tracks.length > 0 || tracks.length > 0 ? (
                <>
                  {animal.tracks.map((t, i) => (
                    <div
                      key={i}
                      className="flex gap-2.5 rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] px-3 py-2.5 text-[13px] text-[var(--color-ink-dim)]"
                    >
                      <Icon
                        name="navigation"
                        size={14}
                        className="mt-0.5 shrink-0 text-[var(--color-sand)]"
                      />
                      {t}
                    </div>
                  ))}
                  {tracks.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] px-3 py-2.5"
                    >
                      <div className="text-[13px] text-[var(--color-ink-dim)]">{t.description}</div>
                      <div className="mt-1 font-mono text-[11px] text-[var(--color-ink-faint)]">
                        尺寸 {t.size}
                        {t.gait ? ` · 步态 ${t.gait}` : ''}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-[12.5px] text-[var(--color-ink-faint)]">暂无登记的足迹记录。</p>
              )}
            </div>
          </Panel>

          {/* 安全措施与咬伤处置 */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <TipList title="遇见时的安全措施" items={[animal.safetyMeasures]} tone="moss" />
            <TipList
              title="被咬伤 / 蛰伤后的应急处理"
              items={[animal.biteFirstAid]}
              tone={dangerous ? 'danger' : 'warn'}
            />
          </div>

          <Panel className="mt-4 p-4" accent="danger">
            <span className="micro-label">可能造成的伤害</span>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-dim)]">
              {animal.possibleInjury}
            </p>
            <p className="mt-3 text-[12px] leading-relaxed text-[var(--color-warn)]">
              ⚠
              对未知或无法确认的动物，一律按具有风险处理：不接触、不驱赶、不投喂、不判断"无毒无害"。
            </p>
          </Panel>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {animal.tags.map((t) => (
              <Tag key={t}># {t}</Tag>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex aspect-[4/3] items-center justify-center rounded-[3px] border border-[var(--color-edge)] bg-gradient-to-br from-[var(--color-warn-dim)]/40 to-[var(--color-pit)]">
            <div className="text-center">
              <span className="font-serif text-[56px] font-bold text-[var(--color-sand)] opacity-60">
                {animal.name.slice(0, 1)}
              </span>
              <div className="micro-label mt-1">外形示意（待补充实拍图）</div>
            </div>
          </div>
          <SourceList meta={animal.meta} />
          <Panel className="p-4">
            <span className="micro-label">危险等级</span>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="font-mono text-[26px] font-bold"
                style={{ color: dangerous ? 'var(--color-danger)' : 'var(--color-sand)' }}
              >
                {animal.dangerLevel}
              </span>
              <span className="text-[13px] text-[var(--color-ink-dim)]">
                {animal.dangerLevel === 'L4'
                  ? '致命风险'
                  : animal.dangerLevel === 'L3'
                    ? '高危险'
                    : animal.dangerLevel === 'L2'
                      ? '潜在危险'
                      : '低风险'}
              </span>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
