const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { createReadStream } = require('node:fs');
const { readdir, stat, writeFile } = require('node:fs/promises');
const { join } = require('node:path');

const stableTag = /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;

async function main(tag, directory) {
  assert(stableTag.test(tag) && directory, 'Usage: release-metadata.cjs vMAJOR.MINOR.PATCH DIR');
  const packages = [
    {
      name: `apocalypse-survival-web-${tag}.tar.gz`,
      platform: 'web',
      architecture: 'any',
      minimum: 'Service Worker and IndexedDB support',
      installation: 'static-hosting',
    },
    {
      name: `apocalypse-survival-windows-x64-${tag}-setup.exe`,
      platform: 'windows',
      architecture: 'x64',
      minimum: 'Windows 10',
      installation: 'manual-nsis',
    },
    {
      name: `apocalypse-survival-android-${tag}.apk`,
      platform: 'android',
      architecture: 'universal',
      minimum: 'Android 5.1 (API 22; packaged minimum)',
      installation: 'system-apk-installer',
      signature: 'Android APK signer',
    },
  ];

  const expected = packages.map(({ name }) => name);
  const entries = await readdir(directory);
  assert.deepEqual(entries.sort(), expected.sort(), 'Unexpected release package list');
  const assets = await Promise.all(
    packages.map(async (description) => {
      const path = join(directory, description.name);
      const { size } = await stat(path);
      assert(size > 0, `Empty release package: ${description.name}`);
      const hash = createHash('sha256');
      for await (const chunk of createReadStream(path)) hash.update(chunk);
      return { ...description, size, sha256: hash.digest('hex') };
    }),
  );
  const metadata = {
    schemaVersion: 1,
    version: tag.slice(1),
    channel: 'stable',
    mandatory: false,
    assets,
  };
  const json = `${JSON.stringify(metadata, null, 2)}\n`;
  await writeFile(join(directory, 'release-metadata.json'), json);
  const metadataHash = createHash('sha256').update(json).digest('hex');
  const checksums = assets.map(({ name, sha256 }) => `${sha256}  ${name}`);
  checksums.push(`${metadataHash}  release-metadata.json`);
  await writeFile(join(directory, 'SHA256SUMS'), `${checksums.join('\n')}\n`);
}

main(process.argv[2], process.argv[3]).catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
