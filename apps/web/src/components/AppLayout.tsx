import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { ToastHost } from './ui';
import { useApp } from '../lib/store';
import { detectPlatform, usePlatformLayout } from '../lib/platform';
import { watchOnline } from '../lib/offline';

/** 导航结构（三端共用，按平台差异化呈现） */
interface NavItem { to: string; label: string; icon: string; end?: boolean }
interface NavSection { title: string; items: NavItem[] }

export const NAV_SECTIONS: NavSection[] = [
  {
    title: '指挥',
    items: [
      { to: '/', label: '生存指挥中心', icon: 'home', end: true },
      { to: '/search', label: '全局搜索', icon: 'search' },
      { to: '/ai', label: 'AI 生存助手', icon: 'bot' },
    ],
  },
  {
    title: '图鉴',
    items: [
      { to: '/knowledge', label: '生存知识图鉴', icon: 'book' },
      { to: '/plants', label: '植物图鉴', icon: 'leaf' },
      { to: '/animals', label: '动物图鉴', icon: 'paw' },
      { to: '/insects', label: '昆虫图鉴', icon: 'bug' },
      { to: '/medicines', label: '药物图鉴', icon: 'pill' },
      { to: '/first-aid', label: '急救医疗百科', icon: 'firstaid' },
    ],
  },
  {
    title: '技能与物资',
    items: [
      { to: '/skills', label: '生存技能工坊', icon: 'hammer' },
      { to: '/supplies', label: '物资百宝箱', icon: 'box' },
      { to: '/inventory', label: '我的物资清单', icon: 'clipboard' },
      { to: '/calculators', label: '生存计算器', icon: 'calculator' },
    ],
  },
  {
    title: '实战',
    items: [
      { to: '/simulator', label: '灾害模拟器', icon: 'flame' },
      { to: '/map', label: '生存地图', icon: 'map' },
      { to: '/learn', label: '知识学习', icon: 'brain' },
      { to: '/hazards', label: '危险预警', icon: 'warning' },
    ],
  },
  {
    title: '我的',
    items: [
      { to: '/bookmarks', label: '收藏与手册', icon: 'bookmark' },
      { to: '/profile', label: '个人生存档案', icon: 'user' },
      { to: '/offline', label: '离线模式', icon: 'download' },
      { to: '/admin', label: '内容管理后台', icon: 'database' },
      { to: '/settings', label: '设置', icon: 'settings' },
    ],
  },
];

const MOBILE_NAV: NavItem[] = [
  { to: '/', label: '首页', icon: 'home', end: true },
  { to: '/knowledge', label: '图鉴', icon: 'book' },
  { to: '/search', label: '搜索', icon: 'search' },
  { to: '/ai', label: 'AI', icon: 'bot' },
  { to: '/bookmarks', label: '我的', icon: 'user' },
];

function OnlineBadge() {
  const online = useApp((s) => s.online);
  return (
    <span
      className="micro-label flex items-center gap-1.5 rounded-[2px] border px-2 py-1"
      style={{
        borderColor: online ? 'var(--color-moss)' : 'var(--color-warn)',
        color: online ? 'var(--color-moss-hi)' : 'var(--color-warn)',
      }}
      title={online ? '网络正常，AI 助手可用' : '离线模式：本地知识库可用，AI 不可用'}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'currentColor' }} />
      {online ? 'ONLINE' : 'OFFLINE 离线'}
    </span>
  );
}

