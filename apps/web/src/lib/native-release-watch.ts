import {
  checkNativeRelease,
  type NativeRelease,
  type NativeReleasePlatform,
} from './native-release';
import { isUpdateCheckDue } from './update-helpers';

const CHECK_KEY = 'apocalypse-survival:native-update-check';
const DISMISSED_KEY = 'apocalypse-survival:native-update-dismissed';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Checks still work when the browser restricts local storage.
  }
}

export function dismissNativeRelease(tag: string): void {
  writeStorage(DISMISSED_KEY, tag);
}

/** Retry a failed/offline startup check without treating it as a successful daily check. */
export function watchNativeRelease({
  version,
  platform,
  onRelease,
}: {
  version: string;
  platform: NativeReleasePlatform;
  onRelease: (release: NativeRelease) => void;
}): () => void {
  let disposed = false;
  let checking = false;
  let lastAttemptAt = Number.NEGATIVE_INFINITY;
  let lastSuccessAt = Number(readStorage(CHECK_KEY));

  const check = async () => {
    if (disposed || checking || !navigator.onLine || document.visibilityState === 'hidden') return;
    const now = Date.now();
    if (
      !isUpdateCheckDue({
        lastAttemptAt,
        lastSuccessfulAt: lastSuccessAt,
        intervalMs: CHECK_INTERVAL_MS,
        now,
      })
    )
      return;
    lastAttemptAt = now;
    checking = true;
    try {
      const next = await checkNativeRelease(version, platform);
      if (disposed) return;
      lastSuccessAt = Date.now();
      writeStorage(CHECK_KEY, String(lastSuccessAt));
      if (next && readStorage(DISMISSED_KEY) !== next.tag) onRelease(next);
    } catch {
      // Offline/limited requests may retry; the settings page also offers a manual check.
    } finally {
      checking = false;
    }
  };
  const checkWhenVisible = () => void check();
  window.addEventListener('online', checkWhenVisible);
  window.addEventListener('focus', checkWhenVisible);
  document.addEventListener('visibilitychange', checkWhenVisible);
  const timer = window.setInterval(checkWhenVisible, 60_000);
  void check();
  return () => {
    disposed = true;
    window.clearInterval(timer);
    window.removeEventListener('online', checkWhenVisible);
    window.removeEventListener('focus', checkWhenVisible);
    document.removeEventListener('visibilitychange', checkWhenVisible);
  };
}
