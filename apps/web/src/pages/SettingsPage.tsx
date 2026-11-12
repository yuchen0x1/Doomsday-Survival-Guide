import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { UpdateSettingsPanel } from '../components/PwaUpdate';
import { PageHeader, Panel, Tag } from '../components/ui';
import { useApp } from '../lib/store';
import { getSetting, setSetting, exportAllData, importAllData } from '../lib/db';
import { detectPlatform, getPlatformInfo } from '../lib/platform';

/** 设置：外观/行为开关、快捷键、数据管理、关于 */
export default function SettingsPage() {
  const { toast, online, bookmarks, history, inventory, notes } = useApp();
  const [prefs, setPrefs] = useState({
    showDangerL4: true,
    confirmDelete: true,
    autoHistory: true,
    compactMode: false,
  });
  const info = getPlatformInfo();

  useEffect(() => {
    getSetting('prefs', prefs).then((p) => setPrefs({ ...prefs, ...p }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = async (patch: typeof prefs) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    await setSetting('prefs', next);
    toast('设置已保存', 'success');
  };

  const doExport = async () => {
    const json = await exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `apocalypse-survival-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('全量备份已导出', 'success');
  };

  const doImport = async (f: File) => {
    try {
      const n = await importAllData(await f.text());
      toast(`已恢复 ${n} 条记录`, 'success');
      setTimeout(() => window.location.reload(), 600);
    } catch {
      toast('备份文件格式不正确', 'error');
    }
  };

  const resetLocal = async () => {
    if (!window.confirm('确定清除本机全部个人数据？此操作不可恢复，建议先导出备份。')) return;
    localStorage.clear();
    const dbs = (await indexedDB.databases?.()) ?? [];
    await Promise.all(dbs.map((d) => d.name && indexedDB.deleteDatabase(d.name)));
    toast('本地数据已清除', 'info');
    setTimeout(() => window.location.reload(), 700);
  };

  const platformLabel = { web: '网页版 Web', desktop: 'Windows 桌面版 (Tauri)', mobile: '移动版 (Capacitor)' }[info.platform];

  return (
    <div className="fade-in">
      <PageHeader icon="settings" title="设置" subtitle="行为偏好 · 快捷键 · 数据管理 · 关于" />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 行为偏好 */}
        <Panel className="p-4" accent="moss">
          <span className="micro-label">行为偏好 · PREFERENCES</span>
          <div className="mt-3 flex flex-col gap-3">
            {[
              { key: 'showDangerL4' as const, label: '显示 L4 致命风险内容', desc: '关闭后 L4 条目在列表中默认隐藏（仍可通过搜索访问）' },
              { key: 'confirmDelete' as const, label: '删除操作二次确认', desc: '删除收藏/物资/标记前弹出确认框' },
              { key: 'autoHistory' as const, label: '记录阅读历史', desc: '关闭后不再写入浏览记录' },
              { key: 'compactMode' as const, label: '紧凑排版', desc: '减小列表间距，一屏显示更多内容' },
            ].map((p) => (
              <label key={p.key} className="flex cursor-pointer items-start gap-3 rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] px-3.5 py-3">
                <input type="checkbox" className="mt-1 accent-[var(--color-moss-hi)]"
                  checked={prefs[p.key]} onChange={(e) => update({ [p.key]: e.target.checked } as typeof prefs)} />
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
                  <kbd className="rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] px-2 py-0.5 font-mono text-[11.5px]">{s.k}</kbd>
                </div>
              ))}
            </div>
          </Panel>

          {/* 数据管理 */}
          <Panel className="p-4">
            <span className="micro-label">数据管理 · DATA</span>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[12.5px]">
              {[
                { label: '收藏', v: bookmarks.length }, { label: '历史', v: history.length },
                { label: '物资', v: inventory.length }, { label: '笔记', v: notes.length },
              ].map((x) => (
                <div key={x.label} className="rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)] py-2">
                  <div className="font-mono text-[17px] font-bold">{x.v}</div>
                  <div className="micro-label mt-0.5">{x.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn btn-primary flex-1" onClick={doExport}><Icon name="download" size={14} /> 导出全量备份</button>
              <label className="btn flex-1 cursor-pointer">
                <Icon name="upload" size={14} /> 恢复备份
                <input type="file" accept="application/json" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = ''; }} />
              </label>
              <button className="btn btn-danger flex-1" onClick={resetLocal}><Icon name="trash" size={14} /> 清除本地数据</button>
            </div>
          </Panel>
        </div>

        {/* 关于 */}
        <Panel className="p-4 lg:col-span-2">
          <span className="micro-label">关于 · ABOUT</span>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-[4px] border border-[var(--color-moss)] bg-[var(--color-moss-dim)] font-mono text-[20px] font-bold text-[var(--color-moss-hi)]">A</span>
            <div>
              <div className="font-mono text-[15px] font-bold tracking-[0.14em]">APOCALYPSE SURVIVAL</div>
              <div className="text-[12.5px] text-[var(--color-ink-dim)]">末日生存指南 · 跨平台生存百科全书 · v1.0.0</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Tag>运行平台：{platformLabel}</Tag>
              <Tag>网络：{online ? '在线' : '离线'}</Tag>
              <Tag>相机：{info.hasCamera ? '可用' : '不可用'}</Tag>
              <Tag>本地库：{info.hasLocalDb ? '系统级 SQLite' : 'IndexedDB'}</Tag>
            </div>
          </div>
          <div className="mt-4 grid gap-3 text-[12.5px] text-[var(--color-ink-dim)] sm:grid-cols-2 lg:grid-cols-4">
            <div><b className="text-[var(--color-ink)]">知识体系</b><br />19 个一级分类 · 多级分类 · 标签 · 难度 · 危险等级筛选</div>
            <div><b className="text-[var(--color-ink)]">AI 能力</b><br />MiMo-V2.6-Flash · 服务端代理 · 离线自动降级本地检索</div>
            <div><b className="text-[var(--color-ink)]">离线能力</b><br />Service Worker 预缓存 · IndexedDB 本地包 · 断网全功能浏览</div>
            <div><b className="text-[var(--color-ink)]">数据隐私</b><br />个人数据全部本地存储 · 支持导出/恢复 · 不上传服务器</div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
