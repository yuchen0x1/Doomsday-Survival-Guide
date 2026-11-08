// 开发热重载启动器（无第三方依赖，跨平台）。
//
// 为什么不用纯 `tsx watch src/main.ts`：
//   tsx 基于 esbuild，不会 emit `design:paramtypes` 装饰器元数据，
//   会导致 NestJS 构造函数依赖注入失效（this.reflector 为 undefined，所有受保护请求报 INTERNAL_ERROR）。
//   因此必须先用 tsc 编译（保留元数据），再用 tsx 作为运行加载器热重载。
//
// 这里直接调用本地 node_modules 中的 tsc / tsx 可执行文件（不经过 pnpm exec，
// 以避免 pnpm 在脚本执行前触发安装对账）。用法：在 apps/api 目录下 `node dev.mjs`
// （根脚本 `pnpm api:start:dev` 已指向它）。

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, delimiter } from 'node:path';

const appDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(appDir, '..', '..');
const tscBin = join(appDir, 'node_modules', 'typescript', 'bin', 'tsc');
const tsxBin = join(appDir, 'node_modules', 'tsx', 'dist', 'cli.mjs');

// pnpm 严格布局下，编译产物 `require` 的「传递依赖」（如 express —— 由 @nestjs/platform-express 引入）
// 不在 apps/api/node_modules 顶层，而在仓库根的 .pnpm/node_modules（hoist 目录）。
// `pnpm start` 由 pnpm 运行脚本时自带解析，但本文件是直接 spawn node 跑 tsx，
// 缺少该解析路径会报 `Cannot find module 'express'`。故显式补进 NODE_PATH。
const hoistDir = join(repoRoot, 'node_modules', '.pnpm', 'node_modules');
const nodePath = [process.env.NODE_PATH, hoistDir].filter(Boolean).join(delimiter);

function run(args, extraEnv) {
  return spawn(process.execPath, args, {
    cwd: appDir,
    stdio: 'inherit',
    shell: false,
    env: { ...process.env, ...(extraEnv || {}) },
  });
}

// 1) 先完整编译一次，确保入口文件存在，再启动两个 watch 进程
const initial = run([tscBin, '-p', 'tsconfig.json']);

initial.on('exit', (code) => {
  if (code !== 0) {
    console.error('[dev] 初始 tsc 编译失败（退出码 ' + (code ?? 1) + '），中止启动');
    process.exit(code ?? 1);
  }

  console.log('[dev] 初始编译完成，启动 tsc --watch + tsx --watch ...');

  const tsc = run([tscBin, '-p', 'tsconfig.json', '--watch']);
  const serve = run([tsxBin, '--watch', 'dist/apps/api/src/main.js'], { NODE_PATH: nodePath });

  let stopping = false;
  const cleanup = () => {
    if (stopping) return;
    stopping = true;
    try { tsc.kill('SIGTERM'); } catch {}
    try { serve.kill('SIGTERM'); } catch {}
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  serve.on('exit', cleanup);
  tsc.on('exit', cleanup);
});
