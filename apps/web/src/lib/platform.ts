import type { Platform, PlatformInfo } from '@apocalypse/core';

/** 运行平台检测：Web / Tauri 桌面 / Capacitor 移动 */

declare global {
  interface Window {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
    Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string };
  }
}

export function detectPlatform(): Platform {
  // Tauri 2 注入 __TAURI_INTERNALS__，旧版注入 __TAURI__
  if (typeof window !== 'undefined' && (window.__TAURI__ || window.__TAURI_INTERNALS__))
    return 'desktop';
  // Capacitor 以全局 window.Capacitor 暴露，无需安装 @capacitor/core 也能检测（web 构建不依赖该包）
  if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) return 'mobile';
  return 'web';
}

/** 当前运行平台 */
export const getPlatform = (): Platform => detectPlatform();
export const isDesktop = (): boolean => detectPlatform() === 'desktop';
export const isMobile = (): boolean => detectPlatform() === 'mobile';

export function getPlatformInfo(): PlatformInfo {
  const platform = detectPlatform();
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const hasCamera =
    platform === 'mobile' ||
    (typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia);
  return { platform, online, hasCamera, hasLocalDb: platform !== 'web' };
}

export const isMobileViewport = (): boolean =>
  typeof window !== 'undefined' && window.innerWidth < 768;

/** 各平台的布局差异（三端共用同一套页面，仅外壳不同） */
export interface PlatformLayout {
  /** 桌面侧边栏导航 */
  sidebar: boolean;
  /** 底部导航栏（web 由 CSS 断点控制，原生移动端强制显示） */
  bottomNav: boolean;
  /** 悬浮急救按钮（同上） */
  fab: boolean;
}

/**
 * 桌面 = 侧边栏；移动 = 底部导航 + 悬浮急救按钮；web = 现状（响应式断点控制）。
 * 平台在运行期固定，无需响应式重渲染。
 */
export function usePlatformLayout(): PlatformLayout {
  const platform = detectPlatform();
  if (platform === 'desktop') return { sidebar: true, bottomNav: false, fab: false };
  if (platform === 'mobile') return { sidebar: false, bottomNav: true, fab: true };
  return { sidebar: true, bottomNav: true, fab: true };
}

/** 桌面端快捷键注册（Web 也支持） */
export function bindShortcuts(handlers: Record<string, (e: KeyboardEvent) => void>): () => void {
  const listener = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    for (const [combo, fn] of Object.entries(handlers)) {
      const parts = combo.toLowerCase().split('+');
      const needMod = parts.length > 1;
      const base = parts[parts.length - 1];
      if (key === base && needMod === mod) {
        e.preventDefault();
        fn(e);
      }
    }
  };
  window.addEventListener('keydown', listener);
  return () => window.removeEventListener('keydown', listener);
}
