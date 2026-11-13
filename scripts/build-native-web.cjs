const { spawnSync } = require('node:child_process');
const path = require('node:path');

const result = spawnSync('pnpm', ['build'], {
  cwd: path.resolve(__dirname, '..'),
  env: { ...process.env, VITE_NATIVE_BUILD: '1', VITE_BASE_PATH: '/' },
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
