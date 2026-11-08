import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { PageHeader, Panel, EmptyState, Tag, DangerBadge, Progress } from '../../components/ui';
import { BackButton } from '../../components/detail';
import { getScenario } from '../../lib/knowledge';
import { useApp } from '../../lib/store';

interface Score {
  step: number;
  quality: string;
  risk: string;
}

/** 灾害模拟器：互动决策 → 后果 → 下一步 → 复盘 */
export default function SimulatorPlay() {
  const { id } = useParams();
  const scenario = id ? getScenario(id) : undefined;
  const { toast } = useApp();

  const [stepIdx, setStepIdx] = useState(0);
  const [scores, setScores] = useState<Score[]>([]);
  const [chosen, setChosen] = useState<{ label: string; consequence: string; quality: string } | null>(null);
  const [finished, setFinished] = useState(false);

  const step = scenario?.steps[stepIdx];

  const summary = useMemo(() => {
    const good = scores.filter((s) => s.quality === 'good').length;
    const bad = scores.filter((s) => s.quality === 'bad').length;
    const total = scores.length;
    const grade = total === 0 ? '—' : bad === 0 && good >= total - 1 ? 'A' : bad <= 1 ? 'B' : bad <= 2 ? 'C' : 'D';
    return { good, bad, total, grade };
  }, [scores]);

  if (!scenario || !step) {
    return <div className="fade-in"><BackButton fallback="/simulator" /><EmptyState icon="flame" title="未找到该场景" /></div>;
  }

  const choose = (choice: typeof step.choices[0]) => {
    setChosen({ label: choice.label, consequence: choice.consequence, quality: choice.quality });
    setScores((s) => [...s, { step: stepIdx, quality: choice.quality, risk: choice.riskLevel }]);
  };

  const next = () => {
    const hasNext = stepIdx + 1 < scenario.steps.length;
    if (hasNext) {
      setStepIdx(stepIdx + 1);
      setChosen(null);
    } else {
      setFinished(true);
      toast('模拟完成，查看复盘', 'success');
    }
  };

  const restart = () => {
    setStepIdx(0); setScores([]); setChosen(null); setFinished(false);
  };

  /* ---------- 复盘 ---------- */
  if (finished) {
    return (
      <div className="fade-in">
        <BackButton fallback="/simulator" />
        <PageHeader icon="check" title={`复盘：${scenario.title}`} subtitle="决策质量评估与要点回顾" />

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: '总决策数', value: summary.total, color: 'var(--color-info)' },
            { label: '优质决策', value: summary.good, color: 'var(--color-moss-hi)' },
            { label: '失误决策', value: summary.bad, color: 'var(--color-danger)' },
            { label: '综合评级', value: summary.grade, color: 'var(--color-sand)' },
          ].map((x) => (
            <Panel key={x.label} className="p-3.5" accent="moss">
              <div className="micro-label">{x.label}</div>
              <div className="mt-1.5 font-mono text-[26px] font-bold" style={{ color: x.color }}>{x.value}</div>
            </Panel>
          ))}
        </div>

        <Panel className="p-5">
          <span className="micro-label">复盘要点 · DEBRIEF</span>
          <ul className="mt-3 flex flex-col gap-2.5">
            {scenario.debrief.map((d, i) => (
              <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-[var(--color-ink-dim)]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--color-sand)] font-mono text-[10px] text-[var(--color-sand)]">{i + 1}</span>
                {d}
              </li>
            ))}
          </ul>
        </Panel>

        <div className="mt-4 flex gap-2">
          <button className="btn btn-primary" onClick={restart}><Icon name="refresh" size={14} /> 重新挑战</button>
          <a className="btn" href="/simulator"><Icon name="list" size={14} /> 返回场景列表</a>
        </div>
      </div>
    );
  }

  /* ---------- 场景进行 ---------- */
  return (
    <div className="fade-in">
      <BackButton fallback="/simulator" />

      <PageHeader
        icon="flame"
        title={scenario.title}
        subtitle={`第 ${stepIdx + 1} / ${scenario.steps.length} 幕 · 选择你的行动并观察后果`}
        actions={<DangerBadge level={scenario.meta.dangerLevel} />}
      />

      <div className="mb-4">
        <Progress value={(stepIdx / scenario.steps.length) * 100} label="场景进度" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* 当前情境 */}
          <Panel className="p-5" accent="danger">
            <div className="mb-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-danger)] opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-danger)]" />
              </span>
              <span className="micro-label" style={{ color: 'var(--color-danger)' }}>当前情境 · SCENE {stepIdx + 1}</span>
            </div>
            <p className="text-[14.5px] leading-[1.95] text-[var(--color-ink)]">{step.scene}</p>
            {step.timeLimit && (
              <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-[var(--color-warn)]">
                <Icon name="clock" size={14} /> 时间限制：{step.timeLimit}
              </p>
            )}
          </Panel>

          {/* 目标 */}
          <Panel className="p-4">
            <span className="micro-label">当前目标</span>
            <p className="mt-2 text-[14px] font-medium text-[var(--color-sand)]">{step.objective}</p>
          </Panel>

          {/* 选择 */}
          <div>
            <span className="micro-label mb-2.5 block">你的选择 · DECISION</span>
            <div className="flex flex-col gap-2.5">
              {step.choices.map((c) => (
                <button key={c.id} disabled={!!chosen}
                  onClick={() => choose(c)}
                  className={`panel w-full p-4 text-left transition-all ${
                    chosen?.label === c.label ? 'border-[var(--color-sand)] bg-[var(--color-riser)]'
                      : chosen ? 'opacity-45'
                      : 'hover:border-[var(--color-moss-hi)] hover:bg-[var(--color-riser)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-edge)] font-mono text-[11px] text-[var(--color-ink-faint)]">
                      {String.fromCharCode(65 + step.choices.indexOf(c))}
                    </span>
                    <span className="text-[13.5px] leading-relaxed">{c.label}</span>
                    {chosen?.label === c.label && <Icon name="check" size={16} className="ml-auto text-[var(--color-sand)]" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 后果 */}
          {chosen && (
            <Panel className="p-5 fade-in" accent={chosen.quality === 'bad' ? 'danger' : chosen.quality === 'good' ? 'moss' : 'sand'}>
              <div className="mb-2 flex items-center gap-2">
                <span className="micro-label">决策后果 · CONSEQUENCE</span>
                <span className="danger-badge" style={{
                  color: chosen.quality === 'good' ? 'var(--color-moss-hi)' : chosen.quality === 'acceptable' ? 'var(--color-sand)' : 'var(--color-danger)',
                }}>
                  {chosen.quality === 'good' ? '✓ 优质决策' : chosen.quality === 'acceptable' ? '△ 可接受' : '✗ 危险失误'}
                </span>
              </div>
              <p className="text-[14px] leading-[1.9] text-[var(--color-ink)]">{chosen.consequence}</p>
              <div className="mt-4 flex justify-end">
                <button className="btn btn-primary" onClick={next}>
                  {stepIdx + 1 < scenario.steps.length ? '继续下一幕 →' : '查看复盘 →'}
                  <Icon name="chevron" size={14} />
                </button>
              </div>
            </Panel>
          )}
        </div>

        {/* 右栏：环境信息 */}
        <div className="flex flex-col gap-4">
          <Panel className="p-4">
            <span className="micro-label">已知危险</span>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {step.knownHazards.map((h, i) => (
                <li key={i} className="flex gap-2 text-[12.5px] text-[var(--color-ink-dim)]"><span className="text-[var(--color-danger)]">▲</span>{h}</li>
              ))}
            </ul>
          </Panel>
          <Panel className="p-4">
            <span className="micro-label">可用资源</span>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {step.availableResources.map((r, i) => (
                <li key={i} className="flex gap-2 text-[12.5px] text-[var(--color-ink-dim)]"><span className="text-[var(--color-moss-hi)]">◆</span>{r}</li>
              ))}
            </ul>
          </Panel>
          <Panel className="p-4">
            <span className="micro-label">环境 / 人员</span>
            <div className="mt-2.5 flex flex-col gap-2 text-[12.5px] text-[var(--color-ink-dim)]">
              <div><b className="text-[var(--color-ink)]">环境：</b>{step.environment.join('、')}</div>
              <div><b className="text-[var(--color-ink)]">人员：</b>{step.partyStatus}</div>
            </div>
          </Panel>
          {!chosen && (
            <Panel className="p-4">
              <span className="micro-label">推荐方向（提示）</span>
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {step.recommended.map((r, i) => <li key={i} className="text-[12.5px] text-[var(--color-moss-hi)]">✓ {r}</li>)}
              </ul>
            </Panel>
          )}
          <div className="flex flex-wrap gap-1.5">
            {scenario.tags.map((t) => <Tag key={t}>{t}</Tag>)}
          </div>
        </div>
      </div>
    </div>
  );
}
