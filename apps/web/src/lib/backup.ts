import { type InventoryInput, validateInventory } from './inventory';

export const BACKUP_STORES = [
  'bookmarks',
  'history',
  'inventory',
  'transactions',
  'notes',
  'settings',
  'quizRecords',
  'offlinePackages',
  'conversations',
  'mapMarkers',
  'mapRoutes',
] as const;
export type BackupStore = (typeof BACKUP_STORES)[number];
export const MAX_BACKUP_BYTES = 25 * 1024 * 1024;
export const STORE_LABELS: Record<BackupStore, string> = {
  bookmarks: '收藏',
  history: '阅读历史',
  inventory: '物资',
  transactions: '物资流水',
  notes: '笔记',
  settings: '设置与档案',
  quizRecords: '学习记录',
  offlinePackages: '离线包',
  conversations: 'AI 会话',
  mapMarkers: '地图标记',
  mapRoutes: '地图路线',
};
type Row = Record<string, unknown>;
const object = (v: unknown): v is Row => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string';
const nonempty = (v: unknown) => text(v) && v.trim().length > 0;
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const strings = (v: unknown) => Array.isArray(v) && v.every(text);
const date = (v: unknown) => nonempty(v) && Number.isFinite(Date.parse(v as string));
const fields = (r: Row, keys: string[]) => keys.every((k) => text(r[k]));
const kinds = [
  'article',
  'plant',
  'animal',
  'insect',
  'medicine',
  'first_aid',
  'skill',
  'supply',
  'scenario',
  'hazard',
];
const point = (p: unknown) =>
  object(p) && finite(p.lat) && finite(p.lng) && Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180;

function validRow(store: BackupStore, r: Row): boolean {
  switch (store) {
    case 'inventory':
      try {
        validateInventory(r as unknown as InventoryInput);
      } catch {
        return false;
      }
      return (
        nonempty(r.supplyId) &&
        date(r.createdAt) &&
        date(r.updatedAt) &&
        (r.notes === undefined || text(r.notes))
      );
    case 'bookmarks':
      return (
        fields(r, ['refId', 'title']) &&
        kinds.includes(r.kind as string) &&
        strings(r.tags) &&
        date(r.createdAt) &&
        ['note', 'collection'].every((k) => r[k] === undefined || text(r[k]))
      );
    case 'history':
      return text(r.title) && kinds.includes(r.kind as string) && date(r.at);
    case 'notes':
      return (
        fields(r, ['title', 'body']) && strings(r.tags) && date(r.createdAt) && date(r.updatedAt)
      );
    case 'transactions':
      return nonempty(r.entryId) && finite(r.delta) && text(r.reason) && date(r.at);
    case 'quizRecords':
      return (
        nonempty(r.questionId) &&
        Number.isInteger(r.chosenIndex) &&
        (r.chosenIndex as number) >= 0 &&
        typeof r.correct === 'boolean' &&
        date(r.at)
      );
    case 'offlinePackages':
      return (
        fields(r, ['name', 'description', 'version']) &&
        strings(r.categorySlugs) &&
        finite(r.sizeBytes) &&
        r.sizeBytes >= 0 &&
        ['not_downloaded', 'downloading', 'downloaded', 'update_available'].includes(
          r.status as string,
        ) &&
        (r.progress === undefined || (finite(r.progress) && r.progress >= 0 && r.progress <= 100))
      );
    case 'conversations':
      return (
        text(r.title) &&
        date(r.createdAt) &&
        date(r.updatedAt) &&
        Array.isArray(r.messages) &&
        r.messages.every(
          (m) =>
            object(m) &&
            nonempty(m.id) &&
            ['user', 'assistant', 'tool'].includes(m.role as string) &&
            text(m.content) &&
            date(m.createdAt),
        )
      );
    case 'mapMarkers':
      return (
        point(r) &&
        text(r.name) &&
        ['water', 'shelter', 'danger', 'route', 'supply', 'custom'].includes(r.kind as string) &&
        typeof r.verified === 'boolean' &&
        typeof r.private === 'boolean' &&
        date(r.createdAt) &&
        (r.note === undefined || text(r.note))
      );
    case 'mapRoutes':
      return (
        text(r.name) &&
        Array.isArray(r.points) &&
        r.points.every(point) &&
        date(r.createdAt) &&
        (r.distanceMeters === undefined || (finite(r.distanceMeters) && r.distanceMeters >= 0))
      );
    case 'settings': {
      if (!Object.hasOwn(r, 'value')) return false;
      if (r.key === 'prefs')
        return (
          object(r.value) &&
          ['autoHistory', 'compactMode', 'showDangerL4', 'confirmDelete'].every(
            (k) =>
              r.value &&
              ((r.value as Row)[k] === undefined || typeof (r.value as Row)[k] === 'boolean'),
          )
        );
      if (r.key !== 'survival_profile' || r.value === null) return true;
      const p = r.value;
      return (
        object(p) &&
        fields(p, ['id', 'displayName', 'shelterPlan', 'notes']) &&
        Number.isInteger(p.householdSize) &&
        (p.householdSize as number) > 0 &&
        strings(p.skills) &&
        date(p.updatedAt) &&
        Array.isArray(p.contacts) &&
        p.contacts.every((c) => object(c) && fields(c, ['id', 'name', 'relation', 'phone']))
      );
    }
  }
}

/** Version 1 remains compatible; absent stores are left unchanged, malformed stores fail closed. */
export function parseBackup(json: string) {
  if (new TextEncoder().encode(json).length > MAX_BACKUP_BYTES)
    throw new Error('备份超过 25 MB，请使用较小的备份');
  let payload: unknown;
  try {
    payload = JSON.parse(json);
  } catch {
    throw new Error('无法读取 JSON 备份');
  }
  if (!object(payload) || payload.version !== 1) throw new Error('不支持的备份版本');
  const data: Partial<Record<BackupStore, Row[]>> = {};
  let count = 0;
  for (const store of BACKUP_STORES) {
    if (!Object.hasOwn(payload, store)) continue;
    const rows = payload[store];
    if (!Array.isArray(rows)) throw new Error(`${STORE_LABELS[store]}必须是列表`);
    const keys = new Set<string>();
    rows.forEach((row, index) => {
      const keyField = store === 'settings' ? 'key' : store === 'history' ? 'refId' : 'id';
      if (!object(row) || !nonempty(row[keyField]) || !validRow(store, row))
        throw new Error(`${STORE_LABELS[store]}第 ${index + 1} 条记录格式不正确`);
      const key = row[keyField] as string;
      if (keys.has(key)) throw new Error(`${STORE_LABELS[store]}存在重复标识`);
      keys.add(key);
    });
    count += rows.length;
    if (count > 100_000) throw new Error('备份记录超过 100000 条');
    data[store] = rows;
  }
  if (!Object.keys(data).length) throw new Error('备份中没有可识别的数据表');
  return {
    data,
    count,
    exportedAt: date(payload.exportedAt) ? (payload.exportedAt as string) : undefined,
  };
}
