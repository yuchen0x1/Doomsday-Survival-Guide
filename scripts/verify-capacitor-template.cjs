const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { createRequire } = require('node:module');
const path = require('node:path');
const test = require('node:test');

test('Capacitor templates extract with the patched tar dependency', async () => {
  const root = path.resolve(__dirname, '..');
  const cliRequire = createRequire(
    await fs.realpath(path.join(root, 'apps/mobile/node_modules/@capacitor/cli/package.json')),
  );
  const tar = cliRequire('tar');
  const { extractTemplate } = cliRequire('./dist/util/template.js');
  const results = path.join(root, 'test-results');
  await fs.mkdir(results, { recursive: true });
  const fixture = await fs.mkdtemp(path.join(results, 'capacitor-template-'));
  try {
    await fs.mkdir(path.join(fixture, 'input'));
    await fs.writeFile(path.join(fixture, 'input', 'sentinel.txt'), 'release-check');
    const archive = path.join(fixture, 'fixture.tar.gz');
    await tar.create({ file: archive, cwd: path.join(fixture, 'input'), gzip: true }, [
      'sentinel.txt',
    ]);
    await extractTemplate(archive, path.join(fixture, 'output'));
    assert.equal(
      await fs.readFile(path.join(fixture, 'output', 'sentinel.txt'), 'utf8'),
      'release-check',
    );
  } finally {
    assert.ok(fixture.startsWith(`${results}${path.sep}`));
    await fs.rm(fixture, { recursive: true, force: true });
  }
});
