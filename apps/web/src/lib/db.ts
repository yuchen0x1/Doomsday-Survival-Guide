import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  AIConversation, Bookmark, InventoryEntry, InventoryTransaction, LearningProgress,
  MapMarker, MapRoute, OfflinePackage, QuizRecord, ReadingHistoryItem, SurvivalProfile, UserNote,
} from '@apocalypse/core';

/**
 * 本地持久层（IndexedDB）。
 * 所有个人数据（收藏/历史/物资/笔记/档案/学习记录/离线包）全部本地保存，
 * 断网不丢失，桌面端与移动端同样可用。
 */

interface ApocalypseDB extends DBSchema {
  bookmarks: { key: string; value: Bookmark; indexes: { by_ref: string; by_kind: string } };
  history: { key: string; value: ReadingHistoryItem };
  inventory: { key: string; value: InventoryEntry; indexes: { by_category: string } };
  transactions: { key: string; value: InventoryTransaction; indexes: { by_entry: string } };
  notes: { key: string; value: UserNote };
  settings: { key: string; value: { key: string; value: unknown } };
  quizRecords: { key: string; value: QuizRecord; indexes: { by_question: string } };
  offlinePackages: { key: string; value: OfflinePackage };
  conversations: { key: string; value: AIConversation };
  mapMarkers: { key: string; value: MapMarker };
  mapRoutes: { key: string; value: MapRoute };
}

type StoreName =
  | 'bookmarks' | 'history' | 'inventory' | 'transactions' | 'notes' | 'settings'
  | 'quizRecords' | 'offlinePackages' | 'conversations' | 'mapMarkers' | 'mapRoutes';

