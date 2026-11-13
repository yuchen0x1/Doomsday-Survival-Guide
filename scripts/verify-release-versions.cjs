const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const version = JSON.parse(read('package.json')).version;
if (process.env.RELEASE_TAG) assert.equal(process.env.RELEASE_TAG, `v${version}`);
for (const file of [
  'apps/web/package.json',
  'apps/mobile/package.json',
  'apps/desktop/package.json',
  'apps/desktop/src-tauri/tauri.conf.json',
  'packages/core/package.json',
  'packages/knowledge-data/package.json',
]) {
  assert.equal(JSON.parse(read(file)).version, version, `${file} version mismatch`);
}
assert.equal(
  read('apps/desktop/src-tauri/Cargo.toml').match(/^version = "([^"]+)"/m)?.[1],
  version,
);
const gradle = read('apps/mobile/android/app/build.gradle');
assert.equal(gradle.match(/versionName "([^"]+)"/)?.[1], version);
const [major, minor, patch] = version.split('.').map(Number);
assert.equal(Number(gradle.match(/versionCode (\d+)/)?.[1]), major * 10000 + minor * 100 + patch);
console.log(`PASS: Web / Windows / Android versions match v${version}`);
