import { registerPlugin } from '@capacitor/core';
import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import {
  checkNativeRelease,
  type NativeRelease,
  type NativeReleasePlatform,
} from '../lib/native-release';
import { detectPlatform } from '../lib/platform';
import { useApp } from '../lib/store';
import { APP_VERSION, formatVersion } from '../lib/version';
import { Icon } from './Icon';

const CHECK_KEY = 'apocalypse-survival:native-update-check';
const DISMISSED_KEY = 'apocalypse-survival:native-update-dismissed';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

const androidUpdates = registerPlugin<{ openRelease(options: { tag: string }): Promise<void> }>(
  'SurvivalUpdate',
);

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // 本地存储受限时仍然允许本次提示。
  }
}

/** 原生端启动后每天检查一次稳定版，发现新版本时给出覆盖安装提示。 */
export function NativeUpdateBanner() {
  const platform: NativeReleasePlatform | null =
    detectPlatform() === 'desktop'
      ? 'windows'
      : window.Capacitor?.getPlatform?.() === 'android'
        ? 'android'
        : null;
  const { toast } = useApp();
  const [release, setRelease] = useState<NativeRelease | null>(null);

  useEffect(() => {
    if (!platform || !navigator.onLine) return;
    const last = Number(readStorage(CHECK_KEY));
    if (Number.isFinite(last) && Date.now() - last < CHECK_INTERVAL_MS) return;
    writeStorage(CHECK_KEY, String(Date.now()));
    let cancelled = false;
    checkNativeRelease(APP_VERSION, platform)
      .then((next) => {
        if (cancelled || !next) return;
        if (readStorage(DISMISSED_KEY) === next.tag) return;
        setRelease(next);
      })
      .catch(() => {
        // 离线、限流或缺少资产时保持静默，设置页仍可手动检查。
      });
    return () => {
      cancelled = true;
    };
  }, [platform]);

  if (!release) return null;

  async function openRelease() {
    if (!release) return;
    try {
      if (platform === 'windows') await invoke('open_release_page', { tag: release.tag });
      if (platform === 'android') await androidUpdates.openRelease({ tag: release.tag });
    } catch {
      toast('无法打开系统浏览器，请手动访问 GitHub Releases 下载新版。', 'warn');
    }
  }

  function dismiss() {
    if (release) writeStorage(DISMISSED_KEY, release.tag);
    setRelease(null);
  }

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-xl md:bottom-5">
      <div className="panel border-[var(--color-moss)] bg-[var(--color-panel)] p-3.5 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-[var(--color-moss-hi)]">
            <Icon name="download" size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold">发现新版本 {release.tag}</div>
            <p className="mt-1 text-[12px] text-[var(--color-ink-dim)]">
              当前 {formatVersion(APP_VERSION)}。更新前建议先导出 JSON
              备份，再下载同平台安装包覆盖安装。
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary !py-1.5" onClick={openRelease}>
                <Icon name="download" size={14} /> 查看发行版
              </button>
              <button type="button" className="btn !py-1.5" onClick={dismiss}>
                稍后
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
