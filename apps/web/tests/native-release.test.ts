import { describe, expect, it } from 'vitest';
import { parseNativeRelease } from '../src/lib/native-release';

const tag = 'v1.10.0';
const name = `apocalypse-survival-android-${tag}.apk`;
const asset = {
  name,
  browser_download_url: `https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/download/${tag}/${name}`,
  state: 'uploaded',
  size: 2048,
};
const stable = {
  tag_name: tag,
  draft: false,
  prerelease: false,
  published_at: '2026-11-18T12:00:00Z',
  assets: [asset],
  body: '修复与改进',
};

describe('native release discovery', () => {
  it('compares numeric versions and exposes only the matching official package', () => {
    expect(parseNativeRelease(stable, '1.9.9', 'android')).toMatchObject({
      tag,
      bytes: 2048,
      notes: '修复与改进',
    });
    expect(parseNativeRelease(stable, '1.10.0', 'android')).toBeNull();
    expect(parseNativeRelease(stable, '2.0.0', 'android')).toBeNull();
    expect(() => parseNativeRelease(stable, '1.9.9', 'windows')).toThrow('安装包');
  });

  it('rejects previews and invalid release metadata', () => {
    expect(() => parseNativeRelease({ ...stable, draft: true }, '1.9.9', 'android')).toThrow();
    expect(() => parseNativeRelease({ ...stable, prerelease: true }, '1.9.9', 'android')).toThrow();
    expect(() =>
      parseNativeRelease({ ...stable, tag_name: 'v1.2.0-rc.1' }, '1.9.9', 'android'),
    ).toThrow();
    expect(() =>
      parseNativeRelease(
        {
          ...stable,
          assets: [{ ...asset, browser_download_url: 'https://example.com/update.apk' }],
        },
        '1.9.9',
        'android',
      ),
    ).toThrow('安装包');
  });
});
