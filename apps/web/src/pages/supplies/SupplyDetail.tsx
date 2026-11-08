import { useParams } from 'react-router-dom';
import { SUPPLY_CATEGORY_LABELS } from '@apocalypse/core';
import { Icon } from '../../components/Icon';
import { Panel, EmptyState, Tag } from '../../components/ui';
import {
  BackButton, BookmarkButton, MetaBar, SourceList, TipList, useHistory,
} from '../../components/detail';
import { getSupply } from '../../lib/knowledge';
import { useApp } from '../../lib/store';

/** 物资详情：一键加入我的清单 */
export default function SupplyDetail() {
  const { id } = useParams();
  const supply = id ? getSupply(id) : undefined;
  useHistory('supply', supply?.id ?? '', supply?.name ?? '');
  const addInventory = useApp((s) => s.addInventory);
  const toast = useApp((s) => s.toast);
  const inventory = useApp((s) => s.inventory);

  if (!supply) {
    return (
      <div className="fade-in">
        <BackButton fallback="/supplies" />
        <EmptyState icon="box" title="未找到该物资" action={<a className="btn btn-primary" href="/supplies">返回物资百宝箱</a>} />
      </div>
    );
  }

  const already = inventory.some((i) => i.supplyId === supply.id);

  const addToInventory = async () => {
    await addInventory({
      supplyId: supply.id, name: supply.name, category: supply.category,
      quantity: 1, unit: supply.unit, minQuantity: supply.defaultPriority === 1 ? 3 : 1,
      priority: supply.defaultPriority,
    });
    toast(`已将「${supply.name}」加入物资清单`, 'success');
  };

  return (
    <div className="fade-in">
      <BackButton fallback="/supplies" />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[22px] font-bold">{supply.name}</h1>
                <span className="danger-badge" style={{ color: 'var(--color-sand)' }}>{SUPPLY_CATEGORY_LABELS[supply.category]}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <BookmarkButton kind="supply" refId={supply.id} title={supply.name} />
              <button className={`btn ${already ? '' : 'btn-primary'}`} onClick={addToInventory} disabled={already}>
                <Icon name={already ? 'check' : 'plus'} size={15} />
                {already ? '已在清单中' : '加入我的清单'}
              </button>
            </div>
          </div>

          <div className="mt-3"><MetaBar meta={supply.meta} /></div>

          <Panel className="mt-4 p-4">
            <span className="micro-label">用途</span>
            <p className="mt-2 text-[14px] leading-[1.9] text-[var(--color-ink-dim)]">{supply.purpose}</p>
          </Panel>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Panel className="p-4"><span className="micro-label">使用说明</span><p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-dim)]">{supply.usage}</p></Panel>
            <Panel className="p-4"><span className="micro-label">保存方法</span><p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-dim)]">{supply.storageMethod}</p></Panel>
            <Panel className="p-4"><span className="micro-label">保存期限</span><p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-dim)]">{supply.shelfLife}</p></Panel>
            <Panel className="p-4"><span className="micro-label">适用场景</span><div className="mt-2 flex flex-wrap gap-1.5">{supply.scenarios.map((s) => <Tag key={s}>{s}</Tag>)}</div></Panel>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <TipList title="使用风险" items={supply.risks} tone="warn" />
            <TipList title="替代物资" items={supply.substitutes} tone="info" />
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">{supply.tags.map((t) => <Tag key={t}># {t}</Tag>)}</div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex aspect-[4/3] items-center justify-center rounded-[3px] border border-[var(--color-edge)] bg-[var(--color-pit)]">
            <span className="font-serif text-[52px] font-bold text-[var(--color-sand)] opacity-60">{supply.name.slice(0, 1)}</span>
          </div>
          <Panel className="p-4">
            <span className="micro-label">优先级</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-[24px] font-bold" style={{ color: supply.defaultPriority === 1 ? 'var(--color-danger)' : supply.defaultPriority === 2 ? 'var(--color-warn)' : 'var(--color-ink-dim)' }}>P{supply.defaultPriority}</span>
              <span className="text-[13px] text-[var(--color-ink-dim)]">{supply.defaultPriority === 1 ? '生命必需 · 立即准备' : supply.defaultPriority === 2 ? '重要 · 尽快准备' : '可选 · 有条件再备'}</span>
            </div>
            <div className="mt-3 micro-label">单位：{supply.unit}</div>
          </Panel>
          <SourceList meta={supply.meta} />
        </div>
      </div>
    </div>
  );
}
