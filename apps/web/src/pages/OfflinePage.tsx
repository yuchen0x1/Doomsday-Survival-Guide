import { useCallback, useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { PageHeader, Panel, Progress, EmptyState, Confirm } from '../components/ui';
import { useApp } from '../lib/store';
import {
  loadPackageStates, downloadPackage, deletePackage, updatePackage, estimateStorage,
  BASE_PACKAGE, type PackageState,
} from '../lib/offline';

const fmtSize = (b: number) => b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : b >= 1024 ? `${(b / 1024).toFixed(1)} KB` : `${b} B`;

/** 离线生存模式：下载管理 / 进度 / 体积 / 剩余空间 / 更新 / 删除 */
export default function OfflinePage() {
  const { online, toast } = useApp();
  const [states, setStates] = useState<PackageState[]>([]);
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<PackageState | null>(null);

  const refresh = useCallback(async () => {
    setStates(await loadPackageStates());
    setStorage(await estimateStorage());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const download = async (def: PackageState) => {
    setBusy(def.id);
    try {
      await downloadPackage({ id: def.id, name: def.name, description: def.description, categorySlugs: def.categorySlugs, version: def.version },
        (pct) => setStates((s) => s.map((x) => x.id === def.id ? { ...x, status: 'downloading', progress: pct } : x)));
      toast(`「${def.name}」下载完成`, 'success');
    } catch {
      toast('下载失败，请重试', 'error');
    } finally {
      setBusy(null);
      refresh();
    }
  };

  const update = async (def: PackageState) => {
    setBusy(def.id);
    try {
      await updatePackage({ id: def.id, name: def.name, description: def.description, categorySlugs: def.categorySlugs, version: def.version },
        (pct) => setStates((s) => s.map((x) => x.id === def.id ? { ...x, progress: pct } : x)));
      toast(`「${def.name}」已更新`, 'success');
    } finally {
      setBusy(null);
      refresh();
    }
  };

  const remove = async (p: PackageState) => {
    await deletePackage(p.id);
    toast(`已删除「${p.name}」本地副本`, 'info');
    refresh();
  };

  const downloaded = states.filter((s) => s.status === 'downloaded');
  const totalSize = downloaded.reduce((sum, s) => sum + s.sizeBytes, 0);

  return (
    <div className="fade-in">
      <PageHeader
        icon="download"
        title="离线生存模式"
        subtitle={`核心知识随应用内置 · 已下载 ${downloaded.length} 个知识包 · 断网可用`}
        actions={
          <span className="danger-badge" style={{ color: online ? 'var(--color-moss-hi)' : 'var(--color-warn)' }}>
            {online ? '● 网络在线' : '⚠ 当前离线'}
          </span>
        }
      />

      {/* 状态总览 */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: '内置基础包', value: '1', hint: '随应用安装', icon: 'shield', color: 'var(--color-moss-hi)' },
          { label: '已下载包', value: String(downloaded.length), hint: `共 ${fmtSize(totalSize)}`, icon: 'database', color: 'var(--color-info)' },
          { label: '可下载包', value: String(states.filter((s) => s.status !== 'downloaded').length), hint: '按分类增量下载', icon: 'box', color: 'var(--color-sand)' },
          { label: '本地占用', value: storage ? fmtSize(storage.usage) : '—', hint: storage ? `配额 ${fmtSize(storage.quota)}` : '不可用', icon: 'database', color: 'var(--color-ink-dim)' },
        ].map((s) => (
          <Panel key={s.label} className="p-3.5" accent="moss">
            <div className="flex items-center justify-between">
              <span className="micro-label">{s.label}</span>
              <Icon name={s.icon} size={14} style={{ color: s.color }} />
            </div>
            <div className="mt-2 font-mono text-[22px] font-bold" style={{ color: s.color }}>{s.value}</div>
            <p className="mt-1 text-[11px] text-[var(--color-ink-faint)]">{s.hint}</p>
          </Panel>
        ))}
      </div>

      {/* 存储空间 */}
      {storage && storage.quota > 0 && (
        <div className="mb-5">
          <Progress value={(storage.usage / storage.quota) * 100}
            label={`浏览器存储使用 ${fmtSize(storage.usage)} / ${fmtSize(storage.quota)}（剩余 ${fmtSize(storage.quota - storage.usage)}）`} />
        </div>
      )}

      {/* 内置基础包 */}
      <Panel className="mb-4 p-4" accent="moss">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-[var(--color-moss)] bg-[var(--color-moss-dim)] text-[var(--color-moss-hi)]">
            <Icon name="shield" size={17} />
          </span>
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <span className="text-[14.5px] font-semibold">{BASE_PACKAGE.name}</span>
              <span className="danger-badge" style={{ color: 'var(--color-moss-hi)' }}>✓ 始终可用</span>
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-ink-dim)]">{BASE_PACKAGE.description}</p>
          </div>
          <div className="font-mono text-[12px] text-[var(--color-ink-faint)]">v{BASE_PACKAGE.version}</div>
        </div>
      </Panel>

      {/* 可下载知识包 */}
      <h2 className="micro-label mb-3">知识包下载管理 · PACKAGES</h2>
      {states.length === 1 ? (
        <EmptyState icon="box" title="正在扫描知识包…" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {states.filter((s) => s.id !== 'base-core').map((p) => (
            <Panel key={p.id} className="flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon name="database" size={15} className="text-[var(--color-sand)]" />
                  <span className="text-[14px] font-semibold">{p.name}</span>
                </div>
                <span className="danger-badge" style={{
                  color: p.status === 'downloaded' ? 'var(--color-moss-hi)'
                    : p.status === 'update_available' ? 'var(--color-warn)'
                    : p.status === 'downloading' ? 'var(--color-info)' : 'var(--color-ink-faint)',
                }}>
                  {p.status === 'downloaded' ? '✓ 已下载'
                    : p.status === 'update_available' ? '↑ 可更新'
                    : p.status === 'downloading' ? `↓ ${p.progress ?? 0}%` : '未下载'}
                </span>
              </div>
              <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-[var(--color-ink-dim)]">{p.description}</p>
              <div className="mt-2.5 flex items-center gap-3 font-mono text-[11px] text-[var(--color-ink-faint)]">
                <span>{fmtSize(p.sizeBytes)}</span>
                <span>v{p.version}</span>
                {p.downloadedAt && <span>{p.downloadedAt.slice(0, 10)}</span>}
              </div>

              {p.status === 'downloading' && (
                <div className="mt-3"><Progress value={p.progress ?? 0} /></div>
              )}

              <div className="mt-3 flex gap-2">
                {p.status === 'not_downloaded' && (
                  <button className="btn btn-primary flex-1" disabled={busy !== null} onClick={() => download(p)}>
                    <Icon name="download" size={14} /> 下载
                  </button>
                )}
                {p.status === 'update_available' && (
                  <button className="btn btn-sand flex-1" disabled={busy !== null} onClick={() => update(p)}>
                    <Icon name="refresh" size={14} /> 更新到 v{p.version}
                  </button>
                )}
                {p.status === 'downloaded' && (
                  <>
                    <span className="flex flex-1 items-center gap-1.5 text-[12px] text-[var(--color-moss-hi)]"><Icon name="check" size={14} /> 离线可用</span>
                    <button className="btn btn-danger" onClick={() => setConfirmDel(p)}><Icon name="trash" size={14} /></button>
                  </>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* 离线能力说明 */}
      <Panel className="mt-6 p-4">
        <span className="micro-label">离线能力清单 · OFFLINE CAPABILITIES</span>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-[12.5px] text-[var(--color-ink-dim)]">
          {[
            '✓ 离线打开软件（PWA 安装）', '✓ 离线浏览基础知识', '✓ 离线查看急救手册',
            '✓ 离线查询植物 / 动物', '✓ 离线全文搜索', '✓ 离线查看收藏',
            '✓ 离线管理物资', '✓ 离线使用计算器', '✓ 离线阅读技能教程',
            '✓ 本地数据断网不丢失', '△ 图片识别与 AI 需要联网', '△ 瓦片地图需要联网或预下载',
          ].map((x) => <span key={x}>{x}</span>)}
        </div>
      </Panel>

      <Confirm
        open={!!confirmDel} danger title="删除离线包"
        message={`确定删除「${confirmDel?.name}」的本地副本吗？删除后该分类需要重新下载（核心知识不受影响）。`}
        confirmText="删除下载"
        onCancel={() => setConfirmDel(null)}
        onConfirm={() => { if (confirmDel) remove(confirmDel); setConfirmDel(null); }}
      />
    </div>
  );
}