function GlobalSearchBox() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  return (
    <form
      className="relative flex-1 max-w-xl"
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`); }}
    >
      <Icon name="search" size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]" />
      <input
        className="field !pl-9 !py-2"
        placeholder="搜索生存知识、植物、急救…（Ctrl+K）"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </form>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const platform = detectPlatform();
  const layout = usePlatformLayout();
  const setOnline = useApp((s) => s.setOnline);
  const hydrate = useApp((s) => s.hydrate);
  const hydrated = useApp((s) => s.hydrated);

  useEffect(() => {
    hydrate();
    const un = watchOnline((v) => setOnline(v));
    return un;
  }, [hydrate, setOnline]);

  // 路由变化时移动端滚动置顶
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  // 桌面端快捷键 Ctrl+K 聚焦搜索
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const el = document.querySelector<HTMLInputElement>('.global-search-input, input[placeholder^="搜索"]');
        el?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isDesktop = layout.sidebar;
  const sidebarWidth = collapsed ? 60 : 224;

  return (
    <div className="flex h-full min-h-screen bg-[var(--color-void)]">
      {/* ===== 桌面侧边导航 ===== */}
      {isDesktop && (
        <aside
          className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--color-edge)] bg-[var(--color-pit)] md:flex"
          style={{ width: sidebarWidth }}
        >
          <div className="flex items-center gap-2.5 border-b border-[var(--color-edge)] px-3.5 py-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-[var(--color-moss)] bg-[var(--color-moss-dim)] font-mono text-[13px] font-bold text-[var(--color-moss-hi)]">A</span>
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate font-mono text-[12px] font-bold tracking-[0.16em] text-[var(--color-ink)]">APOCALYPSE</div>
                <div className="truncate text-[10px] tracking-[0.3em] text-[var(--color-sand)]">SURVIVAL · 末日生存</div>
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-3">
            {NAV_SECTIONS.map((sec) => (
              <div key={sec.title} className="mb-3">
                {!collapsed && <div className="micro-label mb-1.5 px-2">{sec.title}</div>}
                {sec.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `mb-0.5 flex items-center gap-2.5 rounded-[3px] px-2.5 py-[7px] text-[13px] transition-colors ${
                        isActive
                          ? 'border-l-2 border-[var(--color-sand)] bg-[var(--color-riser)] text-[var(--color-ink)]'
                          : 'border-l-2 border-transparent text-[var(--color-ink-dim)] hover:bg-[var(--color-panel)] hover:text-[var(--color-ink)]'
                      }`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon name={item.icon} size={16} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <button
            className="flex items-center gap-2 border-t border-[var(--color-edge)] px-3.5 py-2.5 text-[11px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
            onClick={() => setCollapsed((c) => !c)}
          >
            <Icon name={collapsed ? 'chevron' : 'chevron-left'} size={14} />
            {!collapsed && '收起导航'}
          </button>
        </aside>
      )}

      {/* ===== 主区域 ===== */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 顶部栏 */}
        <header
          className="sticky top-0 z-40 flex items-center gap-3 border-b border-[var(--color-edge)] bg-[var(--color-void)]/95 px-4 py-2.5 backdrop-blur"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)' }}
        >
          {platform === 'mobile' && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-[var(--color-moss)] bg-[var(--color-moss-dim)] font-mono text-[13px] font-bold text-[var(--color-moss-hi)]">A</span>
          )}
          <div className="hidden flex-1 md:flex"><GlobalSearchBox /></div>
          <button className="btn btn-ghost md:hidden" onClick={() => window.location.assign('/search')} aria-label="搜索">
            <Icon name="search" size={18} />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button className="btn btn-ghost !px-2" onClick={() => window.location.assign('/first-aid')} title="紧急急救" style={{ color: 'var(--color-danger)' }}>
              <Icon name="firstaid" size={17} />
              <span className="hidden text-[12px] lg:inline">紧急急救</span>
            </button>
            <OnlineBadge />
            <button className="btn btn-sand !py-1.5" onClick={() => window.location.assign('/ai')}>
              <Icon name="bot" size={15} />
              <span className="hidden sm:inline text-[12px]">AI 助手</span>
            </button>
          </div>
        </header>

        {/* 内容区 */}
        <main className="bg-grid min-h-0 flex-1 px-4 pb-24 pt-5 md:pb-10 md:px-6">
          <div className="mx-auto w-full max-w-[1280px]">
            {hydrated ? children : (
              <div className="flex h-60 items-center justify-center">
                <span className="skeleton h-8 w-8 rounded-full" />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ===== 移动端底部导航 ===== */}
      {layout.bottomNav && (
        <nav
          className={`fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--color-edge)] bg-[var(--color-pit)]/97 backdrop-blur${platform === 'mobile' ? '' : ' md:hidden'}`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {MOBILE_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors ${
                  isActive ? 'text-[var(--color-sand)]' : 'text-[var(--color-ink-faint)]'
                }`
              }
            >
              <Icon name={item.icon} size={19} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}

      {/* 移动端浮动紧急按钮 */}
      {layout.fab && (
        <button
          className={`fixed bottom-16 right-3 z-40 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--color-danger)] bg-[var(--color-danger-dim)] text-[var(--color-danger)] shadow-lg${platform === 'mobile' ? '' : ' md:hidden'}`}
          onClick={() => window.location.assign('/first-aid')}
          aria-label="紧急急救"
          title="紧急急救"
        >
          <Icon name="firstaid" size={22} />
        </button>
      )}

      <ToastHost />
    </div>
  );
}
