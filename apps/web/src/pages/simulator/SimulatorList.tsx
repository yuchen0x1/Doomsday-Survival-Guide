import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { PageHeader, DangerBadge, EmptyState, Tag } from '../../components/ui';
import { scenarios } from '../../lib/knowledge';

/** 末日灾害模拟器场景列表（全部为学习模拟） */
export default function SimulatorList() {
  return (
    <div className="fade-in">
      <PageHeader
        icon="flame"
        title="末日灾害模拟器"
        subtitle={`${scenarios.length} 个互动情境 · 决策 → 后果 → 复盘 · 仅用于学习训练，非真实预测`}
      />

      <div className="mb-5 rounded-[3px] border border-[var(--color-info)] bg-[var(--color-info)]/10 px-4 py-3 text-[12.5px] leading-relaxed text-[var(--color-ink-dim)]">
        <Icon name="info" size={14} className="mr-1.5 inline text-[var(--color-info)]" />
        <b className="text-[var(--color-info)]">模拟声明：</b>
        所有场景均为虚构的学习情境，用于训练应急决策思维。情境中的"预测后果"是教学设计，不代表对真实事件的预测。
        真实灾害请遵循政府应急部门与专业机构指引。
      </div>

      {scenarios.length === 0 ? (
        <EmptyState icon="flame" title="场景数据加载中" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map((s, i) => (
            <Link key={s.id} to={`/simulator/${s.id}`} className="panel group flex flex-col p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--color-edge-hi)]">
              <div className="flex items-center justify-between">
                <span className="micro-label">场景 {String(i + 1).padStart(2, '0')} · SIMULATION</span>
                <DangerBadge level={s.meta.dangerLevel} small />
              </div>
              <div className="mt-3 flex h-16 items-center justify-center rounded-[3px] border border-[var(--color-edge)] bg-gradient-to-br from-[var(--color-danger-dim)]/40 to-[var(--color-pit)]">
                <Icon name="flame" size={26} className="text-[var(--color-danger)] opacity-70" />
              </div>
              <h3 className="mt-3 text-[15px] font-semibold group-hover:text-[var(--color-sand)]">{s.title}</h3>
              <p className="mt-1.5 line-clamp-2 flex-1 text-[12.5px] leading-relaxed text-[var(--color-ink-dim)]">{s.summary}</p>
              <div className="mt-3 flex items-center gap-3 text-[11px] text-[var(--color-ink-faint)]">
                <span>难度 {'●'.repeat(s.difficulty)}{'○'.repeat(5 - s.difficulty)}</span>
                <span className="flex items-center gap-1"><Icon name="list" size={11} />{s.steps.length} 幕</span>
                <span className="ml-auto text-[var(--color-warn)]">模拟</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">{s.tags.slice(0, 3).map((t) => <Tag key={t}>{t}</Tag>)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
