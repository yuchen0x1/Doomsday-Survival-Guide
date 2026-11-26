import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import {
  androidUpdates,
  type NativeRelease,
  type NativeReleasePlatform,
} from '../lib/native-release';
import { dismissNativeRelease, watchNativeRelease } from '../lib/native-release-watch';
import { detectPlatform } from '../lib/platform';
import { useApp } from '../lib/store';
import { APP_VERSION, formatVersion } from '../lib/version';
import { Icon } from './Icon';

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
    if (!platform) return;
    return watchNativeRelease({ version: APP_VERSION, platform, onRelease: setRelease });
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
    if (release) dismissNativeRelease(release.tag);
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
