import { registerPlugin } from '@capacitor/core';
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';
import {
  checkNativeRelease,
  type NativeRelease,
  type NativeReleasePlatform,
} from '../lib/native-release';
import { detectPlatform } from '../lib/platform';
import { APP_VERSION, formatVersion } from '../lib/version';
import { Icon } from './Icon';

const androidUpdates = registerPlugin<{ openRelease(options: { tag: string }): Promise<void> }>(
  'SurvivalUpdate',
);

export function NativeUpdateSettings() {
  const platform: NativeReleasePlatform | null =
    detectPlatform() === 'desktop'
      ? 'windows'
      : window.Capacitor?.getPlatform?.() === 'android'
        ? 'android'
        : null;
  const [latest, setLatest] = useState<NativeRelease | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function check() {
    if (!platform) return;
    setBusy(true);
    setLatest(null);
    setMessage('正在检查更新…');
    try {
      const next = await checkNativeRelease(APP_VERSION, platform);
      setLatest(next);
      setMessage(next ? '' : '已是最新稳定版。');
    } catch (error) {
      setMessage(
        !navigator.onLine
          ? '当前处于离线状态。联网后可重试，仍可阅读本机知识。'
          : error instanceof Error
            ? error.message
            : '检查失败，请稍后重试。',
      );
    } finally {
      setBusy(false);
    }
  }

  async function openRelease() {
    if (!latest) return;
    try {
      if (platform === 'windows') await invoke('open_release_page', { tag: latest.tag });
      if (platform === 'android') await androidUpdates.openRelease({ tag: latest.tag });
    } catch {
      setMessage('无法打开系统浏览器。请在浏览器中访问 GitHub Releases。');
    }
  }

  return (
    <section className="panel p-4 lg:col-span-2" aria-labelledby="native-version-title">
      <h2 id="native-version-title" className="text-[15px] font-semibold">
        应用版本
      </h2>
      <p className="mt-2 font-mono">{formatVersion(APP_VERSION)}</p>
      <p className="mt-2 text-sm text-[var(--color-ink-dim)]">
        覆盖安装前可先导出备份。
        {platform === 'android'
          ? '请用 Android 系统安装器安装同签名 APK。'
          : '请先关闭应用，再运行新版安装程序。'}
      </p>
      {platform && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={check} disabled={busy}>
            <Icon name="refresh" size={14} /> 检查更新
          </button>
          {latest && (
            <button type="button" className="btn" onClick={openRelease}>
              在浏览器中查看发行版
            </button>
          )}
        </div>
      )}
      {message && (
        <p className="mt-2 text-sm" role="status">
          {message}
        </p>
      )}
      {latest && (
        <div className="mt-3 border-t border-[var(--color-edge)] pt-3">
          <p className="text-sm font-semibold">
            可用版本 {latest.tag} · {new Date(latest.publishedAt).toLocaleDateString()} ·{' '}
            {(latest.bytes / 1024 ** 2).toFixed(1)} MiB
          </p>
          {latest.notes && (
            <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-sm">
              {latest.notes}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
