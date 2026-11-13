import { SKILL_CATEGORIES } from '@apocalypse/core';
import { Link, useParams } from 'react-router-dom';
import {
  BackButton,
  BookmarkButton,
  HazardBanner,
  MetaBar,
  RelatedLinks,
  SourceList,
  TipList,
  useHistory,
} from '../../components/detail';
import { Icon } from '../../components/Icon';
import { EmptyState, Panel, Tag } from '../../components/ui';
import { getSkill, resolveRefs } from '../../lib/knowledge';

/** 技能教程详情（15 项完整模板） */
export default function SkillDetail() {
  const { id } = useParams();
  const skill = id ? getSkill(id) : undefined;
  useHistory('skill', skill?.id ?? '', skill?.title ?? '');

  if (!skill) {
    return (
      <div className="fade-in">
        <BackButton fallback="/skills" />
        <EmptyState
          icon="hammer"
          title="未找到该教程"
          action={
            <Link className="btn btn-primary" to="/skills">
              返回技能工坊
            </Link>
          }
        />
      </div>
    );
  }

  const cat = SKILL_CATEGORIES.find((c) => c.slug === skill.categorySlug);
  const related = resolveRefs(skill.relatedIds);

  return (
    <div className="fade-in">
      <BackButton fallback="/skills" />
      <HazardBanner level={skill.dangerLevel} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 text-[12px] text-[var(--color-ink-dim)]">
            <Link to="/skills" className="hover:text-[var(--color-ink)]">
              技能工坊
            </Link>
            <Icon name="chevron" size={11} />
            <span>{cat?.name}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-[22px] font-bold leading-snug">{skill.title}</h1>
            <BookmarkButton kind="skill" refId={skill.id} title={skill.title} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <MetaBar
              meta={skill.meta}
              extra={
                <span
                  className="danger-badge"
                  style={{
                    color:
                      skill.verification === 'verified'
                        ? 'var(--color-moss-hi)'
                        : 'var(--color-warn)',
                  }}
                >
                  {skill.verification === 'verified' ? '✓ 已验证教程' : '⏳ AI 生成待审核'}
                </span>
              }
            />
          </div>

          <Panel className="mt-4 p-4">
            <p className="text-[14px] leading-[1.9] text-[var(--color-ink)]">{skill.summary}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 text-[12.5px] text-[var(--color-ink-dim)]">
              <span className="flex items-center gap-1.5">
                <Icon name="target" size={13} className="text-[var(--color-sand)]" /> 目的：
                {skill.purpose}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="clock" size={13} className="text-[var(--color-sand)]" /> 预计{' '}
                {skill.estimatedMinutes} 分钟
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="star" size={13} className="text-[var(--color-sand)]" /> 难度{' '}
                {skill.difficulty}/5
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="play" size={13} className="text-[var(--color-sand)]" />{' '}
                {skill.steps.length} 个步骤
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="micro-label mr-1">适用场景</span>
              {skill.scenarios.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          </Panel>

          {/* 材料与工具 */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Panel className="p-4">
              <span className="micro-label">材料清单</span>
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {skill.materials.length > 0 ? (
                  skill.materials.map((m, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-[var(--color-ink-dim)]">
                      <span className="text-[var(--color-moss-hi)]">□</span>
                      {m}
                    </li>
                  ))
                ) : (
                  <li className="text-[12.5px] text-[var(--color-ink-faint)]">无需额外材料</li>
                )}
              </ul>
            </Panel>
            <Panel className="p-4">
              <span className="micro-label">工具清单</span>
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {skill.tools.length > 0 ? (
                  skill.tools.map((t, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-[var(--color-ink-dim)]">
                      <span className="text-[var(--color-sand)]">▸</span>
                      {t}
                    </li>
                  ))
                ) : (
                  <li className="text-[12.5px] text-[var(--color-ink-faint)]">徒手可完成</li>
                )}
              </ul>
            </Panel>
          </div>

          {/* 操作步骤 */}
          <Panel className="mt-4 p-4">
            <span className="micro-label">操作步骤 · STEPS</span>
            <div className="mt-3.5 flex flex-col gap-3">
              {skill.steps.map((step) => (
                <div
                  key={step.index}
                  className="rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] p-3.5"
                >
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-moss)] font-mono text-[11px] font-bold text-[var(--color-moss-hi)]">
                      {step.index}
                    </span>
                    <div className="flex-1">
                      <p className="text-[13.5px] leading-relaxed text-[var(--color-ink-dim)]">
                        {step.instruction}
                      </p>
                      {step.warning && (
                        <p className="mt-2 flex gap-1.5 rounded-[2px] bg-[var(--color-warn-dim)]/40 px-2.5 py-1.5 text-[12px] text-[var(--color-warn)]">
                          <Icon name="warning" size={13} className="mt-0.5 shrink-0" />
                          {step.warning}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* 注意事项 / 失败原因 / 替代方案 */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <TipList title="操作注意事项" items={skill.cautions} tone="warn" />
            <TipList title="可能失败的原因" items={skill.failureReasons} tone="info" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <TipList title="安全检查清单" items={skill.safetyChecklist} tone="moss" />
            <TipList title="替代方案" items={skill.alternatives} tone="info" />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {skill.tags.map((t) => (
              <Tag key={t}># {t}</Tag>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex aspect-[4/3] items-center justify-center rounded-[3px] border border-[var(--color-edge)] bg-gradient-to-br from-[var(--color-moss-dim)]/60 to-[var(--color-pit)]">
            <div className="text-center">
              <Icon
                name={cat?.icon ?? 'hammer'}
                size={44}
                className="mx-auto text-[var(--color-moss-hi)] opacity-70"
              />
              <div className="micro-label mt-2">{cat?.name} 教程示意</div>
            </div>
          </div>
          <SourceList meta={skill.meta} />
          <RelatedLinks items={related} />
        </div>
      </div>
    </div>
  );
}
