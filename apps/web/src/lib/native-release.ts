const REPOSITORY = 'yuchen0x1/Doomsday-Survival-Guide';
const STABLE_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export type NativeReleasePlatform = 'windows' | 'android';

export interface NativeRelease {
  tag: string;
  publishedAt: string;
  notes: string;
  bytes: number;
}

function versionParts(version: string): number[] {
  const parts = STABLE_VERSION.exec(version)?.slice(1).map(Number);
  if (!parts || !parts.every(Number.isSafeInteger)) throw new Error('版本号格式错误');
  return parts;
}

export function parseNativeRelease(
  result: unknown,
  currentVersion: string,
  platform: NativeReleasePlatform,
): NativeRelease | null {
  if (!result || typeof result !== 'object') throw new Error('GitHub 发布信息格式错误');
  const {
    tag_name: tag,
    draft,
    prerelease,
    published_at,
    assets,
    body,
  } = result as Record<string, unknown>;
  if (
    typeof tag !== 'string' ||
    !tag.startsWith('v') ||
    draft !== false ||
    prerelease !== false ||
    typeof published_at !== 'string' ||
    !Number.isFinite(Date.parse(published_at)) ||
    !Array.isArray(assets)
  )
    throw new Error('GitHub 稳定版信息不完整');

  const latest = versionParts(tag.slice(1));
  const current = versionParts(currentVersion);
  const delta = latest.map((part, index) => part - current[index]).find((part) => part !== 0);
  if (!delta || delta < 0) return null;

  const name =
    platform === 'windows'
      ? `apocalypse-survival-windows-x64-${tag}-setup.exe`
      : `apocalypse-survival-android-${tag}.apk`;
  const url = `https://github.com/${REPOSITORY}/releases/download/${tag}/${name}`;
  const asset = assets.find(
    (item) =>
      item?.name === name &&
      item.browser_download_url === url &&
      item.state === 'uploaded' &&
      Number.isSafeInteger(item.size) &&
      item.size > 0,
  );
  if (!asset) throw new Error('最新版本缺少当前平台的安装包');
  return {
    tag,
    publishedAt: published_at,
    notes: typeof body === 'string' ? body.slice(0, 2000) : '',
    bytes: asset.size,
  };
}

export async function checkNativeRelease(
  version: string,
  platform: NativeReleasePlatform,
): Promise<NativeRelease | null> {
  const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json' },
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('无法获取发行信息，请稍后重试');
  return parseNativeRelease(await response.json(), version, platform);
}
