import { describe, expect, it } from 'vitest';
import {
  formatUpdateTime,
  getInitialUpdateStatus,
  isUpdateCheckDue,
} from '../src/lib/update-helpers';

describe('PWA update helpers', () => {
  it('keeps development and unsupported environments non-blocking', () => {
    expect(getInitialUpdateStatus({ isDev: true, hasServiceWorker: false })).toBe('ready');
    expect(getInitialUpdateStatus({ isDev: false, hasServiceWorker: false })).toBe('unsupported');
    expect(getInitialUpdateStatus({ isDev: false, hasServiceWorker: true, isOnline: false })).toBe(
      'offline',
    );
  });

  it('starts an online production check when Service Worker is available', () => {
    expect(getInitialUpdateStatus({ isDev: false, hasServiceWorker: true })).toBe('checking');
  });

  it('formats an absent check timestamp without throwing', () => {
    expect(formatUpdateTime(null)).toBe('尚未检查');
  });

  it('handles an invalid persisted timestamp without throwing', () => {
    expect(formatUpdateTime('not-a-date')).toBe('时间格式无效');
  });

  it('retries unsuccessful checks after five minutes without waiting a whole daily interval', () => {
    const now = Date.parse('2026-11-27T00:00:00Z');
    const input = { now, intervalMs: 86_400_000, lastSuccessfulAt: 0 };
    expect(isUpdateCheckDue({ ...input, lastAttemptAt: now - 60_000 })).toBe(false);
    expect(isUpdateCheckDue({ ...input, lastAttemptAt: now - 5 * 60_000 })).toBe(true);
    expect(isUpdateCheckDue({ ...input, lastAttemptAt: 0, lastSuccessfulAt: now - 60_000 })).toBe(
      false,
    );
  });

  it('ignores invalid/future timestamps and preserves manual-only checks', () => {
    const now = Date.parse('2026-11-27T00:00:00Z');
    const input = { now, intervalMs: 86_400_000, lastAttemptAt: 0 };
    expect(isUpdateCheckDue({ ...input, lastSuccessfulAt: Number.NaN })).toBe(true);
    expect(isUpdateCheckDue({ ...input, lastSuccessfulAt: now + 86_400_000 })).toBe(true);
    expect(isUpdateCheckDue({ ...input, lastSuccessfulAt: 0, intervalMs: 0 })).toBe(false);
  });
});
