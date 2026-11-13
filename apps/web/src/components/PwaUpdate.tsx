import { detectPlatform } from '../lib/platform';
import { useAppUpdate } from '../lib/update';
import { formatUpdateTime } from '../lib/update-helpers';
import { APP_VERSION, formatVersion } from '../lib/version';
import { Icon } from './Icon';

const STATUS_LABELS = {
  checking: '正在检查',
  ready: '已就绪',
  available: '发现新版本',
  updating: '正在应用更新',
  updated: '更新已应用',
  offline: '离线',
  unsupported: '当前环境不支持',
  error: '检查失败',
} as const;

export function PwaUpdateBanner() {
  const { needRefresh, status, error, updateNow, dismissUpdate } = useAppUpdate();
  if (!needRefresh && status !== 'error') return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-xl md:bottom-5">
      <div className="panel border-[var(--color-sand)] bg-[var(--color-panel)] p-3.5 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-[var(--color-sand)]">
            <Icon name={status === 'error' ? 'warning' : 'refresh'} size={18} />
          </span>
          <div className="min-w-0 flex-1">
            {status === 'error' ? (
              <>
                <div className="text-[13px] font-semibold">更新检查失败</div>
                <p className="mt-1 text-[12px] text-[var(--color-ink-dim)]">
                  {error || '网络不可用，当前版本仍可继续使用。'}
                </p>
              </>
            ) : (
              <>
                <div className="text-[13px] font-semibold">发现可用更新</div>
                <p className="mt-1 text-[12px] text-[var(--color-ink-dim)]">
                  新版本会先由 Service Worker 校验并接管，应用本地数据不会被清除。
                </p>
              </>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {needRefresh && (
                <button type="button" className="btn btn-primary !py-1.5" onClick={updateNow}>
                  <Icon name="refresh" size={14} /> 立即更新
                </button>
              )}
              <button type="button" className="btn !py-1.5" onClick={dismissUpdate}>
                稍后处理
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UpdateSettingsPanel() {
  const {
    needRefresh,
    offlineReady,
    status,
    error,
    lastCheckedAt,
    checkForUpdate,
    updateNow,
    dismissUpdate,
  } = useAppUpdate();
  const checking = status === 'checking' || status === 'updating';

  if (detectPlatform() !== 'web') {
    return (
      <section className="panel p-4 lg:col-span-2" aria-labelledby="native-version-title">
        <h2 id="native-version-title" className="text-[15px] font-semibold">
          应用版本
        </h2>
        <p className="mt-3 font-mono text-[15px]">{formatVersion(APP_VERSION)}</p>
        <p className="mt-2 text-sm text-[var(--color-ink-dim)]">
          知识内容已随安装包内置，断网可用。更新时请从项目发布页下载同平台新版安装包并覆盖安装；请勿卸载，以免丢失本机数据。建议先导出备份。
        </p>
        <p className="mt-2 break-all text-xs text-[var(--color-ink-faint)]">
          github.com/yuchen0x1/Doomsday-Survival-Guide/releases/latest
        </p>
      </section>
    );
  }

  return (
    <section className="panel p-4 lg:col-span-2" aria-labelledby="update-settings-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="micro-label">在线更新 · ONLINE UPDATE</span>
          <h2 id="update-settings-title" className="mt-1 text-[15px] font-semibold">
            版本与 Service Worker
          </h2>
        </div>
        <span className="micro-label border border-[var(--color-edge)] px-2 py-1">
          {STATUS_LABELS[status]}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-[12.5px] sm:grid-cols-3">
        <div className="rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] p-2.5">
          <div className="micro-label">当前版本</div>
          <div className="mt-1 font-mono text-[15px]">{formatVersion(APP_VERSION)}</div>
        </div>
        <div className="rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] p-2.5">
          <div className="micro-label">上次检查</div>
          <div className="mt-1 text-[var(--color-ink-dim)]">{formatUpdateTime(lastCheckedAt)}</div>
        </div>
        <div className="rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] p-2.5">
          <div className="micro-label">离线缓存</div>
          <div className="mt-1 text-[var(--color-ink-dim)]">
            {offlineReady ? '已准备好' : '由 Service Worker 管理'}
          </div>
        </div>
      </div>
      {needRefresh && (
        <p className="mt-3 text-[12.5px] text-[var(--color-sand)]">
          新版本已经下载完成，应用更新后会自动重新加载。
        </p>
      )}
      {error && <p className="mt-3 text-[12.5px] text-[var(--color-danger)]">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={checkForUpdate}
          disabled={checking}
        >
          <Icon name="refresh" size={14} /> {checking ? '检查中…' : '检查更新'}
        </button>
        {needRefresh && (
          <button type="button" className="btn btn-sand" onClick={updateNow} disabled={checking}>
            <Icon name="download" size={14} /> 立即更新
          </button>
        )}
        {needRefresh && (
          <button type="button" className="btn" onClick={dismissUpdate}>
            稍后提醒
          </button>
        )}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-ink-faint)]">
        PWA 更新只替换同源静态资源；收藏、历史、物资和笔记保存在本机 IndexedDB，不会因刷新被删除。
      </p>
    </section>
  );
}
