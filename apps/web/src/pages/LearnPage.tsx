import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PageHeader, Panel, Tag, Tabs, EmptyState, Progress } from '../components/ui';
import { useApp } from '../lib/store';
import type { LearningProgress } from '@apocalypse/core';
import { quizQuestions, getQuiz, plants, animals, firstAidGuides, skills, dailyPick } from '../lib/knowledge';
import { listQuizRecords, addQuizRecord, getLearningProgress, resetWrongBook } from '../lib/db';

/** 知识学习系统：每日知识 / 练习 / 考试 / 错题本 / 进度 */
export default function LearnPage() {
  const { toast } = useApp();
  const [tab, setTab] = useState<'daily' | 'practice' | 'exam' | 'wrong'>('daily');
  const [progress, setProgress] = useState<LearningProgress>({ answered: 0, correct: 0, wrongBook: [], streakDays: 0 });
  const [session, setSession] = useState<{ ids: string[]; idx: number; chosen: number | null; revealed: boolean } | null>(null);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });

  const refresh = () => getLearningProgress().then(setProgress);
  useEffect(() => { refresh(); }, []);

  const daily = useMemo(() => dailyPick(), []);
  const accuracy = progress.answered > 0 ? Math.round((progress.correct / progress.answered) * 100) : 0;

  const startSession = (mode: 'practice' | 'exam') => {
    const pool = quizQuestions.length > 0 ? quizQuestions : [];
    if (pool.length === 0) { toast('题库尚未装载', 'warn'); return; }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const ids = (mode === 'exam' ? shuffled.slice(0, 10) : shuffled.slice(0, 8)).map((q) => q.id);
    setSession({ ids, idx: 0, chosen: null, revealed: false });
    setSessionScore({ correct: 0, total: 0 });
  };

  const answer = async (choiceIdx: number) => {
    if (!session || session.chosen !== null) return;
    const q = getQuiz(session.ids[session.idx]);
    if (!q) return;
    const correct = choiceIdx === q.answerIndex;
    await addQuizRecord({ questionId: q.id, chosenIndex: choiceIdx, correct, at: new Date().toISOString() });
    setSession({ ...session, chosen: choiceIdx, revealed: true });
    setSessionScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    refresh();
  };

  const nextQ = () => {
    if (!session) return;
    if (session.idx + 1 >= session.ids.length) {
      setSession(null);
      toast(`本轮完成：${sessionScore.correct}/${sessionScore.total}`, sessionScore.correct >= sessionScore.total * 0.7 ? 'success' : 'info');
    } else {
      setSession({ ...session, idx: session.idx + 1, chosen: null, revealed: false });
    }
  };

  const wrongQuestions = progress.wrongBook.map((id) => getQuiz(id)).filter(Boolean);
  const categories = [
    { label: '植物识别', icon: 'leaf', count: plants.length, to: '/plants' },
    { label: '动物识别', icon: 'paw', count: animals.length, to: '/animals' },
    { label: '急救知识', icon: 'firstaid', count: firstAidGuides.length, to: '/first-aid' },
    { label: '生存技能', icon: 'hammer', count: skills.length, to: '/skills' },
  ];

  /* ---------- 答题会话 ---------- */
  if (session) {
    const q = getQuiz(session.ids[session.idx]);
    if (!q) { setSession(null); return null; }
    return (
      <div className="fade-in">
        <PageHeader icon="brain" title={`答题中 · ${session.idx + 1}/${session.ids.length}`}
          subtitle={`本轮得分 ${sessionScore.correct}/${sessionScore.total}`}
          actions={<button className="btn btn-danger" onClick={() => setSession(null)}><Icon name="close" size={14} /> 退出</button>} />

        <Panel className="mx-auto max-w-2xl p-6">
          <div className="flex items-center justify-between">
            <span className="danger-badge" style={{ color: 'var(--color-info)' }}>
              {{ plant: '植物', animal: '动物', first_aid: '急救', skill: '技能' }[q.type] ?? '综合'}
            </span>
            <span className="font-mono text-[11.5px] text-[var(--color-ink-faint)]">难度 {'●'.repeat(q.difficulty)}{'○'.repeat(3 - q.difficulty)}</span>
          </div>
          <h2 className="mt-4 text-[16.5px] font-semibold leading-relaxed">{q.question}</h2>

          <div className="mt-5 flex flex-col gap-2.5">
            {q.options.map((opt, i) => {
              const isAnswer = i === q.answerIndex;
              const chosen = session.chosen === i;
              let cls = 'border-[var(--color-edge)] hover:border-[var(--color-edge-hi)]';
              if (session.revealed) {
                if (isAnswer) cls = 'border-[var(--color-moss-hi)] bg-[var(--color-moss-dim)]/40';
                else if (chosen) cls = 'border-[var(--color-danger)] bg-[var(--color-danger-dim)]/40';
                else cls = 'border-[var(--color-edge)] opacity-55';
              }
              return (
                <button key={i} disabled={session.revealed} onClick={() => answer(i)}
                  className={`panel flex items-center gap-3 px-4 py-3.5 text-left text-[14px] transition-colors ${cls}`}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-edge)] font-mono text-[11px]">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                  {session.revealed && isAnswer && <Icon name="check" size={16} className="ml-auto text-[var(--color-moss-hi)]" />}
                  {session.revealed && chosen && !isAnswer && <Icon name="close" size={16} className="ml-auto text-[var(--color-danger)]" />}
                </button>
              );
            })}
          </div>

          {session.revealed && (
            <div className="mt-5 fade-in">
              <Panel className="p-4" accent="sand">
                <span className="micro-label">解析 · EXPLANATION</span>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-dim)]">{q.explanation}</p>
                <div className="mt-3 flex items-center gap-3 text-[12px] text-[var(--color-ink-faint)]">
                  <Link to={refHref(q.sourceRefId)} className="text-[var(--color-info)] hover:underline">来源：{q.sourceTitle} →</Link>
                </div>
              </Panel>
              <div className="mt-4 flex justify-end">
                <button className="btn btn-primary" onClick={nextQ}>
                  {session.idx + 1 >= session.ids.length ? '完成本轮' : '下一题 →'}
                </button>
              </div>
            </div>
          )}
        </Panel>
      </div>
    );
  }

  /* ---------- 主界面 ---------- */
  return (
    <div className="fade-in">
      <PageHeader icon="brain" title="知识学习" subtitle={`已答 ${progress.answered} 题 · 正确率 ${accuracy}% · 连续学习 ${progress.streakDays} 天`} />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: '总题数', value: progress.answered, icon: 'list', color: 'var(--color-info)' },
          { label: '正确率', value: `${accuracy}%`, icon: 'check', color: 'var(--color-moss-hi)' },
          { label: '错题本', value: progress.wrongBook.length, icon: 'warning', color: 'var(--color-warn)' },
          { label: '连续学习', value: `${progress.streakDays}天`, icon: 'flame', color: 'var(--color-sand)' },
        ].map((x) => (
          <Panel key={x.label} className="p-3.5" accent="moss">
            <div className="flex items-center justify-between"><span className="micro-label">{x.label}</span><Icon name={x.icon} size={14} style={{ color: x.color }} /></div>
            <div className="mt-1.5 font-mono text-[24px] font-bold" style={{ color: x.color }}>{x.value}</div>
          </Panel>
        ))}
      </div>

      <Tabs active={tab} onChange={setTab} tabs={[
        { key: 'daily', label: '每日知识' }, { key: 'practice', label: '练习' },
        { key: 'exam', label: '考试' }, { key: 'wrong', label: '错题本', count: progress.wrongBook.length },
      ]} />

      <div className="mt-4">
        {tab === 'daily' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel className="p-5" accent="sand">
              <span className="micro-label">今日知识 · {new Date().toLocaleDateString('zh-CN')}</span>
              <h2 className="mt-2.5 text-[17px] font-bold">{daily.title}</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-dim)]">{daily.summary}</p>
              <Link to={`/article/${daily.id}`} className="btn btn-sand mt-4"><Icon name="book" size={14} /> 阅读全文</Link>
            </Panel>

            <Panel className="p-5">
              <span className="micro-label">识别练习 · TRAINING</span>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {categories.map((c) => (
                  <Link key={c.label} to={c.to} className="rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] p-3.5 transition-colors hover:border-[var(--color-moss-hi)]">
                    <div className="flex items-center gap-2 text-[13.5px] font-medium"><Icon name={c.icon} size={15} className="text-[var(--color-moss-hi)]" />{c.label}</div>
                    <div className="mt-1 font-mono text-[11.5px] text-[var(--color-ink-faint)]">{c.count} 条可练习</div>
                  </Link>
                ))}
              </div>
              <p className="mt-3 text-[11.5px] text-[var(--color-ink-faint)]">通过浏览图鉴后自测，或直接进入答题模式。</p>
            </Panel>

            <Panel className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <span className="micro-label">学习进度 · PROGRESS</span>
                <span className="font-mono text-[12px] text-[var(--color-ink-dim)]">{progress.answered} / {quizQuestions.length || '—'} 题</span>
              </div>
              <div className="mt-3"><Progress value={quizQuestions.length > 0 ? (progress.answered / quizQuestions.length) * 100 : 0} label="题库覆盖" /></div>
              <div className="mt-4"><Progress value={accuracy} label="正确率" /></div>
            </Panel>
          </div>
        )}

        {tab === 'practice' && (
          <Panel className="p-6 text-center">
            <Icon name="brain" size={36} className="mx-auto text-[var(--color-moss-hi)]" />
            <h2 className="mt-3 text-[16px] font-semibold">随机练习 · 8 题</h2>
            <p className="mt-1.5 text-[13px] text-[var(--color-ink-dim)]">题目均带解析与知识来源，答错自动进入错题本。</p>
            <button className="btn btn-primary mt-4" onClick={() => startSession('practice')}><Icon name="play" size={15} /> 开始练习</button>
          </Panel>
        )}

        {tab === 'exam' && (
          <Panel className="p-6 text-center" accent="sand">
            <Icon name="clipboard" size={36} className="mx-auto text-[var(--color-sand)]" />
            <h2 className="mt-3 text-[16px] font-semibold">生存知识考试 · 10 题</h2>
            <p className="mt-1.5 text-[13px] text-[var(--color-ink-dim)]">随机抽题计时作答，结束后给出得分与错题回顾。</p>
            <button className="btn btn-sand mt-4" onClick={() => startSession('exam')}><Icon name="play" size={15} /> 进入考试</button>
          </Panel>
        )}

        {tab === 'wrong' && (
          <>
            {wrongQuestions.length === 0 ? (
              <EmptyState icon="check" title="错题本是空的" hint="保持这个状态！练习中答错的题目会自动收集到这里。" />
            ) : (
              <>
                <div className="mb-3 flex justify-end">
                  <button className="btn btn-danger" onClick={async () => { await resetWrongBook(); refresh(); toast('错题本已清空', 'info'); }}>
                    <Icon name="trash" size={14} /> 清空错题本
                  </button>
                </div>
                <div className="flex flex-col gap-2.5">
                  {wrongQuestions.map((q) => q && (
                    <Panel key={q.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[14px] font-medium">{q.question}</div>
                          <div className="mt-2 text-[12.5px] text-[var(--color-moss-hi)]">正确答案：{q.options[q.answerIndex]}</div>
                          <div className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--color-ink-dim)]">{q.explanation}</div>
                        </div>
                        <Link to={refHref(q.sourceRefId)} className="shrink-0 text-[12px] text-[var(--color-info)] hover:underline">查看来源 →</Link>
                      </div>
                    </Panel>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** sourceRefId（如 "plant:xxx" / "fa:xxx"）→ 详情链接 */
function refHref(refId: string): string {
  const [kind, id] = refId.includes(':') ? refId.split(':') : ['', refId];
  switch (kind) {
    case 'plant': return `/plants/${id}`;
    case 'animal': return `/animals/${id}`;
    case 'first_aid': case 'fa': return `/first-aid/${id}`;
    case 'skill': return `/skills/${id}`;
    case 'article': return `/article/${id}`;
    default: return '/knowledge';
  }
}
