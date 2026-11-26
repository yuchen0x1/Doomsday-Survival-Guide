import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type Locale = 'zh-CN' | 'en-US';
export type LocaleSetting = 'auto' | Locale;

const STORAGE_KEY = 'apocalypse.locale';
export function resolveLocale(setting: LocaleSetting, candidates: readonly string[] = []): Locale {
  if (setting === 'zh-CN' || setting === 'en-US') return setting;
  for (const candidate of candidates.length ? candidates : ['zh-CN']) {
    const value = String(candidate).toLowerCase();
    if (value === 'en' || value.startsWith('en-')) return 'en-US';
    if (value === 'zh' || value.startsWith('zh-')) return 'zh-CN';
  }
  return 'zh-CN';
}

const messages = {
  'zh-CN': {
    command: '指挥',
    atlas: '图鉴',
    skills: '技能与物资',
    field: '实战',
    mine: '我的',
    home: '生存指挥中心',
    search: '全局搜索',
    ai: 'AI 生存助手',
    knowledge: '生存知识图鉴',
    plants: '植物图鉴',
    animals: '动物图鉴',
    insects: '昆虫图鉴',
    medicines: '药物图鉴',
    firstAid: '急救医疗百科',
    skillsPage: '生存技能工坊',
    supplies: '物资百宝箱',
    inventory: '我的物资清单',
    calculators: '生存计算器',
    simulator: '灾害模拟器',
    map: '生存地图',
    learn: '知识学习',
    hazards: '危险预警',
    bookmarks: '收藏与手册',
    profile: '个人生存档案',
    offline: '离线模式',
    admin: '内容管理后台',
    settings: '设置',
    mobileHome: '首页',
    mobileAtlas: '图鉴',
    mobileSearch: '搜索',
    mobileAI: 'AI',
    mobileMine: '我的',
    searchPlaceholder: '搜索生存知识、植物、急救…（Ctrl+K）',
    emergency: '紧急急救',
    aiAssistant: 'AI 助手',
    reload: '重新读取',
    dataError: '本地个人数据读取失败，当前清单可能不完整。请重试，不要清除数据。',
    locale: '界面语言',
    auto: '自动（跟随系统）',
    onlineTitle: '网络正常，AI 助手可用',
    offlineTitle: '离线模式：本地知识库可用，AI 不可用',
    offlineBadge: 'OFFLINE 离线',
  },
  'en-US': {
    command: 'Command',
    atlas: 'Atlas',
    skills: 'Skills & supplies',
    field: 'Field',
    mine: 'My kit',
    home: 'Survival command center',
    search: 'Global search',
    ai: 'AI survival assistant',
    knowledge: 'Survival knowledge atlas',
    plants: 'Plant atlas',
    animals: 'Animal atlas',
    insects: 'Insect atlas',
    medicines: 'Medicine atlas',
    firstAid: 'First aid encyclopedia',
    skillsPage: 'Survival workshop',
    supplies: 'Supply cache',
    inventory: 'My inventory',
    calculators: 'Survival calculators',
    simulator: 'Disaster simulator',
    map: 'Survival map',
    learn: 'Learn',
    hazards: 'Hazard alerts',
    bookmarks: 'Bookmarks & manuals',
    profile: 'Survivor profile',
    offline: 'Offline mode',
    admin: 'Content admin',
    settings: 'Settings',
    mobileHome: 'Home',
    mobileAtlas: 'Atlas',
    mobileSearch: 'Search',
    mobileAI: 'AI',
    mobileMine: 'Mine',
    searchPlaceholder: 'Search survival knowledge, plants, first aid… (Ctrl+K)',
    emergency: 'Emergency first aid',
    aiAssistant: 'AI assistant',
    reload: 'Reload',
    dataError:
      'Local profile data could not be read. The current list may be incomplete. Retry without clearing data.',
    locale: 'Interface language',
    auto: 'Automatic (system)',
    onlineTitle: 'Online: AI assistant available',
    offlineTitle: 'Offline: local knowledge available, AI unavailable',
    offlineBadge: 'OFFLINE',
  },
} as const;

type Key = keyof (typeof messages)['zh-CN'];
interface I18nValue {
  setting: LocaleSetting;
  locale: Locale;
  setSetting: (setting: LocaleSetting) => void;
  t: (key: Key) => string;
}
const Context = createContext<I18nValue | null>(null);
function readSetting(): LocaleSetting {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'zh-CN' || value === 'en-US' ? value : 'auto';
  } catch {
    return 'auto';
  }
}
export function I18nProvider({ children }: { children: ReactNode }) {
  const [setting, setState] = useState<LocaleSetting>(() => readSetting());
  const locale = resolveLocale(
    setting,
    typeof navigator === 'undefined' ? [] : navigator.languages || [navigator.language],
  );
  const setSetting = (next: LocaleSetting) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode */
    }
  };
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const value = useMemo(
    () => ({ setting, locale, setSetting, t: (key: Key) => messages[locale][key] }),
    [setting, locale],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useI18n(): I18nValue {
  const value = useContext(Context);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}
