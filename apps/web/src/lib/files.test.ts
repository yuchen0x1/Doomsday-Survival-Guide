import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  platform: 'web',
  invoke: vi.fn(),
  saveText: vi.fn(),
  click: vi.fn(),
  revoke: vi.fn(),
}));
vi.mock('@capacitor/core', () => ({ registerPlugin: () => ({ saveText: mocks.saveText }) }));
vi.mock('@tauri-apps/api/core', () => ({ invoke: mocks.invoke }));
vi.mock('./platform', () => ({ detectPlatform: () => mocks.platform }));

import { downloadText } from './files';

describe('platform file export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.platform = 'web';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });
  it('waits for a desktop save and preserves cancellation', async () => {
    mocks.platform = 'desktop';
    mocks.invoke.mockResolvedValue(false);
    expect(await downloadText('备份', 'data.json', 'application/json')).toBe(false);
    expect(mocks.invoke).toHaveBeenCalledWith('save_text_file', {
      content: '备份',
      filename: 'data.json',
    });
    expect(mocks.saveText).not.toHaveBeenCalled();
  });
  it('passes UTF-8 contents and a plain MIME type to Android', async () => {
    mocks.platform = 'mobile';
    mocks.saveText.mockResolvedValue({ saved: true });
    expect(await downloadText('\ufeff名称,数量\n水,2', '补货.csv', 'text/csv;charset=utf-8')).toBe(
      true,
    );
    expect(mocks.saveText).toHaveBeenCalledWith({
      content: '\ufeff名称,数量\n水,2',
      filename: '补货.csv',
      mimeType: 'text/csv',
    });
  });
  it('does not report Android cancellation as a completed export', async () => {
    mocks.platform = 'mobile';
    mocks.saveText.mockResolvedValue({ saved: false });
    expect(await downloadText('{}', 'backup.json', 'application/json')).toBe(false);
  });
  it('propagates native write failures so the UI can display them', async () => {
    mocks.platform = 'mobile';
    mocks.saveText.mockRejectedValue(new Error('只读存储'));
    await expect(downloadText('{}', 'backup.json', 'application/json')).rejects.toThrow('只读存储');
  });
  it('keeps browser downloads usable until after the click', async () => {
    vi.useFakeTimers();
    const link = { click: mocks.click, href: '', download: '' };
    vi.stubGlobal('document', { createElement: () => link });
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:test', revokeObjectURL: mocks.revoke });
    expect(await downloadText('{}', 'backup.json', 'application/json')).toBe(true);
    expect(link.download).toBe('backup.json');
    expect(mocks.click).toHaveBeenCalledOnce();
    expect(mocks.revoke).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(mocks.revoke).toHaveBeenCalledWith('blob:test');
  });
});
