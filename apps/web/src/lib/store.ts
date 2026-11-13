import type {
  Bookmark,
  BookmarkKind,
  DangerLevel,
  InventoryEntry,
  InventoryTransaction,
  ReadingHistoryItem,
  UserNote,
} from '@apocalypse/core';
import { create } from 'zustand';
import * as db from './db';

export interface Toast {
  id: number;
  message: string;
  tone: 'info' | 'success' | 'warn' | 'error';
}

interface AppState {
  hydrated: boolean;
  loadError: boolean;
  online: boolean;
  bookmarks: Bookmark[];
  history: ReadingHistoryItem[];
  inventory: InventoryEntry[];
  transactions: InventoryTransaction[];
  notes: UserNote[];
  toasts: Toast[];
  /** AI 服务是否可用（服务端 /api/ai/health） */
  aiAvailable: boolean | null;

  hydrate: () => Promise<void>;
  setOnline: (v: boolean) => void;
  setAiAvailable: (v: boolean) => void;

  toast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;

  toggleBookmark: (input: { kind: BookmarkKind; refId: string; title: string }) => Promise<boolean>;
  updateBookmarkMeta: (id: string, patch: Partial<Bookmark>) => Promise<void>;
  removeBookmarkById: (id: string) => Promise<void>;

  addHistory: (item: { kind: BookmarkKind; refId: string; title: string }) => Promise<void>;
  clearHistory: () => Promise<void>;

  addInventory: (e: Omit<InventoryEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  changeInventoryQty: (id: string, delta: number, reason: string) => Promise<void>;
  editInventory: (id: string, patch: Partial<InventoryEntry>) => Promise<void>;
  removeInventory: (id: string) => Promise<void>;

  addNote: (n: Omit<UserNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editNote: (id: string, patch: Partial<UserNote>) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
}

let toastSeq = 1;

export const useApp = create<AppState>((set, get) => ({
  hydrated: false,
  loadError: false,
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  bookmarks: [],
  history: [],
  inventory: [],
  transactions: [],
  notes: [],
  toasts: [],
  aiAvailable: null,

  hydrate: async () => {
    try {
      const [bookmarks, history, inventory, transactions, notes] = await Promise.all([
        db.listBookmarks(),
        db.listHistory(),
        db.listInventory(),
        db.listTransactions(),
        db.listNotes(),
      ]);
      set({ bookmarks, history, inventory, transactions, notes, hydrated: true, loadError: false });
    } catch (err) {
      console.error('本地数据加载失败', err);
      set({ hydrated: true, loadError: true });
    }
  },

  setOnline: (v) => set({ online: v }),
  setAiAvailable: (v) => set({ aiAvailable: v }),

  toast: (message, tone = 'info') => {
    const id = toastSeq++;
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    setTimeout(() => get().dismissToast(id), 3600);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  toggleBookmark: async ({ kind, refId, title }) => {
    const existing = get().bookmarks.find((b) => b.refId === refId);
    if (existing) {
      await db.removeBookmark(existing.id);
      set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== existing.id) }));
      get().toast('已取消收藏', 'info');
      return false;
    }
    const created = await db.addBookmark({ kind, refId, title, tags: [] });
    set((s) => ({ bookmarks: [created, ...s.bookmarks] }));
    get().toast('已加入收藏', 'success');
    return true;
  },

  updateBookmarkMeta: async (id, patch) => {
    await db.updateBookmark(id, patch);
    set((s) => ({ bookmarks: s.bookmarks.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  },

  removeBookmarkById: async (id) => {
    await db.removeBookmark(id);
    set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) }));
  },

  addHistory: async (item) => {
    const prefs = await db.getSetting('prefs', { autoHistory: true });
    if (prefs.autoHistory === false) return;
    await db.pushHistory(item);
    const history = await db.listHistory();
    set({ history });
  },
  clearHistory: async () => {
    await db.clearHistory();
    set({ history: [] });
  },

  addInventory: async (e) => {
    await db.addInventory(e);
    set({ inventory: await db.listInventory() });
  },
  changeInventoryQty: async (id, delta, reason) => {
    await db.changeInventoryQuantity(id, delta, reason);
    set({ inventory: await db.listInventory(), transactions: await db.listTransactions() });
  },
  editInventory: async (id, patch) => {
    await db.updateInventory(id, patch);
    set({ inventory: await db.listInventory(), transactions: await db.listTransactions() });
  },
  removeInventory: async (id) => {
    await db.removeInventory(id);
    set({ inventory: await db.listInventory() });
  },

  addNote: async (n) => {
    await db.addNote(n);
    set({ notes: await db.listNotes() });
  },
  editNote: async (id, patch) => {
    await db.updateNote(id, patch);
    set({ notes: await db.listNotes() });
  },
  removeNote: async (id) => {
    await db.removeNote(id);
    set({ notes: await db.listNotes() });
  },
}));

/** 危险等级 → 徽章配色 class */
export function dangerClass(level: DangerLevel): string {
  switch (level) {
    case 'L0':
      return 'text-[var(--color-info)]';
    case 'L1':
      return 'text-[var(--color-sand)]';
    case 'L2':
      return 'text-[var(--color-warn)]';
    case 'L3':
    case 'L4':
      return 'text-[var(--color-danger)]';
  }
}
