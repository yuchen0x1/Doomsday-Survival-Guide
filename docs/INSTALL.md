# 安装指南（INSTALL）

> 适用于在本地搭建 APOCALYPSE SURVIVAL 的完整开发环境。部署到服务器请见 [DEPLOYMENT.md](./DEPLOYMENT.md)，总览见 [../README.md](../README.md)。

## 1. 环境要求总表

| 组件 | 版本 | 是否必需 | 用途 |
| --- | --- | --- | --- |
| Node.js | >= 20（推荐 22 LTS） | 必需 | 前端构建、API 运行 |
| pnpm | 11（仓库声明 `pnpm@11.20.0`） | 必需 | workspace 依赖管理 |
| Docker + Docker Compose | 近期稳定版 | 后端必需 | 运行 PostgreSQL（也可用本机 PostgreSQL） |
| Rust（stable）+ Tauri 系统依赖 | 近期稳定版 | 桌面端可选 | `apps/desktop` 的 `tauri dev` / `cargo check` |
| Android SDK + JDK 17 | 近期稳定版 | Android 可选 | Capacitor `android/` 构建 |
| Xcode + CocoaPods | 近期稳定版 | iOS 可选（仅 macOS） | Capacitor `ios/` 构建 / `pod install` |
| Git | 任意近期版本 | 必需 | 获取仓库 |

> 只跑 Web 前端（离线知识浏览、搜索、练习、计算器等）**只需 Node + pnpm**，不需要 Docker / Rust / Android SDK。

## 2. 通用安装步骤

### 2.1 Node.js 22

任选一种：

```bash
# 方式 A：nvm（macOS / Linux）
nvm install 22
nvm use 22

# 方式 B：fnm（跨平台）
fnm install 22
fnm use 22

# 方式 C：Windows（winget）
winget install OpenJS.NodeJS.LTS

# 验证
node -v   # 应 >= 20
```

### 2.2 pnpm 11

仓库根 `package.json` 声明 `"packageManager": "pnpm@11.20.0"`，推荐用 Node 自带的 corepack 固定版本：

```bash
corepack enable
corepack prepare pnpm@11.20.0 --activate
pnpm -v   # 应为 11.x
```

也可全局安装：`npm i -g pnpm@11`。

### 2.3 安装依赖

```bash
# 在仓库根目录
pnpm install
```

`pnpm-workspace.yaml` 声明了 `packages/*` 与 `apps/*`，一次安装会链接全部 workspace。

## 3. 分平台安装

### 3.1 Windows 11

```powershell
# Node 22
winget install OpenJS.NodeJS.LTS
# pnpm 11
corepack enable
corepack prepare pnpm@11.20.0 --activate
# Docker Desktop（含 Compose）
winget install Docker.DockerDesktop
# Rust（桌面端可选）：https://rustup.rs 的 rustup-init.exe，默认 stable
rustup default stable
```

Windows 注意：

- Tauri 桌面端还需 **WebView2 Runtime**（Win11 通常已内置）与 **Microsoft C++ Build Tools**（VS Build Tools 的「使用 C++ 的桌面开发」工作负载）。
- 终端建议用 PowerShell 7 或 Git Bash；本文命令为跨平台写法，路径在 Bash 中请用正斜杠。

桌面端验证（无需完整打包）：

```bash
cd apps/desktop/src-tauri
cargo check
```

### 3.2 macOS

```bash
# Homebrew
brew install node@22
brew install --cask docker          # 或已安装 Docker Desktop
# pnpm
corepack enable
corepack prepare pnpm@11.20.0 --activate
# Rust（桌面端可选）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# iOS（可选）
sudo gem install cocoapods
```

iOS 平台目录已生成；`pod install` 需在 macOS 上执行，Windows 无 CocoaPods 时跳过属预期（见 [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)）。

### 3.3 Linux（Debian / Ubuntu）

