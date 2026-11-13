import 'fake-indexeddb/auto';
import { IDBObjectStore } from 'fake-indexeddb';
import { openDB } from 'idb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseBackup } from '../src/lib/backup';
import {
  addInventory,
  changeInventoryQuantity,
  clearAllData,
  exportAllData,
  getDB,
  importAllData,
  listInventory,
  listTransactions,
  setSetting,
  updateInventory,
} from '../src/lib/db';
import { inventoryStatus, isDateOnly, localDate, replenishmentCsv } from '../src/lib/inventory';
import { useApp } from '../src/lib/store';

const input = {
  supplyId: 'custom',
  name: '饮水',
  category: 'water' as const,
  quantity: 2,
  unit: '瓶',
  minQuantity: 3,
  priority: 1 as const,
};
const at = '2026-11-13T00:00:00.000Z';
const row = { ...input, id: 'water', createdAt: at, updatedAt: at };
const note = {
  id: 'note',
  title: '避难',
  body: '集合地点',
  tags: [],
  createdAt: at,
  updatedAt: at,
};
beforeEach(async () => {
  vi.restoreAllMocks();
  await clearAllData();
});

describe('backup validation and atomic persistence', () => {
  it('exports and restores all stores, preserving existing unrelated records', async () => {
    await addInventory(input);
    await setSetting('custom', { nested: true });
    const json = await exportAllData();
    expect(parseBackup(json).count).toBe(2);
    await clearAllData();
    await setSetting('retained', true);
    expect(await importAllData(json)).toBe(2);
    expect(await listInventory()).toHaveLength(1);
    expect(await (await getDB()).get('settings', 'retained')).toBeDefined();
  });
  it('supports old partial version 1 backups and idempotent repeated imports', async () => {
    const json = JSON.stringify({ version: 1, inventory: [row] });
    await importAllData(json);
    await importAllData(json);
    expect(await listInventory()).toEqual([row]);
  });
  it.each([
    null,
    [],
    { version: 2 },
    { version: 1 },
    { version: 1, notes: {} },
    { version: 1, inventory: [{ ...row, quantity: -1 }] },
    { version: 1, inventory: [row, row] },
    { version: 1, notes: [{ ...note, tags: null }] },
    {
      version: 1,
      mapRoutes: [{ id: 'x', name: 'x', points: [{ lat: 200, lng: 2 }], createdAt: at }],
    },
    { version: 1, settings: [{ key: 'survival_profile', value: { contacts: 'bad' } }] },
  ])('rejects malformed backups without changing any data: %j', async (payload) => {
    await addInventory(input);
    const before = await exportAllData();
    await expect(importAllData(JSON.stringify(payload))).rejects.toThrow();
    expect(JSON.parse(await exportAllData()).inventory).toEqual(JSON.parse(before).inventory);
  });
  it('validates all tables before writing the first one', async () => {
    await expect(
      importAllData(JSON.stringify({ version: 1, inventory: [row], notes: [{}] })),
    ).rejects.toThrow('笔记');
    expect(await listInventory()).toEqual([]);
  });
  it('rolls back earlier stores if a later write fails', async () => {
    const original = IDBObjectStore.prototype.put;
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (
      this: IDBObjectStore,
      ...args: Parameters<typeof original>
    ) {
      if (this.name === 'notes') throw new DOMException('Quota exceeded', 'QuotaExceededError');
      return original.apply(this, args);
    });
    await expect(
      importAllData(JSON.stringify({ version: 1, inventory: [row], notes: [note] })),
    ).rejects.toThrow('Quota');
    expect(await listInventory()).toEqual([]);
  });
  it('clears only app stores and leaves another database intact', async () => {
    const other = await openDB('unrelated-app', 1, {
      upgrade(db) {
        db.createObjectStore('data');
      },
    });
    await other.put('data', 'keep', 'sentinel');
    await addInventory(input);
    await clearAllData();
    expect(await listInventory()).toEqual([]);
    expect(await other.get('data', 'sentinel')).toBe('keep');
    other.close();
  });
});

