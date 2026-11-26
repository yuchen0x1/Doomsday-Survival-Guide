import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dismissNativeRelease, watchNativeRelease } from '../src/lib/native-release-watch';

const CHECK_KEY = 'apocalypse-survival:native-update-check';
const now = Date.parse('2026-11-26T12:00:00Z');
const tag = 'v1.10.0';
const name = `apocalypse-survival-android-${tag}.apk`;
const release = {
  tag_name: tag,
  draft: false,
  prerelease: false,
  published_at: '2026-11-26T10:00:00Z',
  assets: [
    {
      name,
      browser_download_url: `https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/download/${tag}/${name}`,
      state: 'uploaded',
      size: 2048,
    },
  ],
};

let storage: Map<string, string>;
let browser: EventTarget;
let page: EventTarget;
let network: { onLine: boolean };
let stop: (() => void) | undefined;
const fetchMock = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  storage = new Map();
  browser = new EventTarget();
  page = new EventTarget();
  network = { onLine: true };
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
    addEventListener: browser.addEventListener.bind(browser),
    removeEventListener: browser.removeEventListener.bind(browser),
    setInterval,
    clearInterval,
  });
  vi.stubGlobal('document', {
    visibilityState: 'visible',
    addEventListener: page.addEventListener.bind(page),
    removeEventListener: page.removeEventListener.bind(page),
  });
  vi.stubGlobal('navigator', network);
  fetchMock.mockReset().mockImplementation(async () => Response.json(release));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  stop?.();
  stop = undefined;
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function start() {
  const onRelease = vi.fn();
  stop = watchNativeRelease({ version: '1.9.9', platform: 'android', onRelease });
  return onRelease;
}

describe('native release automatic checks', () => {
  it('checks after an offline startup reconnects', async () => {
    network.onLine = false;
    const onRelease = start();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(storage.has(CHECK_KEY)).toBe(false);
    network.onLine = true;
    browser.dispatchEvent(new Event('online'));
    await vi.advanceTimersByTimeAsync(0);
    expect(onRelease).toHaveBeenCalledWith(expect.objectContaining({ tag }));
    expect(storage.get(CHECK_KEY)).toBe(String(now));
  });

  it('retries failures after five minutes instead of suppressing checks for a day', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network unavailable'));
    const onRelease = start();
    await vi.advanceTimersByTimeAsync(0);
    expect(storage.has(CHECK_KEY)).toBe(false);
    browser.dispatchEvent(new Event('focus'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5 * 60_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onRelease).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60 * 60_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not mark a cancelled mount as successfully checked', async () => {
    let resolveFirst: ((value: Response) => void) | undefined;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveFirst = resolve;
        }),
    );
    const first = start();
    stop?.();
    resolveFirst?.(Response.json(release));
    await vi.advanceTimersByTimeAsync(0);
    expect(first).not.toHaveBeenCalled();
    expect(storage.has(CHECK_KEY)).toBe(false);
    const next = start();
    await vi.advanceTimersByTimeAsync(0);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('ignores a future persisted timestamp after the device clock changes', async () => {
    storage.set(CHECK_KEY, String(now + 7 * 24 * 60 * 60_000));
    const onRelease = start();
    await vi.advanceTimersByTimeAsync(0);
    expect(onRelease).toHaveBeenCalledTimes(1);
  });

  it('honors a successful daily check and the dismissed version', async () => {
    storage.set(CHECK_KEY, String(now));
    dismissNativeRelease(tag);
    const onRelease = start();
    await vi.advanceTimersByTimeAsync(23 * 60 * 60_000);
    expect(fetchMock).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(60 * 60_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onRelease).not.toHaveBeenCalled();
  });
});