```bash
# Node 22（NodeSource 或 nvm，示例用 nvm）
nvm install 22 && nvm use 22
# pnpm
corepack enable
corepack prepare pnpm@11.20.0 --activate
# Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
sudo usermod -aG docker "$USER"   # 重新登录生效
# Rust（桌面端可选）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Tauri 系统依赖（桌面端可选）
sudo apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

## 4. 各端 dev 启动

### 4.1 Web（最常用）

```bash
pnpm dev                 # 等价 pnpm --filter @apocalypse/web dev，Vite :5173
# 或
pnpm --filter @apocalypse/web dev
```

打开 `http://localhost:5173`。dev 下 `/api` 由 `apps/web/vite.config.ts` 代理到 `http://localhost:3000`。

### 4.2 API + PostgreSQL

```bash
# 1. 复制环境变量模板并按需修改（后端读根 .env 或 apps/api/.env）
cp .env.example .env
# 2. 启动 PostgreSQL（只起 postgres，不触发 adminer 镜像拉取）
docker compose up -d postgres
#    校验 compose 文件语法：docker compose config
#    若本机 Docker 不可用（如安全策略拦截 wsl.exe / sc.exe），可用嵌入式 PostgreSQL
#    （io.zonky.test:embedded-postgres）免 Docker 拉起真实 PG，详见 TEST_REPORT.md 第 7.1 节
# 3. 生成 Prisma Client、建表、灌种子
pnpm --filter @apocalypse/api prisma:generate
pnpm db:migrate
pnpm db:seed
# 4. 启动 API 开发服务器
pnpm api:start:dev
# 或生产式启动（需先 pnpm build:api）
pnpm api:start
```

- API：`http://localhost:3000/api`
- Swagger：`http://localhost:3000/api/docs`
- 健康检查：`http://localhost:3000/api/health`

> AI 助手需在 `.env` 配置 `AI_API_KEY`；未配置时接口按设计返回不可用 / 降级，前端自动回退本地检索（见 [API.md](./API.md)）。

### 4.3 桌面端（Tauri 2）

```bash
pnpm --filter @apocalypse/desktop dev       # tauri dev
# Rust 侧静态检查（不打包）
cd apps/desktop/src-tauri && cargo check
# 完整 release 打包（需签名/系统依赖，当前未执行）
pnpm --filter @apocalypse/desktop build      # tauri build
```

### 4.4 移动端（Capacitor 6）

`capacitor.config.ts` 的 `webDir: '../web/dist'`，先产出 Web 构建再同步：

```bash
pnpm build                                  # 生成 apps/web/dist
pnpm --filter @apocalypse/mobile sync       # cap sync
pnpm --filter @apocalypse/mobile android    # cap sync android
pnpm --filter @apocalypse/mobile ios        # cap sync ios（macOS）
```

首次生成平台目录（已生成则可跳过）：

```bash
cd apps/mobile
pnpm exec cap add android
pnpm exec cap add ios
```

真机构建：

```bash
cd apps/mobile/android && ./gradlew assembleDebug      # Android
cd apps/mobile/ios/App && pod install                  # iOS（仅 macOS + CocoaPods）
```

## 5. 验证安装

```bash
pnpm typecheck      # pnpm -r typecheck
pnpm test           # pnpm -r test（vitest）
pnpm build          # packages/* + web
```

阶段实测结论见 [TEST_REPORT.md](./TEST_REPORT.md)。

## 6. 常见安装故障排查

