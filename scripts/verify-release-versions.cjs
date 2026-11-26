const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const version = JSON.parse(read('package.json')).version;
assert.match(version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);
if (process.env.RELEASE_TAG) assert.equal(process.env.RELEASE_TAG, `v${version}`);
for (const file of [
  'apps/web/package.json',
  'apps/api/package.json',
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
assert.equal(
  read('apps/desktop/src-tauri/Cargo.lock').match(
    /^name = "apocalypse-desktop"\r?\nversion = "([^"]+)"/m,
  )?.[1],
  version,
);
const gradle = read('apps/mobile/android/app/build.gradle');
assert.equal(gradle.match(/versionName "([^"]+)"/)?.[1], version);
const [major, minor, patch] = version.split('.').map(Number);
const buildNumber = major * 10000 + minor * 100 + patch;
assert.equal(Number(gradle.match(/versionCode (\d+)/)?.[1]), buildNumber);

const ios = read('apps/mobile/ios/App/App.xcodeproj/project.pbxproj');
const marketingVersions = [...ios.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map((m) => m[1]);
assert(marketingVersions.length > 0, 'iOS MARKETING_VERSION missing');
assert(
  marketingVersions.every((value) => value === version),
  'iOS MARKETING_VERSION mismatch',
);
const iosBuildNumbers = [...ios.matchAll(/CURRENT_PROJECT_VERSION = ([^;]+);/g)].map((m) =>
  Number(m[1]),
);
assert(iosBuildNumbers.length > 0, 'iOS CURRENT_PROJECT_VERSION missing');
assert(
  iosBuildNumbers.every((value) => value === buildNumber),
  'iOS CURRENT_PROJECT_VERSION mismatch',
);
console.log(
  `PASS: Web / Windows / Android / iOS versions match v${version} (build ${buildNumber})`,
);
