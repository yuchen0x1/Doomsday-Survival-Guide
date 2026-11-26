import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getSetting } from '../lib/db';
import { type LocaleSetting, useI18n } from '../lib/i18n';
import { watchOnline } from '../lib/offline';
import { detectPlatform, usePlatformLayout } from '../lib/platform';
import { useApp } from '../lib/store';
import { PwaUpdateProvider } from '../lib/update';
import { Icon } from './Icon';
import { NativeUpdateBanner } from './NativeUpdateBanner';
import { PwaUpdateBanner } from './PwaUpdate';
import { ToastHost } from './ui';

/** 导航结构（三端共用，按平台差异化呈现） */
interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}
interface NavSection {
  title: string;
  items: NavItem[];
}

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

const NAV_KEYS = {
  '/': 'home',
  '/search': 'search',
  '/ai': 'ai',
  '/knowledge': 'knowledge',
  '/plants': 'plants',
  '/animals': 'animals',
  '/insects': 'insects',
  '/medicines': 'medicines',
  '/first-aid': 'firstAid',
  '/skills': 'skillsPage',
  '/supplies': 'supplies',
  '/inventory': 'inventory',
  '/calculators': 'calculators',
  '/simulator': 'simulator',
  '/map': 'map',
  '/learn': 'learn',
  '/hazards': 'hazards',
  '/bookmarks': 'bookmarks',
  '/profile': 'profile',
  '/offline': 'offline',
  '/admin': 'admin',
  '/settings': 'settings',
} as const;

function OnlineBadge() {
  const { t } = useI18n();
  const online = useApp((s) => s.online);
  return (
    <span
      role="status"
      className="micro-label flex items-center gap-1.5 rounded-[2px] border px-2 py-1"
      style={{
        borderColor: online ? 'var(--color-moss)' : 'var(--color-warn)',
        color: online ? 'var(--color-moss-hi)' : 'var(--color-warn)',
      }}
      title={online ? t('onlineTitle') : t('offlineTitle')}
      aria-label={online ? t('onlineTitle') : t('offlineTitle')}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: 'currentColor' }}
      />
      <span className="hidden sm:inline">{online ? 'ONLINE' : t('offlineBadge')}</span>
    </span>
  );
}