| 症状 | 可能原因 | 处理 |
| --- | --- | --- |
| `corepack: command not found` | Node 版本过旧或未带 corepack | 升级到 Node 22，或 `npm i -g corepack` 后再 `corepack enable` |
| `pnpm` 版本不是 11 | 全局装了其他版本 | `corepack prepare pnpm@11.20.0 --activate`，确保 `packageManager` 生效 |
| `ERR_PNPM_UNSUPPORTED_ENGINE` | Node < 20 | `node -v` 确认 >= 20，推荐 22 LTS |
| `pnpm install` 卡在 esbuild / sharp 构建 | pnpm 11 默认拦截构建脚本 | 仓库 `pnpm-workspace.yaml` 已用 `allowBuilds` 放行所需原生依赖，确认未被覆盖 |
| Vite dev 打开空白 / 资源 404 | 未先 `pnpm install` 或端口占用 | 重装依赖；`5173` 被占用时改 `apps/web/vite.config.ts` 的 `server.port` |
| `/api/*` 返回 502/404 | 后端未启动，dev 代理目标 :3000 无服务 | 先 `docker compose up -d postgres` + `pnpm api:start:dev`；仅浏览知识则无需后端 |
| `prisma migrate dev` / `prisma db seed` 报 P1001 | PostgreSQL 未起或 `DATABASE_URL` 不匹配 | `docker compose ps` 确认 `postgres` 为 healthy；核对 `.env` 的 `DATABASE_URL`（默认 `postgresql://survival:survival@localhost:5432/apocalypse_survival`） |
| `docker compose up -d postgres` 报 `failed to connect to the docker API ... npipe:////./pipe/dockerDesktopLinuxEngine` | Docker Desktop daemon 未运行 | 启动 Docker Desktop 后再试；若 `docker desktop start` 依赖的 `wsl.exe` / `sc.exe` 被安全策略拦截，需由管理员放开策略或改用本机独立 PostgreSQL（当前环境见 [TEST_REPORT.md](./TEST_REPORT.md)「真实 PostgreSQL 集成验证受阻」） |
| `start:dev` 路由 Mapped 后崩溃、未进入 listen | `PrismaService.onModuleInit` 的 `$connect()` 报 P1001（数据库连不上） | 同上，先让 PostgreSQL 可达；路由表已打印说明 Nest 路由注册本身正常 |
| 所有受保护请求返回 `INTERNAL_ERROR: Cannot read properties of undefined (reading 'getAllAndOverride')` | 用 `tsx watch src/main.ts` 直接跑源码：`tsx`(esbuild) 不 emit 装饰器元数据，NestJS DI 失效 | 必须用 `pnpm api:start`（tsc 产物 + tsx 加载）或 `pnpm api:start:dev`，不要把 `start` 改回纯 `tsx watch`；详见 TEST_REPORT.md 第 7.4 节 |
| `prisma: command not found` | 用根命令直接调 Prisma | 用 `pnpm --filter @apocalypse/api prisma:xxx` 或根封装 `pnpm db:xxx` |
| `tauri dev` 报 WebView2 / 系统库缺失 | 缺 Tauri 系统依赖 | Windows 装 WebView2 Runtime + C++ Build Tools；Linux 装 `libwebkit2gtk-4.1-dev` 等（见 3.3） |
| `cargo check` 失败 | Rust 工具链或缓存问题 | `rustup default stable`、`cargo update`，重跑；完整 `tauri build` 未执行属已知项 |
| `cap add ios` / `pod install` 失败 | 在 Windows 上无 CocoaPods | 属预期；iOS 构建需 macOS + Xcode + CocoaPods（见 [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)） |
| Android 构建找不到 SDK | 未配置 `ANDROID_HOME` / JDK | 安装 Android SDK + JDK 17，设置 `ANDROID_HOME` 并把 `platform-tools` 加入 PATH |
| PWA 不出现「安装」 | 非 HTTPS / 非 localhost | Service Worker 仅安全上下文生效，见 [DEPLOYMENT.md](./DEPLOYMENT.md) |
| 前端报 AI 服务不可用 | 未配置 `AI_API_KEY` | 属设计内降级；填好服务端 `.env` 的 `AI_API_KEY` 后重启 API |

## 7. 相关文档

- [../README.md](../README.md) · [DEPLOYMENT.md](./DEPLOYMENT.md) · [BACKUP.md](./BACKUP.md) · [API.md](./API.md) · [TEST_REPORT.md](./TEST_REPORT.md) · [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)
