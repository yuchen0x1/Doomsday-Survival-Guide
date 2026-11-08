import { useMemo, useRef, useState } from 'react';
import { SUPPLY_CATEGORY_LABELS, type SupplyCategory } from '@apocalypse/core';
import { Icon } from '../../components/Icon';
import { PageHeader, Panel, Tag, EmptyState, Confirm, Modal, Progress } from '../../components/ui';
import { useApp } from '../../lib/store';
import { supplies } from '../../lib/knowledge';
import { exportAllData, importAllData } from '../../lib/db';

type Filter = 'all' | 'low' | 'expiring' | 'expired';

/** 我的物资清单：增删改、数量、有效期、优先级、缺货提醒、导入导出 */
export default function InventoryPage() {
  const { inventory, transactions, addInventory, changeInventoryQty, editInventory, removeInventory, toast } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [adding, setAdding] = useState(false);
  const [confirmDel, setConfirmDel] = useState<{ id: string; name: string } | null>(null);
  const [newItem, setNewItem] = useState({
    supplyId: '', name: '', category: 'food' as SupplyCategory, quantity: 1,
    unit: '个', minQuantity: 1, priority: 1 as 1 | 2 | 3, expiresAt: '',
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const low = inventory.filter((i) => i.quantity <= i.minQuantity);
    const expiring = inventory.filter((i) => i.expiresAt && i.expiresAt <= in7 && i.expiresAt >= now.toISOString().slice(0, 10));
    const expired = inventory.filter((i) => i.expiresAt && i.expiresAt < now.toISOString().slice(0, 10));
    return { total: inventory.length, low, expiring, expired };
  }, [inventory, in7]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'low': return stats.low;
      case 'expiring': return stats.expiring;
      case 'expired': return stats.expired;
      default: return inventory;
    }
  }, [filter, inventory, stats]);

  const submitAdd = async () => {
    const name = newItem.name.trim() || supplies.find((s) => s.id === newItem.supplyId)?.name;
    if (!name) { toast('请填写物资名称', 'warn'); return; }
    const supply = supplies.find((s) => s.id === newItem.supplyId);
    await addInventory({
      supplyId: newItem.supplyId || 'custom',
      name, category: (supply?.category ?? newItem.category) as SupplyCategory,
      quantity: Math.max(0, newItem.quantity), unit: newItem.unit || supply?.unit || '个',
      minQuantity: Math.max(0, newItem.minQuantity), priority: newItem.priority,
      expiresAt: newItem.expiresAt || undefined,
    });
    toast(`已添加「${name}」`, 'success');
    setAdding(false);
    setNewItem({ supplyId: '', name: '', category: 'food', quantity: 1, unit: '个', minQuantity: 1, priority: 1, expiresAt: '' });
  };

  const doExport = async () => {
    const json = await exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `survival-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('备份文件已导出', 'success');
  };

  const doImport = async (f: File) => {
    try {
      const text = await f.text();
      const n = await importAllData(text);
      toast(`已恢复 ${n} 条本地数据`, 'success');
      window.location.reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : '导入失败：文件格式不正确', 'error');
    }
  };

  const expiryColor = (d?: string) => {
    if (!d) return 'var(--color-ink-faint)';
    if (d < now.toISOString().slice(0, 10)) return 'var(--color-danger)';
    if (d <= in7) return 'var(--color-warn)';
    return 'var(--color-ink-dim)';
  };

  return (
    <div className="fade-in">
      <PageHeader
        icon="clipboard"
        title="我的物资清单"
        subtitle={`${stats.total} 件在册 · 缺货 ${stats.low.length} · 7天内到期 ${stats.expiring.length} · 已过期 ${stats.expired.length}`}
        actions={
          <>
            <button className="btn" onClick={doExport}><Icon name="download" size={14} /> 导出备份</button>
            <button className="btn" onClick={() => fileRef.current?.click()}><Icon name="upload" size={14} /> 导入备份</button>
            <button className="btn btn-primary" onClick={() => setAdding(true)}><Icon name="plus" size={15} /> 添加物资</button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = ''; }} />
          </>
        }
      />

      {/* 统计与缺货提醒 */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: '在册物资', value: stats.total, color: 'var(--color-info)', f: 'all' as Filter },
          { label: '缺货提醒', value: stats.low.length, color: 'var(--color-danger)', f: 'low' as Filter },
          { label: '7天内到期', value: stats.expiring.length, color: 'var(--color-warn)', f: 'expiring' as Filter },
          { label: '已过期', value: stats.expired.length, color: 'var(--color-danger)', f: 'expired' as Filter },
        ].map((s) => (
          <button key={s.label} onClick={() => setFilter(s.f)}
            className={`panel p-3.5 text-left transition-colors ${filter === s.f ? 'border-[var(--color-sand)]' : 'hover:border-[var(--color-edge-hi)]'}`}>
            <div className="micro-label">{s.label}</div>
            <div className="mt-1.5 font-mono text-[24px] font-bold" style={{ color: s.color }}>{s.value}</div>
          </button>
        ))}
      </div>

      {filter === 'low' && stats.low.length > 0 && (
        <div className="mb-4 rounded-[3px] border border-[var(--color-danger)] bg-[var(--color-danger-dim)]/30 px-4 py-3 text-[13px] text-[var(--color-ink)]">
          <Icon name="warning" size={14} className="mr-1.5 inline text-[var(--color-danger)]" />
          <b className="text-[var(--color-danger)]">缺货提醒：</b>
          {stats.low.map((i) => `${i.name}（${i.quantity}/${i.minQuantity}${i.unit}）`).join('、')} 低于安全库存，请及时补充。
        </div>
      )}

      {inventory.length === 0 ? (
        <EmptyState
          icon="clipboard" title="清单还是空的"
          hint="从物资百宝箱添加物资，或直接手工登记家里的应急储备。所有数据仅保存在本地设备。"
          action={<button className="btn btn-primary" onClick={() => setAdding(true)}><Icon name="plus" size={14} /> 添加第一件物资</button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="check" title="该分类下没有物资" hint="点击上方统计卡片切换筛选。" />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((item) => (
            <Panel key={item.id} className="flex flex-wrap items-center gap-3 p-3.5">
              <div className="min-w-[180px] flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold">{item.name}</span>
                  <span className="danger-badge" style={{ color: item.priority === 1 ? 'var(--color-danger)' : item.priority === 2 ? 'var(--color-warn)' : 'var(--color-ink-faint)' }}>P{item.priority}</span>
                  {item.quantity <= item.minQuantity && <span className="danger-badge" style={{ color: 'var(--color-danger)' }}>缺货</span>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2.5 text-[11.5px] text-[var(--color-ink-faint)]">
                  <span>{SUPPLY_CATEGORY_LABELS[item.category]}</span>
                  {item.expiresAt && <span style={{ color: expiryColor(item.expiresAt) }}>到期 {item.expiresAt}</span>}
                  {item.notes && <span>备注：{item.notes}</span>}
                </div>
              </div>

              {/* 数量控制 */}
              <div className="flex items-center gap-1.5">
                <button className="btn !px-2 !py-1" onClick={() => changeInventoryQty(item.id, -1, '手动减少')} aria-label="减少">
                  <Icon name="close" size={12} />
                </button>
                <span className="w-16 text-center font-mono text-[15px] font-bold">{item.quantity}</span>
                <button className="btn !px-2 !py-1" onClick={() => changeInventoryQty(item.id, 1, '手动增加')} aria-label="增加">
                  <Icon name="plus" size={12} />
                </button>
                <span className="ml-1 text-[11.5px] text-[var(--color-ink-faint)]">{item.unit}</span>
              </div>

              <div className="flex gap-1.5">
                <button className="btn !px-2 !py-1.5" title="编辑" onClick={() => {
                  const d = window.prompt(`更新「${item.name}」的数量与有效期（数量, 最低库存, 到期日YYYY-MM-DD，留空则不改）`,
                    `${item.quantity}, ${item.minQuantity}, ${item.expiresAt ?? ''}`);
                  if (d === null) return;
                  const [q, m, e] = d.split(',').map((x) => x.trim());
                  editInventory(item.id, {
                    ...(q !== '' && !Number.isNaN(Number(q)) ? { quantity: Number(q) } : {}),
                    ...(m !== '' && !Number.isNaN(Number(m)) ? { minQuantity: Number(m) } : {}),
                    ...(e ? { expiresAt: e } : {}),
                  });
                  toast('已更新', 'success');
                }}><Icon name="edit" size={13} /></button>
                <button className="btn btn-danger !px-2 !py-1.5" title="删除" onClick={() => setConfirmDel({ id: item.id, name: item.name })}>
                  <Icon name="trash" size={13} />
                </button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* 消耗记录 */}
      {transactions.length > 0 && (
        <Panel className="mt-5 p-4">
          <span className="micro-label">最近消耗记录</span>
          <div className="mt-2.5 flex flex-col gap-1.5">
            {transactions.slice(-8).reverse().map((t) => {
              const item = inventory.find((i) => i.id === t.entryId);
              return (
                <div key={t.id} className="flex items-center justify-between text-[12.5px]">
                  <span className="text-[var(--color-ink-dim)]">{item?.name ?? '（已删除）'} · {t.reason}</span>
                  <span className="font-mono" style={{ color: t.delta > 0 ? 'var(--color-moss-hi)' : 'var(--color-danger)' }}>
                    {t.delta > 0 ? '+' : ''}{t.delta}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--color-ink-faint)]">{t.at.slice(5, 16).replace('T', ' ')}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {/* 添加弹窗 */}
      <Modal open={adding} title="添加物资到清单" onClose={() => setAdding(false)}>
        <div className="flex flex-col gap-3.5">
          <label className="text-[12.5px] text-[var(--color-ink-dim)]">
            从图鉴选择（可选）
            <select className="field mt-1.5" value={newItem.supplyId}
              onChange={(e) => {
                const s = supplies.find((x) => x.id === e.target.value);
                setNewItem((n) => ({ ...n, supplyId: e.target.value, name: s?.name ?? n.name, unit: s?.unit ?? n.unit, priority: s?.defaultPriority ?? n.priority, category: s?.category ?? n.category }));
              }}>
              <option value="">— 手工填写 —</option>
              {supplies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="text-[12.5px] text-[var(--color-ink-dim)]">
            名称 *
            <input className="field mt-1.5" value={newItem.name} placeholder="如：瓶装水" onChange={(e) => setNewItem((n) => ({ ...n, name: e.target.value }))} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-[12.5px] text-[var(--color-ink-dim)]">
              数量
              <input type="number" min={0} className="field mt-1.5" value={newItem.quantity}
                onChange={(e) => setNewItem((n) => ({ ...n, quantity: Number(e.target.value) }))} />
            </label>
            <label className="text-[12.5px] text-[var(--color-ink-dim)]">
              单位
              <input className="field mt-1.5" value={newItem.unit} onChange={(e) => setNewItem((n) => ({ ...n, unit: e.target.value }))} />
            </label>
            <label className="text-[12.5px] text-[var(--color-ink-dim)]">
              最低库存（缺货线）
              <input type="number" min={0} className="field mt-1.5" value={newItem.minQuantity}
                onChange={(e) => setNewItem((n) => ({ ...n, minQuantity: Number(e.target.value) }))} />
            </label>
            <label className="text-[12.5px] text-[var(--color-ink-dim)]">
              有效期至
              <input type="date" className="field mt-1.5" value={newItem.expiresAt}
                onChange={(e) => setNewItem((n) => ({ ...n, expiresAt: e.target.value }))} />
            </label>
          </div>
          <label className="text-[12.5px] text-[var(--color-ink-dim)]">
            优先级
            <select className="field mt-1.5" value={newItem.priority}
              onChange={(e) => setNewItem((n) => ({ ...n, priority: Number(e.target.value) as 1 | 2 | 3 }))}>
              <option value={1}>P1 生命必需</option>
              <option value={2}>P2 重要</option>
              <option value={3}>P3 可选</option>
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <button className="btn" onClick={() => setAdding(false)}>取消</button>
            <button className="btn btn-primary" onClick={submitAdd}><Icon name="check" size={14} /> 添加</button>
          </div>
        </div>
      </Modal>

      <Confirm
        open={!!confirmDel} danger title="删除物资"
        message={`确定从清单中删除「${confirmDel?.name}」吗？此操作只影响本地数据。`}
        confirmText="删除"
        onCancel={() => setConfirmDel(null)}
        onConfirm={() => { if (confirmDel) removeInventory(confirmDel.id); setConfirmDel(null); toast('已删除', 'info'); }}
      />
    </div>
  );
}
