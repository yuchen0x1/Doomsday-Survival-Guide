import { registerPlugin } from '@capacitor/core';
import { invoke } from '@tauri-apps/api/core';
import { detectPlatform } from './platform';

const nativeFiles = registerPlugin<{
  saveText(options: { content: string; filename: string; mimeType: string }): Promise<{
    saved: boolean;
  }>;
}>('SurvivalFiles');

/** Native saves finish only after the system picker confirms; cancellation is not success. */
export async function downloadText(
  content: string,
  filename: string,
  type: string,
): Promise<boolean> {
  const platform = detectPlatform();
  if (platform === 'desktop') {
    return invoke<boolean>('save_text_file', { content, filename });
  }
  if (platform === 'mobile') {
    const result = await nativeFiles.saveText({ content, filename, mimeType: type.split(';')[0] });
    return result.saved;
  }
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
