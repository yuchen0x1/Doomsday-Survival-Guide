import { describe, expect, it } from 'vitest';
import { formatUpdateTime, getInitialUpdateStatus } from '../src/lib/update-helpers';

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
});
