import { CATEGORIES } from '@apocalypse/core';
import { getDataset } from '@apocalypse/knowledge-data';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { DangerBadge, EmptyState, PageHeader, Panel, StatCard, Tag } from '../components/ui';
import {
  articles,
  dailyPick,
  getCategory,
  getHomeCounts,
  hazards,
  resolveRef,
} from '../lib/knowledge';
import { loadPackageStates } from '../lib/offline';
import { useApp } from '../lib/store';

/** 首页：末日生存指挥中心 */
export default function Home() {
  const nav = useNavigate();
  const bookmarks = useApp((s) => s.bookmarks);
  const history = useApp((s) => s.history);
  const online = useApp((s) => s.online);
  const counts = useMemo(() => getHomeCounts(), []);
  const [offlineCount, setOfflineCount] = useState(1);
  const [query, setQuery] = useState('');

  const daily = useMemo(() => dailyPick(), []);
  const dangerAlerts = useMemo(
    () =>
      hazards.filter((h) => h.meta.dangerLevel === 'L4' || h.meta.dangerLevel === 'L3').slice(0, 4),
    [],
  );

  useEffect(() => {
    loadPackageStates().then((pkgs) =>
      setOfflineCount(pkgs.filter((p) => p.status === 'downloaded').length),
    );
  }, []);

  const recent = history.slice(0, 6);
  const featured = useMemo(() => {
    const pool = articles.filter(
      (a) => a.meta.dangerLevel !== 'L4' && a.meta.reviewStatus !== 'retired',
    );
    return pool.slice(0, 3);
  }, []);

  const quickEntries = [
    {
      to: '/first-aid',
      icon: 'firstaid',
      label: '紧急急救',
      desc: '创伤·心肺复苏·烧伤',
      color: 'var(--color-danger)',
    },
    {
      to: '/plants/identify',
      icon: 'camera',
      label: '植物识别',
      desc: '拍照识别候选物种',
      color: 'var(--color-moss-hi)',
    },
    {
      to: '/animals',
      icon: 'paw',
      label: '动物识别',
      desc: '外形·足迹·危险等级',
      color: 'var(--color-sand)',
    },
    {
      to: '/skills',
      icon: 'hammer',
      label: '生存技能',
      desc: '庇护所·净水·绳结',
      color: 'var(--color-info)',
    },
    {
      to: '/inventory',
      icon: 'clipboard',
      label: '物资管理',
      desc: '库存·有效期·缺货提醒',
      color: 'var(--color-moss-hi)',
    },
    {
      to: '/calculators',
      icon: 'calculator',
      label: '生存计算器',
      desc: '饮水·食物·能源估算',
      color: 'var(--color-sand)',
    },
    {
      to: '/simulator',
      icon: 'flame',
      label: '灾害模拟',
      desc: '12 个互动情境推演',
      color: 'var(--color-warn)',
    },
    {
      to: '/offline',
      icon: 'download',
      label: '离线模式',
      desc: '断网也能查知识',
      color: 'var(--color-info)',
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        icon="home"
        title="末日生存指挥中心"
        subtitle={`APOCALYPSE SURVIVAL · 知识储备 ${counts.articles + counts.plants + counts.animals + counts.firstAid + counts.skills} 条 · ${online ? '网络在线' : '离线生存模式已激活'}`}
        actions={
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) nav(`/search?q=${encodeURIComponent(query.trim())}`);
            }}
            className="relative w-full sm:w-72"
          >
            <Icon
              name="search"
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
            />
            <input
              className="field !pl-9"
              placeholder="全局搜索知识库…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
        }
      />

      {/* 真实数据统计卡片 */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="知识文章"
          value={counts.articles}
          unit="篇"
          icon="book"
          hint="19 个一级分类"
        />
        <StatCard
          label="植物图鉴"
          value={counts.plants}
          unit="种"
          icon="leaf"
          accent="sand"
          hint="含毒性与易混淆种"
        />
        <StatCard
          label="动物图鉴"
          value={counts.animals}
          unit="种"
          icon="paw"
          accent="sand"
          hint="含昆虫节肢动物"
        />
        <StatCard
          label="生存技能"
          value={counts.skills}
          unit="个"
          icon="hammer"
          hint="分步图文教程"
        />
        <StatCard
          label="离线知识包"
          value={offlineCount}
          unit="包"
          icon="download"
          accent="info"
          hint="断网可用"
        />
        <StatCard
          label="我的收藏"
          value={bookmarks.length}
          unit="条"
          icon="bookmark"
          accent="danger"
          hint="本地加密保存"
        />
      </div>

      {/* 快捷入口 */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickEntries.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="panel group cursor-pointer p-3.5 transition-all hover:-translate-y-0.5 hover:border-[var(--color-edge-hi)]"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)]"
              style={{ color: q.color }}
            >
              <Icon name={q.icon} size={18} />
            </span>
            <div className="mt-2.5 text-[13.5px] font-semibold group-hover:text-[var(--color-sand)]">
              {q.label}
            </div>
            <div className="mt-0.5 text-[11px] text-[var(--color-ink-faint)]">{q.desc}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 左：今日知识 + 推荐 */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Panel accent="sand" className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="micro-label">今日生存知识 · DAILY BRIEFING</span>
              <Link
                to={`/article/${daily.id}`}
                className="text-[11px] text-[var(--color-sand)] hover:underline"
              >
                阅读全文 →
              </Link>
            </div>
            <h2 className="text-[16px] font-bold">{daily.title}</h2>
            <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-[var(--color-ink-dim)]">
              {daily.summary}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <DangerBadge level={daily.meta.dangerLevel} />
              {daily.tags.slice(0, 4).map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </Panel>

          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="micro-label">推荐知识 · RECOMMENDED</h2>
              <Link
                to="/knowledge"
                className="text-[11px] text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]"
              >
                全部图鉴 →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {featured.map((a) => (
                <Link
                  key={a.id}
                  to={`/article/${a.id}`}
                  className="panel p-3.5 transition-colors hover:border-[var(--color-edge-hi)]"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      name={getCategory(a.categorySlug)?.icon ?? 'book'}
                      size={14}
                      className="text-[var(--color-moss-hi)]"
                    />
                    <span className="micro-label">{getCategory(a.categorySlug)?.name}</span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-[13.5px] font-semibold leading-snug">
                    {a.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-[11.5px] text-[var(--color-ink-faint)]">
                    {a.summary}
                  </p>
                  <div className="mt-2.5">
                    <DangerBadge level={a.meta.dangerLevel} small />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 最近浏览 */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="micro-label">最近浏览 · HISTORY</h2>
              <Link
                to="/bookmarks"
                className="text-[11px] text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]"
              >
                收藏夹 →
              </Link>
            </div>
            {recent.length === 0 ? (
              <EmptyState
                icon="history"
                title="暂无阅读记录"
                hint="浏览过的知识会自动记录在这里，全部保存在本地设备。"
              />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {recent.map((h) => {
                  const ref = resolveRef(h.refId);
                  return (
                    <Link
                      key={h.refId}
                      to={ref?.href ?? '/knowledge'}
                      className="panel flex items-center gap-2.5 px-3 py-2.5 text-[13px] hover:border-[var(--color-edge-hi)]"
                    >
                      <Icon
                        name="history"
                        size={13}
                        className="shrink-0 text-[var(--color-ink-faint)]"
                      />
                      <span className="truncate">{h.title}</span>
                      <span className="ml-auto shrink-0 font-mono text-[10px] text-[var(--color-ink-faint)]">
                        {h.at.slice(5, 10)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 右：危险提醒 + 分类 */}
        <div className="flex flex-col gap-4">
          <Panel accent="danger" className="p-4">
            <div className="mb-2.5 flex items-center gap-2">
              <Icon name="warning" size={15} className="text-[var(--color-danger)]" />
              <span className="micro-label" style={{ color: 'var(--color-danger)' }}>
                危险提醒 · HAZARD ALERT
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {dangerAlerts.map((h) => (
                <Link
                  key={h.id}
                  to={`/hazard/${h.id}`}
                  className="rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] px-3 py-2.5 transition-colors hover:border-[var(--color-danger)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-medium">{h.title}</span>
                    <DangerBadge level={h.meta.dangerLevel} small />
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11.5px] text-[var(--color-ink-faint)]">
                    {h.description}
                  </p>
                </Link>
              ))}
              {dangerAlerts.length === 0 && (
                <p className="text-[12px] text-[var(--color-ink-faint)]">暂无高级别危险记录</p>
              )}
            </div>
            <Link
              to="/hazards"
              className="mt-3 block text-center text-[11.5px] text-[var(--color-danger)] hover:underline"
            >
              查看全部危险预警 →
            </Link>
          </Panel>

          <Panel className="p-4">
            <span className="micro-label">知识分类 · CATEGORIES</span>
            <div className="mt-3 flex flex-col gap-1">
              {getDataset().articles.length > 0 && <CategoryChips />}
            </div>
          </Panel>

          <Panel className="p-4">
            <span className="micro-label">系统状态 · STATUS</span>
            <div className="mt-3 flex flex-col gap-2 text-[12px]">
              <StatusRow label="网络" value={online ? '在线' : '离线'} ok={online} />
              <StatusRow label="本地知识库" value={`已打包 ${counts.articles}+ 条`} ok />
              <StatusRow label="离线包" value={`${offlineCount} 个可用`} ok={offlineCount > 0} />
              <StatusRow
                label="AI 助手"
                value={online ? '可用（需服务端）' : '离线降级本地检索'}
                ok={online}
              />
              <StatusRow label="个人数据" value="本地 IndexedDB" ok />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--color-ink-dim)]">{label}</span>
      <span
        className="flex items-center gap-1.5 font-mono text-[11px]"
        style={{ color: ok ? 'var(--color-moss-hi)' : 'var(--color-warn)' }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: 'currentColor' }}
        />
        {value}
      </span>
    </div>
  );
}

function CategoryChips() {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of articles) map.set(a.categorySlug, (map.get(a.categorySlug) ?? 0) + 1);
    return map;
  }, []);
  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORIES.filter((c) => (counts.get(c.slug) ?? 0) > 0).map((c) => (
        <Link key={c.slug} to={`/knowledge/${c.slug}`}>
          <Tag>
            {c.name} <span className="font-mono opacity-60">{counts.get(c.slug)}</span>
          </Tag>
        </Link>
      ))}
    </div>
  );
}