describe('inventory integrity', () => {
  it('honors the persisted reading-history preference', async () => {
    await setSetting('prefs', { autoHistory: false });
    await useApp
      .getState()
      .addHistory({ kind: 'article', refId: 'article-test', title: '测试文章' });
    expect(await (await getDB()).getAll('history')).toEqual([]);
    await setSetting('prefs', { autoHistory: true });
    await useApp
      .getState()
      .addHistory({ kind: 'article', refId: 'article-test', title: '测试文章' });
    expect(await (await getDB()).getAll('history')).toHaveLength(1);
  });
  it('serializes simultaneous adjustments against persisted state', async () => {
    await importAllData(JSON.stringify({ version: 1, inventory: [row] }));
    await Promise.all(Array.from({ length: 20 }, () => changeInventoryQuantity(row.id, 1, '补货')));
    expect((await listInventory())[0].quantity).toBe(22);
    expect((await listTransactions()).reduce((sum, t) => sum + t.delta, 0)).toBe(20);
  });
  it('records the real bounded delta and omits zero changes', async () => {
    await importAllData(JSON.stringify({ version: 1, inventory: [{ ...row, quantity: 0.5 }] }));
    await changeInventoryQuantity(row.id, -1, '消耗');
    await changeInventoryQuantity(row.id, -1, '消耗');
    expect((await listInventory())[0].quantity).toBe(0);
    expect((await listTransactions()).map((t) => t.delta)).toEqual([-0.5]);
  });
  it('rolls inventory back when the journal cannot be written', async () => {
    await importAllData(JSON.stringify({ version: 1, inventory: [row] }));
    const original = IDBObjectStore.prototype.put;
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (
      this: IDBObjectStore,
      ...args: Parameters<typeof original>
    ) {
      if (this.name === 'transactions') throw new Error('write failed');
      return original.apply(this, args);
    });
    await expect(changeInventoryQuantity(row.id, 1, '补货')).rejects.toThrow();
    expect((await listInventory())[0].quantity).toBe(2);
    expect(await listTransactions()).toEqual([]);
  });
  it('validates edits, preserves identity and journals quantity changes', async () => {
    await importAllData(JSON.stringify({ version: 1, inventory: [row] }));
    await expect(updateInventory(row.id, { quantity: -3 })).rejects.toThrow();
    await updateInventory(row.id, { id: 'wrong', quantity: 5, expiresAt: undefined });
    expect((await listInventory())[0]).toMatchObject({ id: row.id, quantity: 5 });
    expect((await listTransactions())[0].delta).toBe(3);
  });
  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1])(
    'rejects invalid quantities %s',
    async (quantity) => {
      await expect(addInventory({ ...input, quantity })).rejects.toThrow();
    },
  );
  it('fails clearly for an item deleted in another tab', async () => {
    await expect(changeInventoryQuantity('missing', 1, '补货')).rejects.toThrow('删除');
  });
  it('does not report sufficient stock as low and uses local calendar dates', () => {
    expect(inventoryStatus({ ...row, quantity: 3 }).low).toBe(false);
    expect(inventoryStatus({ ...row, expiresAt: '2026-11-13' }, '2026-11-13').expiring).toBe(true);
    expect(inventoryStatus({ ...row, expiresAt: '2026-11-12' }, '2026-11-13').expired).toBe(true);
    expect(localDate(new Date(2026, 0, 1, 0, 1))).toBe('2026-01-01');
    expect(isDateOnly('2026-02-30')).toBe(false);
  });
  it('exports a truthful shortage and neutralizes formulas in CSV', () => {
    const csv = replenishmentCsv([
      { ...row, name: '=1+1' },
      { ...row, id: 'full', quantity: 3, name: '足够' },
    ]);
    expect(csv).toContain("'=1+1");
    expect(csv).toContain('"2","3","1","瓶"');
    expect(csv).not.toContain('足够');
  });
});