const DB_NAME = 'apocalypse-survival';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ApocalypseDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<ApocalypseDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ApocalypseDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const bookmarks = db.createObjectStore('bookmarks', { keyPath: 'id' });
        bookmarks.createIndex('by_ref', 'refId');
        bookmarks.createIndex('by_kind', 'kind');
        db.createObjectStore('history', { keyPath: 'refId' });
        const inv = db.createObjectStore('inventory', { keyPath: 'id' });
        inv.createIndex('by_category', 'category');
        const tx = db.createObjectStore('transactions', { keyPath: 'id' });
        tx.createIndex('by_entry', 'entryId');
        db.createObjectStore('notes', { keyPath: 'id' });
        db.createObjectStore('settings', { keyPath: 'key' });
        const qr = db.createObjectStore('quizRecords', { keyPath: 'id' });
        qr.createIndex('by_question', 'questionId');
        db.createObjectStore('offlinePackages', { keyPath: 'id' });
        db.createObjectStore('conversations', { keyPath: 'id' });
        db.createObjectStore('mapMarkers', { keyPath: 'id' });
        db.createObjectStore('mapRoutes', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export const uid = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

async function all<T>(store: StoreName): Promise<T[]> {
  const db = await getDB();
  return (await db.getAll(store)) as T[];
}

async function put<T>(store: StoreName, value: T): Promise<void> {
  const db = await getDB();
  await db.put(store, value as never);
}

async function del(store: StoreName, key: string): Promise<void> {
  const db = await getDB();
  await db.delete(store, key);
}

async function clear(store: StoreName): Promise<void> {
  const db = await getDB();
  await db.clear(store);
}

/* ---------- 收藏 ---------- */
export const listBookmarks = () => all<Bookmark>('bookmarks');
export async function addBookmark(b: Omit<Bookmark, 'id' | 'createdAt'>): Promise<Bookmark> {
  const db = await getDB();
  const existing = await db.getAllFromIndex('bookmarks', 'by_ref', b.refId);
  if (existing.length > 0) return existing[0];
  const item: Bookmark = { ...b, id: uid(), createdAt: new Date().toISOString() };
  await put('bookmarks', item);
  return item;
}
export const removeBookmark = (id: string) => del('bookmarks', id);
export async function updateBookmark(id: string, patch: Partial<Bookmark>): Promise<void> {
  const db = await getDB();
  const old = await db.get('bookmarks', id);
  if (old) await put('bookmarks', { ...old, ...patch });
}
export const isBookmarked = async (refId: string): Promise<boolean> => {
  const db = await getDB();
  const hits = await db.getAllFromIndex('bookmarks', 'by_ref', refId);
  return hits.length > 0;
};

/* ---------- 阅读历史 ---------- */
export const listHistory = async (): Promise<ReadingHistoryItem[]> => {
  const items = await all<ReadingHistoryItem>('history');
  return items.sort((a, b) => b.at.localeCompare(a.at));
};
export async function pushHistory(item: Omit<ReadingHistoryItem, 'at'>): Promise<void> {
  const db = await getDB();
  await put('history', { ...item, at: new Date().toISOString() });
  // 最多保留 200 条
  const allItems = await db.getAll('history');
  if (allItems.length > 200) {
    const sorted = allItems.sort((a, b) => b.at.localeCompare(a.at));
    for (const stale of sorted.slice(200)) await db.delete('history', stale.refId);
  }
}
export const clearHistory = () => clear('history');

/* ---------- 物资清单 ---------- */
export const listInventory = () => all<InventoryEntry>('inventory');
export const addInventory = (e: Omit<InventoryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> =>
  put('inventory', { ...e, id: uid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as InventoryEntry);
export async function updateInventory(id: string, patch: Partial<InventoryEntry>): Promise<void> {
  const db = await getDB();
  const old = await db.get('inventory', id);
  if (old) await put('inventory', { ...old, ...patch, updatedAt: new Date().toISOString() });
}
export const removeInventory = (id: string) => del('inventory', id);
export const listTransactions = () => all<InventoryTransaction>('transactions');
export async function pushTransaction(entryId: string, delta: number, reason: string): Promise<void> {
  await put('transactions', { id: uid(), entryId, delta, reason, at: new Date().toISOString() });
}

/* ---------- 笔记 ---------- */
export const listNotes = async (): Promise<UserNote[]> => {
  const items = await all<UserNote>('notes');
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
};
export const addNote = (n: Omit<UserNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> =>
  put('notes', { ...n, id: uid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as UserNote);
export async function updateNote(id: string, patch: Partial<UserNote>): Promise<void> {
  const db = await getDB();
  const old = await db.get('notes', id);
  if (old) await put('notes', { ...old, ...patch, updatedAt: new Date().toISOString() });
}
export const removeNote = (id: string) => del('notes', id);

/* ---------- KV 设置 ---------- */
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const db = await getDB();
  const row = await db.get('settings', key);
  return row ? (row.value as T) : fallback;
}
export const setSetting = (key: string, value: unknown): Promise<void> =>
  put('settings', { key, value } as never);

/* ---------- 学习记录 ---------- */
export const listQuizRecords = () => all<QuizRecord>('quizRecords');
export const addQuizRecord = (r: Omit<QuizRecord, 'id'>): Promise<void> =>
  put('quizRecords', { ...r, id: uid() } as QuizRecord);
export async function getLearningProgress(): Promise<LearningProgress> {
  const records = await listQuizRecords();
  const answered = records.length;
  const correct = records.filter((r) => r.correct).length;
  const wrongBook = Array.from(new Set(records.filter((r) => !r.correct).map((r) => r.questionId)));
  const days = new Set(records.map((r) => r.at.slice(0, 10)));
  const sortedDays = Array.from(days).sort();
  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  let cursor: string | null = sortedDays.includes(today) ? today : null;
  if (cursor) {
    streak = 1;
    for (let i = sortedDays.length - 1; i >= 0; i--) {
      if (sortedDays[i] === cursor) {
        const d: Date = new Date(cursor);
        d.setDate(d.getDate() - 1);
        cursor = d.toISOString().slice(0, 10);
        if (i > 0 && sortedDays[i - 1] === cursor) streak++;
      }
    }
  }
  return {
    answered, correct, wrongBook, streakDays: streak,
    lastStudyDate: sortedDays[sortedDays.length - 1],
  };
}
export async function resetWrongBook(): Promise<void> {
  const records = await listQuizRecords();
  const db = await getDB();
  for (const r of records) if (!r.correct) await db.delete('quizRecords', r.id);
}

/* ---------- 离线包 ---------- */
export const listOfflinePackages = () => all<OfflinePackage>('offlinePackages');
export const saveOfflinePackage = (p: OfflinePackage): Promise<void> => put('offlinePackages', p);
export const removeOfflinePackage = (id: string) => del('offlinePackages', id);

/* ---------- AI 会话 ---------- */
export const listConversations = async (): Promise<AIConversation[]> => {
  const items = await all<AIConversation>('conversations');
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
};
export const saveConversation = (c: AIConversation): Promise<void> => put('conversations', c);
export const removeConversation = (id: string) => del('conversations', id);

/* ---------- 地图 ---------- */
export const listMapMarkers = () => all<MapMarker>('mapMarkers');
export const saveMapMarker = (m: MapMarker): Promise<void> => put('mapMarkers', m);
export const removeMapMarker = (id: string) => del('mapMarkers', id);
export const listMapRoutes = () => all<MapRoute>('mapRoutes');
export const saveMapRoute = (r: MapRoute): Promise<void> => put('mapRoutes', r);
export const removeMapRoute = (id: string) => del('mapRoutes', id);

/* ---------- 个人档案（敏感数据本地保存） ---------- */
export const PROFILE_KEY = 'survival_profile';
export const loadProfile = () => getSetting<SurvivalProfile | null>(PROFILE_KEY, null);
export const saveProfile = (p: SurvivalProfile): Promise<void> => setSetting(PROFILE_KEY, p);

/* ---------- 数据导出 / 导入（备份） ---------- */
export async function exportAllData(): Promise<string> {
  const db = await getDB();
  const payload: Record<string, unknown> = { version: 1, exportedAt: new Date().toISOString() };
  const stores = [
    'bookmarks', 'history', 'inventory', 'transactions', 'notes', 'settings',
    'quizRecords', 'offlinePackages', 'conversations', 'mapMarkers', 'mapRoutes',
  ] as const;
  for (const s of stores) payload[s] = await db.getAll(s);
  return JSON.stringify(payload, null, 2);
}

export async function importAllData(json: string): Promise<number> {
  const payload = JSON.parse(json) as Record<string, unknown>;
  if (!payload || payload.version !== 1) throw new Error('备份文件格式不正确');
  const db = await getDB();
  let count = 0;
  const stores = [
    'bookmarks', 'history', 'inventory', 'transactions', 'notes', 'settings',
    'quizRecords', 'offlinePackages', 'conversations', 'mapMarkers', 'mapRoutes',
  ] as const;
  for (const s of stores) {
    const rows = payload[s] as unknown[] | undefined;
    if (Array.isArray(rows)) {
      const tx = db.transaction(s, 'readwrite');
      for (const row of rows) { await tx.store.put(row as never); count++; }
      await tx.done;
    }
  }
  return count;
}
