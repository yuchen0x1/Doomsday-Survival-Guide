import { SUPPLY_CATEGORY_LABELS, type SupplyCategory } from '@apocalypse/core';
import { useMemo, useRef, useState } from 'react';
import { BackupControls } from '../../components/BackupControls';
import { Icon } from '../../components/Icon';
import { Confirm, EmptyState, Modal, PageHeader, Panel } from '../../components/ui';
import { downloadText } from '../../lib/files';
import {
  inventoryStatus,
  localDate,
  replenishmentCsv,
  replenishmentList,
} from '../../lib/inventory';
import { supplies } from '../../lib/knowledge';
import { useApp } from '../../lib/store';

type Filter = 'all' | 'low' | 'expiring' | 'expired';

/** 我的物资清单：增删改、数量、有效期、优先级、缺货提醒、导入导出 */
export default function InventoryPage() {
  const {
    inventory,
    transactions,
    addInventory,
    changeInventoryQty,
    editInventory,
    removeInventory,
    toast,
  } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('priority');
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const perform = async (action: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await action();
    } catch (error) {
      toast(error instanceof Error ? error.message : '保存失败，请重试', 'error');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const [adding, setAdding] = useState(false);
  const [confirmDel, setConfirmDel] = useState<{ id: string; name: string } | null>(null);
  const [newItem, setNewItem] = useState({
    supplyId: '',
    name: '',
    category: 'food' as SupplyCategory,
    quantity: 1,
    unit: '个',
    minQuantity: 1,
    priority: 1 as 1 | 2 | 3,
    expiresAt: '',
  });
  const today = localDate();
  const stats = useMemo(
    () => ({
      total: inventory.length,
      low: inventory.filter((i) => inventoryStatus(i, today).low),
      expiring: inventory.filter((i) => inventoryStatus(i, today).expiring),
      expired: inventory.filter((i) => inventoryStatus(i, today).expired),
    }),
    [inventory, today],
  );
  const filtered = useMemo(() => {
    const base = filter === 'all' ? inventory : stats[filter];
    const q = query.trim().toLocaleLowerCase();
    return base
      .filter((i) =>
        `${i.name} ${i.notes ?? ''} ${SUPPLY_CATEGORY_LABELS[i.category]}`
          .toLocaleLowerCase()
          .includes(q),
      )
      .sort((a, b) =>
        sort === 'expiry'
          ? (a.expiresAt || '9999').localeCompare(b.expiresAt || '9999')
          : sort === 'name'
            ? a.name.localeCompare(b.name, 'zh-CN')
            : a.priority - b.priority || a.name.localeCompare(b.name, 'zh-CN'),
      );
  }, [filter, inventory, stats, query, sort]);

  const submitAdd = async () => {
    const name = newItem.name.trim() || supplies.find((s) => s.id === newItem.supplyId)?.name;
    if (!name) {
      toast('请填写物资名称', 'warn');
      return;
    }
    const supply = supplies.find((s) => s.id === newItem.supplyId);
    const input = {
      supplyId: newItem.supplyId || 'custom',
      name,
      category: (supply?.category ?? newItem.category) as SupplyCategory,
      quantity: newItem.quantity,
      unit: newItem.unit || supply?.unit || '个',
      minQuantity: newItem.minQuantity,
      priority: newItem.priority,
      expiresAt: newItem.expiresAt || undefined,
    };
    if (editing) await editInventory(editing, input);
    else await addInventory(input);
    toast(`已保存「${name}」`, 'success');
    setEditing(null);
    setAdding(false);
    setNewItem({
      supplyId: '',
      name: '',
      category: 'food',
      quantity: 1,
      unit: '个',
      minQuantity: 1,
      priority: 1,
      expiresAt: '',
    });
  };

  const expiryColor = (d?: string) => {
    if (!d) return 'var(--color-ink-faint)';
    return d < today ? 'var(--color-danger)' : 'var(--color-ink-dim)';
  };
  const openAdd = () => {
    setEditing(null);
    setNewItem({
      supplyId: '',
      name: '',
      category: 'food',
      quantity: 1,
      unit: '个',
      minQuantity: 1,
      priority: 1,
      expiresAt: '',
    });
    setAdding(true);
  };

  return (
    <div className="fade-in">
      <PageHeader
        icon="clipboard"
        title="我的物资清单"
        subtitle={`${stats.total} 件在册 · 缺货 ${stats.low.length} · 7天内到期 ${stats.expiring.length} · 已过期 ${stats.expired.length}`}
        actions={
          <>
            <BackupControls />
            <button type="button" className="btn btn-primary" disabled={busy} onClick={openAdd}>
              <Icon name="plus" size={15} /> 添加物资
            </button>
          </>
        }
      />

      {/* 统计与缺货提醒 */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: '在册物资', value: stats.total, color: 'var(--color-info)', f: 'all' as Filter },
          {
            label: '缺货提醒',
            value: stats.low.length,
            color: 'var(--color-danger)',
            f: 'low' as Filter,
          },
          {
            label: '7天内到期',
            value: stats.expiring.length,
            color: 'var(--color-warn)',
            f: 'expiring' as Filter,
          },
          {
            label: '已过期',
            value: stats.expired.length,
            color: 'var(--color-danger)',
            f: 'expired' as Filter,
          },
        ].map((s) => (
          <button
            type="button"
            key={s.label}
            onClick={() => setFilter(s.f)}
            className={`panel p-3.5 text-left transition-colors ${filter === s.f ? 'border-[var(--color-sand)]' : 'hover:border-[var(--color-edge-hi)]'}`}
          >
            <div className="micro-label">{s.label}</div>
            <div className="mt-1.5 font-mono text-[24px] font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
          </button>
        ))}
      </div>

      {filter === 'low' && stats.low.length > 0 && (
        <div className="mb-4 rounded-[3px] border border-[var(--color-danger)] bg-[var(--color-danger-dim)]/30 px-4 py-3 text-[13px] text-[var(--color-ink)]">
          <Icon name="warning" size={14} className="mr-1.5 inline text-[var(--color-danger)]" />
          <b className="text-[var(--color-danger)]">缺货提醒：</b>
          {stats.low.map((i) => `${i.name}（${i.quantity}/${i.minQuantity}${i.unit}）`).join('、')}{' '}
          低于安全库存，请及时补充。
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-sm">
          搜索物资
          <input
            className="field mt-1"
            type="search"
            value={query}
            placeholder="名称、分类或备注"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="text-sm">
          排序
          <select className="field mt-1" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="priority">优先级</option>
            <option value="expiry">最早到期</option>
            <option value="name">名称</option>
          </select>
        </label>
        <button
          type="button"
          className="btn"
          disabled={stats.low.length === 0}
          onClick={async () => {
            try {
              const saved = await downloadText(
                replenishmentCsv(inventory),
                `补货清单-${today}.csv`,
                'text/csv;charset=utf-8',
              );
              if (saved) toast('补货清单已导出', 'success');
            } catch (error) {
              toast(error instanceof Error ? error.message : '导出失败，请重试', 'error');
            }
          }}
        >
          导出补货清单（{stats.low.length}）
        </button>
      </div>
      {filter === 'low' && (
        <Panel className="mb-4 p-4">
          <h2 className="text-sm font-semibold">补到最低库存</h2>
          <p className="mt-1 text-xs text-[var(--color-ink-dim)]">
            按优先级列出数量差额；不自动折算单位。过期物资请先核实、扣减后补货。
          </p>
          {replenishmentList(inventory).map((item) => (
            <div key={item.id} className="mt-2 flex justify-between gap-3 text-sm">
              <span>{item.name}</span>
              <span>
                需补 {inventoryStatus(item, today).shortage} {item.unit}
              </span>
            </div>
          ))}
        </Panel>
      )}

      {inventory.length === 0 ? (
        <EmptyState
          icon="clipboard"
          title="清单还是空的"
          hint="从物资百宝箱添加物资，或直接手工登记家里的应急储备。所有数据仅保存在本地设备。"
          action={
            <button type="button" className="btn btn-primary" onClick={openAdd}>
              <Icon name="plus" size={14} /> 添加第一件物资
            </button>
          }
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
                  <span
                    className="danger-badge"
                    style={{
                      color:
                        item.priority === 1
                          ? 'var(--color-danger)'
                          : item.priority === 2
                            ? 'var(--color-warn)'
                            : 'var(--color-ink-faint)',
                    }}
                  >
                    P{item.priority}
                  </span>
                  {item.quantity < item.minQuantity && (
                    <span className="danger-badge" style={{ color: 'var(--color-danger)' }}>
                      缺货
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2.5 text-[11.5px] text-[var(--color-ink-faint)]">
                  <span>{SUPPLY_CATEGORY_LABELS[item.category]}</span>
                  {item.expiresAt && (
                    <span style={{ color: expiryColor(item.expiresAt) }}>
                      到期 {item.expiresAt}
                    </span>
                  )}
                  {item.notes && <span>备注：{item.notes}</span>}
                </div>
              </div>

              {/* 数量控制 */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="btn !px-2 !py-1"
                  disabled={busy || item.quantity === 0}
                  onClick={() => perform(() => changeInventoryQty(item.id, -1, '手动减少'))}
                  aria-label="减少"
                >
                  <Icon name="close" size={12} />
                </button>
                <span className="w-16 text-center font-mono text-[15px] font-bold">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  className="btn !px-2 !py-1"
                  disabled={busy}
                  onClick={() => perform(() => changeInventoryQty(item.id, 1, '手动增加'))}
                  aria-label="增加"
                >
                  <Icon name="plus" size={12} />
                </button>
                <span className="ml-1 text-[11.5px] text-[var(--color-ink-faint)]">
                  {item.unit}
                </span>
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  className="btn !px-2 !py-1.5"
                  title="编辑"
                  onClick={() => {
                    setEditing(item.id);
                    setNewItem({ ...item, expiresAt: item.expiresAt ?? '' });
                    setAdding(true);
                  }}
                >
                  <Icon name="edit" size={13} />
                </button>
                <button
                  type="button"
                  className="btn btn-danger !px-2 !py-1.5"
                  title="删除"
                  onClick={() => setConfirmDel({ id: item.id, name: item.name })}
                >
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
            {transactions
              .toSorted((a, b) => b.at.localeCompare(a.at))
              .slice(0, 8)
              .map((t) => {
                const item = inventory.find((i) => i.id === t.entryId);
                return (
                  <div key={t.id} className="flex items-center justify-between text-[12.5px]">
                    <span className="text-[var(--color-ink-dim)]">
                      {item?.name ?? '（已删除）'} · {t.reason}
                    </span>
                    <span
                      className="font-mono"
                      style={{
                        color: t.delta > 0 ? 'var(--color-moss-hi)' : 'var(--color-danger)',
                      }}
                    >
                      {t.delta > 0 ? '+' : ''}
                      {t.delta}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--color-ink-faint)]">
                      {t.at.slice(5, 16).replace('T', ' ')}
                    </span>
                  </div>
                );
              })}
          </div>
        </Panel>
      )}

      {/* 添加弹窗 */}
      <Modal
        open={adding}
        title={editing ? '编辑物资' : '添加物资到清单'}
        onClose={() => {
          if (!busy) setAdding(false);
        }}
      >
        <div className="flex flex-col gap-3.5">
          <label className="text-[12.5px] text-[var(--color-ink-dim)]">
            从图鉴选择（可选）
            <select
              className="field mt-1.5"
              value={newItem.supplyId}
              onChange={(e) => {
                const s = supplies.find((x) => x.id === e.target.value);
                setNewItem((n) => ({
                  ...n,
                  supplyId: e.target.value,
                  name: s?.name ?? n.name,
                  unit: s?.unit ?? n.unit,
                  priority: s?.defaultPriority ?? n.priority,
                  category: s?.category ?? n.category,
                }));
              }}
            >
              <option value="">— 手工填写 —</option>
              {supplies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[12.5px] text-[var(--color-ink-dim)]">
            名称 *
            <input
              className="field mt-1.5"
              value={newItem.name}
              placeholder="如：瓶装水"
              onChange={(e) => setNewItem((n) => ({ ...n, name: e.target.value }))}
            />
          </label>
          <label className="text-[12.5px] text-[var(--color-ink-dim)]">
            分类
            <select
              className="field mt-1.5"
              aria-label="分类"
              value={newItem.category}
              onChange={(e) =>
                setNewItem((n) => ({
                  ...n,
                  supplyId: 'custom',
                  category: e.target.value as SupplyCategory,
                }))
              }
            >
              {Object.entries(SUPPLY_CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-[12.5px] text-[var(--color-ink-dim)]">
              数量
              <input
                type="number"
                step="any"
                min={0}
                className="field mt-1.5"
                value={newItem.quantity}
                onChange={(e) => setNewItem((n) => ({ ...n, quantity: Number(e.target.value) }))}
              />
            </label>
            <label className="text-[12.5px] text-[var(--color-ink-dim)]">
              单位
              <input
                className="field mt-1.5"
                value={newItem.unit}
                onChange={(e) => setNewItem((n) => ({ ...n, unit: e.target.value }))}
              />
            </label>
            <label className="text-[12.5px] text-[var(--color-ink-dim)]">
              最低库存（缺货线）
              <input
                type="number"
                step="any"
                min={0}
                className="field mt-1.5"
                value={newItem.minQuantity}
                onChange={(e) => setNewItem((n) => ({ ...n, minQuantity: Number(e.target.value) }))}
              />
            </label>
            <label className="text-[12.5px] text-[var(--color-ink-dim)]">
              有效期至
              <input
                type="date"
                className="field mt-1.5"
                value={newItem.expiresAt}
                onChange={(e) => setNewItem((n) => ({ ...n, expiresAt: e.target.value }))}
              />
            </label>
          </div>
          <label className="text-[12.5px] text-[var(--color-ink-dim)]">
            优先级
            <select
              className="field mt-1.5"
              value={newItem.priority}
              onChange={(e) =>
                setNewItem((n) => ({ ...n, priority: Number(e.target.value) as 1 | 2 | 3 }))
              }
            >
              <option value={1}>P1 生命必需</option>
              <option value={2}>P2 重要</option>
              <option value={3}>P3 可选</option>
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn" disabled={busy} onClick={() => setAdding(false)}>
              取消
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() => perform(submitAdd)}
            >
              <Icon name="check" size={14} /> {busy ? '保存中…' : '保存物资'}
            </button>
          </div>
        </div>
      </Modal>

      <Confirm
        open={!!confirmDel}
        danger
        title="删除物资"
        message={`确定从清单中删除「${confirmDel?.name}」吗？此操作只影响本地数据。`}
        confirmText="删除"
        onCancel={() => setConfirmDel(null)}
        onConfirm={() =>
          perform(async () => {
            if (confirmDel) await removeInventory(confirmDel.id);
            setConfirmDel(null);
            toast('已删除', 'info');
          })
        }
      />
    </div>
  );
}
