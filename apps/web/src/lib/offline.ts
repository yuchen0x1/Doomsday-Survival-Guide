import type { OfflinePackage } from '@apocalypse/core';
import * as db from './db';
import { articles, firstAidGuides, plants, animals, skills } from './knowledge';

/**
 * 离线生存模式。
 * 核心知识随应用打包（Service Worker 预缓存），天然离线可用。
 * 离线包 = 可按分类增量"下载"的知识子集：
 *   下载 = 将该子集序列化写入 IndexedDB（模拟真实流量与体积）
 *   删除 = 移除本地副本
 *   更新 = 内容版本变化时标记 update_available
 */

export const BASE_PACKAGE_ID = 'base-core';

/** 首次安装的基础知识包（应用内置，无需下载） */
export const BASE_PACKAGE: OfflinePackage = {
  id: BASE_PACKAGE_ID,
  name: '基础知识包（内置）',
  description: '基础生存、饮水安全、急救核心、灾害应对、保暖与卫生 —— 随应用安装，永远离线可用',
  categorySlugs: ['basics', 'first-aid', 'disasters', 'water', 'weather'],
  sizeBytes: 0,
  version: '1.0.0',
  downloadedAt: new Date().toISOString(),
  status: 'downloaded',
};

/** 可下载的知识包定义 */
export interface PackageDef {
  id: string;
  name: string;
  description: string;
  categorySlugs: string[];
  version: string;
}

export const PACKAGE_DEFS: PackageDef[] = [
  { id: 'pkg-plants', name: '植物图鉴包', description: '42+ 种植物识别、毒性与易混淆物种', categorySlugs: ['plants'], version: '1.0.0' },
  { id: 'pkg-animals', name: '动物图鉴包', description: '野生动物识别、足迹痕迹与安全应对', categorySlugs: ['animals', 'insects'], version: '1.0.0' },
  { id: 'pkg-skills', name: '生存技能包', description: '庇护所、净水、绳结、方向判断等教程', categorySlugs: ['crafts'], version: '1.0.0' },
  { id: 'pkg-first-aid-full', name: '完整急救包', description: '全部急救指南与常见药物知识', categorySlugs: ['first-aid', 'medicines'], version: '1.0.0' },
  { id: 'pkg-disasters', name: '灾害应对包', description: '灾害场景模拟与危险预警记录', categorySlugs: ['disasters', 'hazards', 'geology'], version: '1.0.0' },
  { id: 'pkg-wilderness', name: '野外求生包', description: '野外求生、食物保存、农业种植', categorySlugs: ['wilderness', 'food-preservation', 'agriculture'], version: '1.0.0' },
  { id: 'pkg-tech', name: '技术维保包', description: '能源技术、机械维修、工具与制作', categorySlugs: ['energy', 'mechanics', 'tools', 'crafts'], version: '1.0.0' },
];

/** 计算某个包的真实序列化体积（字节） */
export function computePackageSize(def: PackageDef): number {
  const relevant = articles.filter((a) => def.categorySlugs.includes(a.categorySlug));
  const aid = firstAidGuides.filter((f) => def.categorySlugs.includes(f.categorySlug));
  const extra =
    def.id === 'pkg-plants' ? plants :
    def.id === 'pkg-animals' ? animals :
    def.id === 'pkg-skills' ? skills : [];
  const json = JSON.stringify({ relevant, aid, extra });
  return new TextEncoder().encode(json).length;
}

export interface PackageState extends OfflinePackage {
  def: PackageDef;
}

const KEY_PREFIX = 'pkgdata:';

export async function loadPackageStates(): Promise<PackageState[]> {
  const stored = await db.listOfflinePackages();
  const storedMap = new Map(stored.map((p) => [p.id, p]));
  const base: PackageState = { ...BASE_PACKAGE, def: { ...BASE_PACKAGE, categorySlugs: BASE_PACKAGE.categorySlugs, version: BASE_PACKAGE.version, description: BASE_PACKAGE.description, id: BASE_PACKAGE.id, name: BASE_PACKAGE.name } as unknown as PackageDef };
  const rest = PACKAGE_DEFS.map((def) => {
    const existing = storedMap.get(def.id);
    const sizeBytes = computePackageSize(def);
    if (!existing) {
      return { ...def, sizeBytes, status: 'not_downloaded' as const, def, version: def.version };
    }
    // 版本比较 → 可更新
    const status: OfflinePackage['status'] =
      existing.version !== def.version ? 'update_available' : existing.status === 'downloading' ? 'not_downloaded' : existing.status;
    return { ...existing, sizeBytes, status, def };
  });
  return [base as PackageState, ...rest];
}

/** 开始下载（写入 IndexedDB，带进度回调） */
export async function downloadPackage(
  def: PackageDef,
  onProgress: (pct: number) => void,
): Promise<void> {
  const data = JSON.stringify(articles.filter((a) => def.categorySlugs.includes(a.categorySlug)));
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    await new Promise((r) => setTimeout(r, 90 + Math.random() * 120));
    onProgress(Math.round((i / steps) * 100));
  }
  await db.setSetting(KEY_PREFIX + def.id, data);
  const pkg: OfflinePackage = {
    id: def.id, name: def.name, description: def.description,
    categorySlugs: def.categorySlugs, sizeBytes: computePackageSize(def),
    version: def.version, downloadedAt: new Date().toISOString(),
    status: 'downloaded', progress: 100,
  };
  await db.saveOfflinePackage(pkg);
}

export async function deletePackage(id: string): Promise<void> {
  await db.setSetting(KEY_PREFIX + id, null);
  const all = await db.listOfflinePackages();
  const pkg = all.find((p) => p.id === id);
  if (pkg) {
    await db.saveOfflinePackage({ ...pkg, status: 'not_downloaded', downloadedAt: undefined, progress: 0 });
  }
}

export async function updatePackage(def: PackageDef, onProgress: (pct: number) => void): Promise<void> {
  await deletePackage(def.id);
  await downloadPackage(def, onProgress);
}

/** 已下载包数量（首页统计用） */
export async function downloadedCount(): Promise<number> {
  const states = await loadPackageStates();
  return states.filter((s) => s.status === 'downloaded').length;
}

/** 估算剩余存储空间（浏览器 Storage API，不可用时返回 null） */
export async function estimateStorage(): Promise<{ usage: number; quota: number } | null> {
  if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
    const est = await navigator.storage.estimate();
    return { usage: est.usage ?? 0, quota: est.quota ?? 0 };
  }
  return null;
}

/* ---------------- 网络状态 ---------------- */

export function watchOnline(onChange: (online: boolean) => void): () => void {
  const up = () => onChange(true);
  const down = () => onChange(false);
  window.addEventListener('online', up);
  window.addEventListener('offline', down);
  return () => {
    window.removeEventListener('online', up);
    window.removeEventListener('offline', down);
  };
}
