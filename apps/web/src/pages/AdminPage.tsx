import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import {
  CredBadge,
  DangerBadge,
  EmptyState,
  PageHeader,
  Panel,
  StatusBadge,
  Tabs,
  Tag,
} from '../components/ui';
import {
  animals,
  articles,
  datasetSummary,
  firstAidGuides,
  hazards,
  medicines,
  plants,
  scenarios,
  skills,
} from '../lib/knowledge';

type ReviewStatus = 'draft' | 'pending_review' | 'reviewed' | 'published' | 'retired';

interface Row {
  id: string;
  title: string;
  kind: string;
  status: ReviewStatus;
  danger: string;
  credibility?: string;
  aiGenerated: boolean;
  updatedAt: string;
  sources: number;
}

/**
 * 内容管理后台（只读审核视图 + 本地状态演示）：
 * 展示全部内容的审核状态机（草稿/待审核/已审核/已发布/已下架）、
 * 风险审核、AI 生成内容标记、来源完整性。
 * 完整的增删改与权限管理由 apps/api 提供（见 /admin API 文档）。
 */
export default function AdminPage() {
  const [tab, setTab] = useState<'overview' | 'review' | 'ai' | 'sources'>('overview');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | ''>('');

  const summary = useMemo(() => datasetSummary(), []);

  const allRows: Row[] = useMemo(() => {
    const rows: Row[] = [];
    const push = (
      list: {
        id: string;
        title?: string;
        name?: string;
        meta: {
          reviewStatus: ReviewStatus;
          dangerLevel: string;
          updatedAt: string;
          aiGenerated?: boolean;
          sources: { credibility: string }[];
        };
      }[],
      kind: string,
    ) => {
      for (const x of list) {
        rows.push({
          id: x.id,
          title: x.title ?? x.name ?? x.id,
          kind,
          status: x.meta.reviewStatus,
          danger: x.meta.dangerLevel,
          credibility: x.meta.sources[0]?.credibility,
          aiGenerated: !!x.meta.aiGenerated,
          updatedAt: x.meta.updatedAt.slice(0, 10),
          sources: x.meta.sources.length,
        });
      }
    };
    push(articles, '知识文章');
    push(plants, '植物');
    push(animals, '动物');
    push(firstAidGuides, '急救');
    push(skills, '技能');
    push(medicines, '药物');
    push(hazards, '危险记录');
    push(scenarios, '模拟场景');
    return rows;
  }, []);

  const filtered = statusFilter ? allRows.filter((r) => r.status === statusFilter) : allRows;
  const aiRows = allRows.filter((r) => r.aiGenerated);
  const noSource = allRows.filter((r) => r.sources === 0);
  const publishedD = allRows.filter((r) => r.status === 'published' && r.credibility === 'D');

  const statusMeta: { key: ReviewStatus | ''; label: string; color: string }[] = [
    { key: '', label: '全部', color: 'var(--color-ink)' },
    { key: 'draft', label: '草稿', color: 'var(--color-ink-faint)' },
    { key: 'pending_review', label: '待审核', color: 'var(--color-warn)' },
    { key: 'reviewed', label: '已审核', color: 'var(--color-info)' },
    { key: 'published', label: '已发布', color: 'var(--color-moss-hi)' },
    { key: 'retired', label: '已下架', color: 'var(--color-danger)' },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        icon="database"
        title="内容管理后台"
        subtitle={`${summary.total} 条内容对象 · 审核状态机 · 风险审核 · AI 内容标记 · 来源完整性检查`}
        actions={
          <span className="danger-badge" style={{ color: 'var(--color-info)' }}>
            只读视图 · 写操作见 API
          </span>
        }
      />

      {/* 审核状态统计 */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {statusMeta
          .filter((s) => s.key)
          .map((s) => (
            <button
              type="button"
              key={s.key}
              onClick={() => setStatusFilter(statusFilter === s.key ? '' : (s.key as ReviewStatus))}
              className={`panel p-3.5 text-left transition-colors ${statusFilter === s.key ? 'border-[var(--color-sand)]' : 'hover:border-[var(--color-edge-hi)]'}`}
            >
              <div className="flex items-center justify-between">
                <span className="micro-label">{s.label}</span>
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: s.color }}
                />
              </div>
              <div className="mt-1.5 font-mono text-[24px] font-bold" style={{ color: s.color }}>
                {summary.byReview[s.key as ReviewStatus] ?? 0}
              </div>
            </button>
          ))}
      </div>

      {/* 危险等级分布 */}
      <div className="mb-5 grid grid-cols-5 gap-2">
        {(['L0', 'L1', 'L2', 'L3', 'L4'] as const).map((l) => {
          const n = summary.byDanger[l] ?? 0;
          const pct = summary.total > 0 ? (n / summary.total) * 100 : 0;
          return (
            <div
              key={l}
              className="rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-panel)] p-3"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[13px] font-bold text-[var(--color-ink-dim)]">
                  {l}
                </span>
                <span className="font-mono text-[16px] font-bold">{n}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-pit)]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background:
                      l === 'L0'
                        ? 'var(--color-info)'
                        : l === 'L1'
                          ? 'var(--color-sand)'
                          : l === 'L2'
                            ? 'var(--color-warn)'
                            : 'var(--color-danger)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: 'overview', label: '内容清单', count: allRows.length },
          { key: 'review', label: '风险审核', count: noSource.length + publishedD.length },
          { key: 'ai', label: 'AI 生成内容', count: aiRows.length },
          { key: 'sources', label: '来源完整性', count: allRows.length },
        ]}
      />

      <div className="mt-4">
        {tab === 'overview' && (
          <>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {statusMeta.map((s) => (
                <Tag
                  key={s.key}
                  active={statusFilter === s.key}
                  onClick={() => setStatusFilter(s.key as ReviewStatus | '')}
                >
                  {s.label}{' '}
                  <span className="font-mono opacity-60">
                    {s.key === '' ? allRows.length : (summary.byReview[s.key as ReviewStatus] ?? 0)}
                  </span>
                </Tag>
              ))}
            </div>
            <div className="panel overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-[var(--color-edge)] bg-[var(--color-panel)] text-left">
                    {['标题', '类型', '状态', '危险等级', '可信度', '来源数', 'AI', '更新时间'].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-3.5 py-2.5 font-medium text-[var(--color-ink-dim)]"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 200).map((r) => (
                    <tr
                      key={r.kind + r.id}
                      className="border-b border-[var(--color-edge)]/60 hover:bg-[var(--color-riser)]"
                    >
                      <td className="max-w-[280px] truncate px-3.5 py-2.5">{r.title}</td>
                      <td className="px-3.5 py-2.5 text-[var(--color-ink-faint)]">{r.kind}</td>
                      <td className="px-3.5 py-2.5">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-3.5 py-2.5">
                        <DangerBadge level={r.danger as 'L0'} small />
                      </td>
                      <td className="px-3.5 py-2.5">
                        {r.credibility ? <CredBadge level={r.credibility as 'A'} /> : '—'}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono">{r.sources}</td>
                      <td className="px-3.5 py-2.5">
                        {r.aiGenerated ? <span className="text-[var(--color-warn)]">AI</span> : '—'}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-[var(--color-ink-faint)]">
                        {r.updatedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 200 && (
                <div className="px-3.5 py-2.5 text-[12px] text-[var(--color-ink-faint)]">
                  仅显示前 200 条，共 {filtered.length} 条（完整管理请使用 API 后台）
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'review' && (
          <div className="flex flex-col gap-4">
            <Panel accent="danger" className="p-4">
              <span className="micro-label" style={{ color: 'var(--color-danger)' }}>
                风险审核告警
              </span>
              <div className="mt-3 flex flex-col gap-2 text-[13px]">
                <div className="flex items-center gap-2">
                  <Icon
                    name={noSource.length > 0 ? 'warning' : 'check'}
                    size={15}
                    style={{
                      color: noSource.length > 0 ? 'var(--color-danger)' : 'var(--color-moss-hi)',
                    }}
                  />
                  无来源内容：{noSource.length} 条{' '}
                  {noSource.length > 0 &&
                    `（${noSource
                      .slice(0, 3)
                      .map((r) => r.title)
                      .join('、')}…）`}
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    name={publishedD.length > 0 ? 'warning' : 'check'}
                    size={15}
                    style={{
                      color: publishedD.length > 0 ? 'var(--color-danger)' : 'var(--color-moss-hi)',
                    }}
                  />
                  D 级可信度但已发布：{publishedD.length} 条（规则要求必须为 0）
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="check" size={15} style={{ color: 'var(--color-moss-hi)' }} />
                  AI 生成未审核即发布：{aiRows.filter((r) => r.status === 'published').length}{' '}
                  条（规则要求必须为 0）
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="check" size={15} style={{ color: 'var(--color-moss-hi)' }} />
                  L3/L4 高危内容总数：{summary.byDanger.L3 + summary.byDanger.L4}{' '}
                  条（页面均带醒目警告）
                </div>
              </div>
            </Panel>
            <Panel className="p-4">
              <span className="micro-label">审核状态机</span>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px]">
                {[
                  'draft 草稿',
                  'pending_review 待审核',
                  'reviewed 已审核',
                  'published 已发布',
                  'retired 已下架',
                ].map((s, i) => (
                  <span key={s} className="flex items-center gap-2">
                    <span className="rounded-[2px] border border-[var(--color-edge)] bg-[var(--color-pit)] px-2.5 py-1 font-mono text-[11.5px]">
                      {s}
                    </span>
                    {i < 4 && (
                      <Icon name="chevron" size={13} className="text-[var(--color-sand)]" />
                    )}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[12px] text-[var(--color-ink-faint)]">
                规则：AI 生成内容默认进入 pending_review；只有 reviewed 且来源可信度 ≥C
                的内容可发布；D 级只能保持待研究状态。
              </p>
            </Panel>
          </div>
        )}

        {tab === 'ai' &&
          (aiRows.length === 0 ? (
            <EmptyState
              icon="bot"
              title="没有 AI 生成的内容"
              hint="由 AI 起草的内容会自动标记 aiGenerated=true 并进入待审核状态，出现在这里。"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {aiRows.map((r) => (
                <Panel key={r.kind + r.id} className="flex items-center gap-3 p-3.5">
                  <span className="danger-badge" style={{ color: 'var(--color-warn)' }}>
                    AI 生成
                  </span>
                  <span className="flex-1 text-[13.5px]">{r.title}</span>
                  <StatusBadge status={r.status} />
                  <DangerBadge level={r.danger as 'L0'} small />
                </Panel>
              ))}
            </div>
          ))}

        {tab === 'sources' && (
          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                label: 'A 级权威来源',
                desc: '政府/医学/学术/NGO 机构发布',
                color: 'var(--color-moss-hi)',
              },
              { label: 'B 级可靠来源', desc: '专业出版物或多源交叉', color: 'var(--color-info)' },
              { label: 'C/D 级待核实', desc: '证据不足，仅作线索', color: 'var(--color-warn)' },
            ].map((x) => (
              <Panel key={x.label} className="p-4">
                <div
                  className="flex items-center gap-2 text-[13.5px] font-semibold"
                  style={{ color: x.color }}
                >
                  <Icon name="database" size={15} /> {x.label}
                </div>
                <p className="mt-1.5 text-[12.5px] text-[var(--color-ink-dim)]">{x.desc}</p>
                <div className="mt-3 font-mono text-[22px] font-bold">
                  {
                    allRows.filter((r) => {
                      if (x.label.includes('A ')) return r.credibility === 'A';
                      if (x.label.includes('B ')) return r.credibility === 'B';
                      return r.credibility === 'C' || r.credibility === 'D';
                    }).length
                  }
                  <span className="ml-1.5 text-[12px] font-normal text-[var(--color-ink-faint)]">
                    条
                  </span>
                </div>
              </Panel>
            ))}
            <Panel className="p-4 md:col-span-3">
              <span className="micro-label">规则约束（代码强制）</span>
              <ul className="mt-2.5 flex flex-col gap-1.5 text-[12.5px] text-[var(--color-ink-dim)]">
                <li>· AI 不得将内容标记为 A 级（validate.ts 强制拦截）</li>
                <li>· 植物食用性/毒性、动物毒性、医疗急救必须有可靠来源</li>
                <li>· 危险等级必须满足审核规则最低要求（computeRequiredDanger）</li>
                <li>· 无法确认时显示"未知"，D 级内容不得发布</li>
              </ul>
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}
