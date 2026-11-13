import { type InventoryEntry, SUPPLY_CATEGORY_LABELS } from '@apocalypse/core';

export type InventoryInput = Omit<InventoryEntry, 'id' | 'createdAt' | 'updatedAt'>;

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && localDate(date) === value;
}

export function validateInventory(item: InventoryInput): void {
  if (typeof item.name !== 'string' || !item.name.trim()) throw new Error('请填写物资名称');
  if (typeof item.unit !== 'string' || !item.unit.trim()) throw new Error('请填写物资单位');
  if (!Object.hasOwn(SUPPLY_CATEGORY_LABELS, item.category)) throw new Error('物资分类不正确');
  for (const value of [item.quantity, item.minQuantity]) {
    if (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) {
      throw new Error('数量和最低库存必须是有效的非负数');
    }
  }
  if (![1, 2, 3].includes(item.priority)) throw new Error('优先级不正确');
  if (item.expiresAt !== undefined && item.expiresAt !== '' && !isDateOnly(item.expiresAt))
    throw new Error('有效期必须是有效日期');
}

export function inventoryStatus(item: InventoryEntry, today = localDate()) {
  const end = new Date(`${today}T12:00:00`);
  end.setDate(end.getDate() + 7);
  return {
    low: item.quantity < item.minQuantity,
    expired: Boolean(item.expiresAt && item.expiresAt < today),
    expiring: Boolean(
      item.expiresAt && item.expiresAt >= today && item.expiresAt <= localDate(end),
    ),
    shortage: Math.max(0, Number((item.minQuantity - item.quantity).toFixed(6))),
  };
}

export function replenishmentList(items: InventoryEntry[]) {
  return items
    .filter((item) => inventoryStatus(item).low)
    .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name, 'zh-CN'));
}

/** Quote every field and neutralize spreadsheet formula prefixes, including after whitespace. */
export function replenishmentCsv(items: InventoryEntry[]): string {
  const cell = (value: string | number) => {
    const raw = String(value);
    const safe = /^\s*[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return `\uFEFF${[
    ['物资', '分类', '当前库存', '最低库存', '需补充', '单位', '优先级'],
    ...replenishmentList(items).map((item) => [
      item.name,
      SUPPLY_CATEGORY_LABELS[item.category],
      item.quantity,
      item.minQuantity,
      inventoryStatus(item).shortage,
      item.unit,
      `P${item.priority}`,
    ]),
  ]
    .map((row) => row.map(cell).join(','))
    .join('\r\n')}`;
}
