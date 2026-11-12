/** 构建时由 apps/web/vite.config.ts 注入的应用版本。 */
export const APP_VERSION = __APP_VERSION__;

export function formatVersion(version: string): string {
  return version.startsWith('v') ? version : `v${version}`;
}
