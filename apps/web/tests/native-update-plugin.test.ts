import { expect, it, vi } from 'vitest';

const { registerPlugin } = vi.hoisted(() => ({
  registerPlugin: vi.fn(() => ({ openRelease: vi.fn() })),
}));

vi.mock('@capacitor/core', () => ({
  registerPlugin,
}));

it('shares one Android update plugin registration between the banner and settings', async () => {
  vi.resetModules();
  registerPlugin.mockClear();
  await import('../src/components/NativeUpdateBanner');
  await import('../src/components/NativeUpdateSettings');
  expect(registerPlugin).toHaveBeenCalledExactlyOnceWith('SurvivalUpdate');
});