function GlobalSearchBox() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  return (
    <form
      className="relative flex-1 max-w-xl"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <Icon
        name="search"
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
      />
      <input
        className="field global-search-input !pl-9 !py-2"
        placeholder={t('searchPlaceholder')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </form>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PwaUpdateProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </PwaUpdateProvider>
  );
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { setting, locale, setSetting, t } = useI18n();
  const location = useLocation();
  const nav = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const platform = detectPlatform();
  const layout = usePlatformLayout();
  const setOnline = useApp((s) => s.setOnline);
  const hydrate = useApp((s) => s.hydrate);
  const hydrated = useApp((s) => s.hydrated);
  const loadError = useApp((s) => s.loadError);
  useEffect(() => {
    getSetting('prefs', { compactMode: false })
      .then((p) => {
        document.documentElement.dataset.compact = String(p.compactMode);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    hydrate();
    const un = watchOnline((v) => setOnline(v));
    return un;
  }, [hydrate, setOnline]);

  // 路由变化时移动端滚动置顶
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 桌面端快捷键 Ctrl+K 聚焦搜索
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const el = document.querySelector<HTMLInputElement>(
          '.global-search-input, input[placeholder^="搜索"]',
        );
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
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-[var(--color-moss)] bg-[var(--color-moss-dim)] font-mono text-[13px] font-bold text-[var(--color-moss-hi)]">
              A
            </span>
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate font-mono text-[12px] font-bold tracking-[0.16em] text-[var(--color-ink)]">
                  APOCALYPSE
                </div>
                <div className="truncate text-[10px] tracking-[0.3em] text-[var(--color-sand)]">
                  SURVIVAL · 末日生存
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-3">
            {NAV_SECTIONS.map((sec) => (
              <div key={sec.title} className="mb-3">
                {!collapsed && (
                  <div className="micro-label mb-1.5 px-2">
                    {t(
                      sec.title === '指挥'
                        ? 'command'
                        : sec.title === '图鉴'
                          ? 'atlas'
                          : sec.title === '技能与物资'
                            ? 'skills'
                            : sec.title === '实战'
                              ? 'field'
                              : 'mine',
                    )}
                  </div>
                )}
                {sec.items.map((item) =>
                  (() => {
                    const navKey = NAV_KEYS[item.to as keyof typeof NAV_KEYS] ?? 'home';
                    return (
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
                        {!collapsed && <span className="truncate">{t(navKey)}</span>}
                      </NavLink>
                    );
                  })(),
                )}
              </div>
            ))}
          </nav>

          <button
            type="button"
            className="flex items-center gap-2 border-t border-[var(--color-edge)] px-3.5 py-2.5 text-[11px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
            onClick={() => setCollapsed((c) => !c)}
          >
            <Icon name={collapsed ? 'chevron' : 'chevron-left'} size={14} />
            {!collapsed && (locale === 'en-US' ? 'Collapse navigation' : '收起导航')}
          </button>
        </aside>
      )}

      {/* ===== 主区域 ===== */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 顶部栏 */}
        <header
          className="sticky top-0 z-40 flex items-center gap-2 border-b border-[var(--color-edge)] bg-[var(--color-void)]/95 px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-4"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)' }}
        >
          {platform === 'mobile' && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-[var(--color-moss)] bg-[var(--color-moss-dim)] font-mono text-[13px] font-bold text-[var(--color-moss-hi)]">
              A
            </span>
          )}
          <div className="hidden flex-1 md:flex">
            <GlobalSearchBox />
          </div>
          <button
            type="button"
            className="btn btn-ghost !px-2 md:hidden"
            onClick={() => nav('/search')}
            aria-label={t('search')}
          >
            <Icon name="search" size={18} />
          </button>
          <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
            <label className="sr-only" htmlFor="app-locale">
              {t('locale')}
            </label>
            <select
              id="app-locale"
              className="field min-w-0 !w-28 truncate !py-1 !px-2 text-xs sm:!w-auto"
              value={setting}
              onChange={(event) => setSetting(event.target.value as LocaleSetting)}
              aria-label={t('locale')}
            >
              <option value="auto">{t('auto')}</option>
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
            <button
              type="button"
              className="btn btn-ghost !px-2"
              onClick={() => nav('/first-aid')}
              title={t('emergency')}
              style={{ color: 'var(--color-danger)' }}
            >
              <Icon name="firstaid" size={17} />
              <span className="hidden text-[12px] lg:inline">{t('emergency')}</span>
            </button>
            <OnlineBadge />
            <button
              type="button"
              className="btn btn-sand !px-2 !py-1.5"
              onClick={() => nav('/ai')}
              aria-label={t('aiAssistant')}
            >
              <Icon name="bot" size={15} />
              <span className="hidden sm:inline text-[12px]">{t('aiAssistant')}</span>
            </button>
          </div>
        </header>

        {/* 内容区 */}
        <main className="bg-grid min-h-0 flex-1 px-4 pb-24 pt-5 md:pb-10 md:px-6">
          <div className="mx-auto w-full max-w-[1280px]">
            {loadError && (
              <div
                role="alert"
                className="mb-4 rounded border border-[var(--color-danger)] p-3 text-sm"
              >
                {t('dataError')}{' '}
                <button type="button" className="btn" onClick={() => hydrate()}>
                  {t('reload')}
                </button>
              </div>
            )}
            {hydrated ? (
              children
            ) : (
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
              {t(
                item.to === '/'
                  ? 'mobileHome'
                  : item.to === '/knowledge'
                    ? 'mobileAtlas'
                    : item.to === '/search'
                      ? 'mobileSearch'
                      : item.to === '/ai'
                        ? 'mobileAI'
                        : item.to === '/bookmarks'
                          ? 'mobileMine'
                          : 'mobileSearch',
              )}
            </NavLink>
          ))}
        </nav>
      )}

      {/* 移动端浮动紧急按钮 */}
      {layout.fab && (
        <button
          type="button"
          className={`fixed bottom-16 right-3 z-40 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--color-danger)] bg-[var(--color-danger-dim)] text-[var(--color-danger)] shadow-lg${platform === 'mobile' ? '' : ' md:hidden'}`}
          onClick={() => nav('/first-aid')}
          aria-label={t('emergency')}
          title={t('emergency')}
        >
          <Icon name="firstaid" size={22} />
        </button>
      )}

      <ToastHost />
      <PwaUpdateBanner />
      <NativeUpdateBanner />
    </div>
  );
}
