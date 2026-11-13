import { useEffect, useState } from 'react';
import { BackupControls } from '../components/BackupControls';
import { Icon } from '../components/Icon';
import { UpdateSettingsPanel } from '../components/PwaUpdate';
import { PageHeader, Panel, Tag } from '../components/ui';
import { clearAllData, getSetting, setSetting } from '../lib/db';
import { getPlatformInfo } from '../lib/platform';
import { useApp } from '../lib/store';

const DEFAULT_PREFS = {
  showDangerL4: true,
  confirmDelete: true,
  autoHistory: true,
  compactMode: false,
};

/** 设置：外观/行为开关、快捷键、数据管理、关于 */
export default function SettingsPage() {
  const { toast, online, bookmarks, history, inventory, notes } = useApp();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const info = getPlatformInfo();

  useEffect(() => {
    getSetting('prefs', DEFAULT_PREFS)
      .then((p) => setPrefs({ ...DEFAULT_PREFS, ...p }))
      .catch(() => toast('设置读取失败，请重试', 'error'));
  }, [toast]);

  const update = async (patch: Partial<typeof prefs>) => {
    setSaving(true);
    const next = { ...prefs, ...patch };
    try {
      await setSetting('prefs', next);
      setPrefs(next);
      document.documentElement.dataset.compact = String(next.compactMode);
      toast('设置已保存', 'success');
    } catch {
      toast('设置保存失败，请重试', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetLocal = async () => {
    if (!window.confirm('确定清除本应用全部个人数据？此操作不可恢复，建议先导出备份。')) return;
    try {
      await clearAllData();
      toast('本应用数据已清除', 'success');
      setTimeout(() => window.location.reload(), 700);
    } catch {
      toast('清除失败，数据未被完整清除，请重试', 'error');
    }
  };

  const platformLabel = {
    web: '网页版 Web',
    desktop: 'Windows 桌面版 (Tauri)',
    mobile: '移动版 (Capacitor)',
  }[info.platform];

  return (
    <div className="fade-in">
      <PageHeader icon="settings" title="设置" subtitle="行为偏好 · 快捷键 · 数据管理 · 关于" />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 行为偏好 */}
        <Panel className="p-4" accent="moss">
          <span className="micro-label">行为偏好 · PREFERENCES</span>
          <div className="mt-3 flex flex-col gap-3">
            {[
              {
                key: 'showDangerL4' as const,
                label: '显示 L4 致命风险内容',
                desc: '当前始终显示风险提示；列表隐藏选项尚未接入',
                unavailable: true,
              },
              {
                key: 'confirmDelete' as const,
                label: '删除操作二次确认',
                desc: '当前由各页面确认流程控制；全局切换尚未接入',
                unavailable: true,
              },
              {
                key: 'autoHistory' as const,
                label: '记录阅读历史',
                desc: '关闭后不再写入浏览记录',
              },
              {
                key: 'compactMode' as const,
                label: '紧凑排版',
                desc: '减小列表间距，一屏显示更多内容',
              },
            ].map((p) => (
              <label
                key={p.key}
                className="flex cursor-pointer items-start gap-3 rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] px-3.5 py-3"
              >
                <input
                  type="checkbox"
                  className="mt-1 accent-[var(--color-moss-hi)]"
                  checked={prefs[p.key]}
                  disabled={saving || p.unavailable}
                  onChange={(e) => update({ [p.key]: e.target.checked } as typeof prefs)}
                />
                <div>
                  <div className="text-[13.5px] font-medium">{p.label}</div>
                  <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-faint)]">{p.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </Panel>

        <UpdateSettingsPanel />

        <div className="flex flex-col gap-4">
          {/* 快捷键 */}
          <Panel className="p-4">
            <span className="micro-label">键盘快捷键 · SHORTCUTS</span>
            <div className="mt-3 flex flex-col gap-2 text-[13px]">
              {[
                { k: 'Ctrl + K', v: '聚焦全局搜索' },
                { k: 'Esc', v: '关闭弹窗' },
                { k: 'Enter', v: 'AI 输入框发送' },
                { k: 'Shift + Enter', v: 'AI 输入框换行' },
              ].map((s) => (
                <div key={s.k} className="flex items-center justify-between">
                  <span className="text-[var(--color-ink-dim)]">{s.v}</span>
                  <kbd className="rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] px-2 py-0.5 font-mono text-[11.5px]">
                    {s.k}
                  </kbd>
                </div>
              ))}
            </div>
          </Panel>

          {/* 数据管理 */}
          <Panel className="p-4">
            <span className="micro-label">数据管理 · DATA</span>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[12.5px]">
              {[
                { label: '收藏', v: bookmarks.length },
                { label: '历史', v: history.length },
                { label: '物资', v: inventory.length },
                { label: '笔记', v: notes.length },
              ].map((x) => (
                <div
                  key={x.label}
                  className="rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] py-2"
                >
                  <div className="font-mono text-[17px] font-bold">{x.v}</div>
                  <div className="micro-label mt-0.5">{x.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <BackupControls />
              <button type="button" className="btn btn-danger flex-1" onClick={resetLocal}>
                <Icon name="trash" size={14} /> 清除本地数据
              </button>
            </div>
          </Panel>
        </div>

        {/* 关于 */}
        <Panel className="p-4 lg:col-span-2">
          <span className="micro-label">关于 · ABOUT</span>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-[4px] border border-[var(--color-moss)] bg-[var(--color-moss-dim)] font-mono text-[20px] font-bold text-[var(--color-moss-hi)]">
              A
            </span>
            <div>
              <div className="font-mono text-[15px] font-bold tracking-[0.14em]">
                APOCALYPSE SURVIVAL
              </div>
              <div className="text-[12.5px] text-[var(--color-ink-dim)]">
                末日生存指南 · 跨平台生存百科全书 · 在线更新
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Tag>运行平台：{platformLabel}</Tag>
              <Tag>网络：{online ? '在线' : '离线'}</Tag>
              <Tag>相机：{info.hasCamera ? '可用' : '不可用'}</Tag>
              <Tag>本地库：IndexedDB</Tag>
            </div>
          </div>
          <div className="mt-4 grid gap-3 text-[12.5px] text-[var(--color-ink-dim)] sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <b className="text-[var(--color-ink)]">知识体系</b>
              <br />
              19 个一级分类 · 多级分类 · 标签 · 难度 · 危险等级筛选
            </div>
            <div>
              <b className="text-[var(--color-ink)]">AI 能力</b>
              <br />
              MiMo-V2.6-Flash · 服务端代理 · 离线自动降级本地检索
            </div>
            <div>
              <b className="text-[var(--color-ink)]">离线能力</b>
              <br />
              Service Worker 预缓存 · IndexedDB 本地包 · 断网全功能浏览
            </div>
            <div>
              <b className="text-[var(--color-ink)]">数据隐私</b>
              <br />
              个人数据全部本地存储 · 支持导出/恢复 · 不上传服务器
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
