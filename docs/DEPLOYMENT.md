# 部署指南（DEPLOYMENT）

> 面向把 Web + API + PostgreSQL 部署到一台服务器（或本机生产式运行）。本地开发安装见 [INSTALL.md](./INSTALL.md)，备份与恢复见 [BACKUP.md](./BACKUP.md)。

## 1. 部署架构概览

```text
浏览器 / PWA / Tauri / Capacitor
        │  HTTPS
        ▼
     Nginx :443
   ┌──────┴───────┐
   │              │
 静态文件        /api/* 反向代理
 apps/web/dist        │
 (含 SW 预缓存)       ▼
              NestJS API :3000
                    │
                    ▼
              PostgreSQL :5432
```

- **Web**：Vite 构建出的纯静态产物（`apps/web/dist`），含 Service Worker 预缓存；可由 Nginx / 任意静态托管直接提供。
- **API**：NestJS 11 + Prisma 6，监听 `API_PORT`（默认 `3000`），全局前缀 `/api`。
- **数据库**：PostgreSQL，连接串由 `DATABASE_URL` 提供。
- **AI**：API 作为服务端代理，密钥只存在服务端，前端不接触。

## 2. Docker Compose 起 PostgreSQL

仓库根提供 `docker-compose.yml`。**以该文件实际内容为准**；其参数与根 `.env.example` 一致：

| 项 | 值 |
| --- | --- |
| 服务名 / 容器名 | `postgres` / `apocalypse-postgres` |
| 镜像 | `postgres:16-alpine` |
| 用户 / 密码 | `survival` / `survival` |
| 数据库 | `apocalypse_survival` |
| 端口映射 | `5432:5432` |
| 数据卷 | `postgres-data`（Compose 项目名由目录推导，实际卷名可能为 `doomsdaysurvivalguide_postgres-data`，以 `docker volume ls` / compose 为准） |
| `DATABASE_URL` | `postgresql://survival:survival@localhost:5432/apocalypse_survival` |
| 可选管理界面 | `adminer`（`tools` profile，`http://localhost:8080`） |

启动与检查：

```bash
# 仓库根目录
cp .env.example .env              # 首次；生产环境务必修改密钥
docker compose up -d postgres     # 只启动 postgres，不触发 adminer 镜像拉取
docker compose ps                 # 确认 healthy 状态
docker compose logs -f postgres   # 查看日志
# 连通性探测（容器内）
docker compose exec -T postgres psql -U survival -d apocalypse_survival -c 'SELECT 1;'
# 可选：启用 Adminer 数据库管理界面（http://localhost:8080）
docker compose --profile tools up -d adminer
```

> 根 `docker-compose.yml` 结构（**实际内容以该文件为准**）：

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: apocalypse-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: apocalypse_survival
      POSTGRES_USER: survival
      POSTGRES_PASSWORD: survival
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U survival"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 10s
  adminer:                        # 可选，profiles: ["tools"]
    image: adminer:latest
    profiles: ["tools"]
    ports:
      - "8080:8080"
    environment:
      ADMINER_DEFAULT_SERVER: postgres
    depends_on:
      postgres:
        condition: service_healthy
volumes:
  postgres-data:
```

> **连接主机注意**：上面 `DATABASE_URL` 用 `localhost:5432`，适用于 **API 运行在宿主机** 的场景。若把 API 也放进同一个 Compose 网络，需把主机名改为 compose 的**服务名**（`postgres`），并相应调整端口与 `ENABLE_CORS_WHITELIST` / `CORS_ORIGINS`。

## 3. 环境变量安全

完整清单见根 `.env.example`（复制为 `.env` 后填写）。**严禁把真实密钥提交到仓库或打包进前端 bundle**。

| 分组 | 变量 | 说明 |
| --- | --- | --- |
| 服务 | `API_PORT`、`NODE_ENV` | 默认 `3000` / `development` |
| 数据库 | `DATABASE_URL`、`SQLITE_PATH` | PostgreSQL 连接串；SQLite 为桌面端/开发回退 |
| 认证 | `JWT_SECRET`、`JWT_EXPIRES_IN`、`ADMIN_EMAIL`、`ADMIN_PASSWORD` | 生产必须替换 `JWT_SECRET`（>= 32 字节强随机）、改掉初始管理员密码 |
| AI | `AI_BASE_URL`、`AI_MODEL`、`AI_API_KEY`、`AI_TIMEOUT_MS`、`AI_RATE_LIMIT_PER_MIN` | 密钥仅服务端 |
| 存储 | `S3_ENDPOINT`、`S3_REGION`、`S3_BUCKET`、`S3_ACCESS_KEY_ID`、`S3_SECRET_ACCESS_KEY`、`S3_PUBLIC_BASE_URL` | 可选，图片与离线包托管 |
| 地图 | `MAP_TILE_URL`、`MAP_ATTRIBUTION` | OSM 兼容瓦片服务 |
| 限流/安全 | `API_RATE_LIMIT_PER_MIN`、`UPLOAD_MAX_BYTES`、`ENABLE_CORS_WHITELIST`、`CORS_ORIGINS` | 生产建议 `ENABLE_CORS_WHITELIST=true` 并收紧来源 |

安全红线：

- `AI_API_KEY` 只写入服务端 `.env`；前端只调 `/api/ai/chat`（SSE）与 `/api/ai/identify`，**不得**出现在 `apps/web`、`apps/desktop`、`apps/mobile` 的环境变量或产物里。
- `JWT_SECRET` 与各 `*_SECRET_ACCESS_KEY` 使用强随机值，按最小权限配置。
- 生产环境设置 `NODE_ENV=production`、`JWT_SECRET` 强随机、`ENABLE_CORS_WHITELIST=true`、`CORS_ORIGINS` 仅列可信域名。
- `.env` 加入 `.gitignore`（不随镜像/仓库分发）；容器环境优先用 secrets / 注入环境变量而非把文件打进镜像。

### AI 服务参数

| 项 | 值 |
| --- | --- |
| Base URL | `https://api.xiaomimimo.com/v1` |
| 模型 | `mimo-v2.6-Flash` |
| 协议 | OpenAI 兼容 `/chat/completions`（流式） |
| 密钥 | `AI_API_KEY`，只存服务端 `.env` |
| 超时 | `AI_TIMEOUT_MS`（默认 `60000`） |
| AI 限流 | `AI_RATE_LIMIT_PER_MIN`（默认 `20`） |
| 前端入口 | `POST /api/ai/chat`（SSE）、`POST /api/ai/identify`、`GET /api/ai/health`（健康检查） |

**无 Key 或离线**：`POST /api/ai/chat` 返回 `{"type":"error"}` 事件（不假装成功），前端 `apps/web/src/lib/ai.ts` 检测到不可用后调用 `localFallbackAnswer()`，输出明确标注「来自本地离线知识库检索」，**禁止伪造 AI 输出**。详见 [API.md](./API.md) 与 [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)。

## 4. 迁移与 seed

```bash
# 生成 Prisma Client（安装依赖后）
pnpm --filter @apocalypse/api prisma:generate

# 应用迁移（35 张表 / migration.sql）
pnpm db:migrate          # 等价 pnpm --filter @apocalypse/api prisma:migrate（prisma migrate dev）

# 灌入种子数据（prisma db seed → tsx prisma/seed.ts）
pnpm db:seed

# 可视化检查
pnpm db:studio
```

生产部署建议使用**非交互式**迁移（`prisma migrate deploy`）而非 `migrate dev`；当前仓库封装的 `db:migrate` 对应 `prisma migrate dev`，适合开发/初始化，生产请按 Prisma 规范替换为 `migrate deploy` 并保留迁移文件。迁移与种子脚本真实存在（`apps/api/prisma/`），是否已针对真实 PostgreSQL 全量跑通见 [TEST_REPORT.md](./TEST_REPORT.md)。

## 5. API 服务

```bash
# 构建（tsc 编译，保留 NestJS 所需的装饰器元数据）
pnpm build:api            # pnpm --filter @apocalypse/api build → tsc -p tsconfig.json
# 产物路径：apps/api/dist/apps/api/src/main.js（tsconfig rootDir 为仓库根，以把 path-mapped 的 workspace 包纳入同一编译）

# 运行（tsc 产物 + tsx 作为运行加载器，因 workspace 包 exports 指向 TS 源码）
pnpm api:start            # 需先 build:api
# 或开发热重载（tsc -w 编译 + tsx --watch 加载）
pnpm api:start:dev
```

> **重要（运行方式）**：API 必须以 **tsc 编译后的产物** 运行，不能直连 `tsx watch src/main.ts` 跑源码。原因：`tsx`（esbuild）不会 emit `design:paramtypes` 装饰器元数据，会导致 NestJS 构造函数依赖注入失效（`JwtAuthGuard` 的 `this.reflector` 为 `undefined`，所有受保护请求报 `INTERNAL_ERROR`）。`start` / `start:dev` 已内置「tsc 编译 → tsx 加载」两步，请勿改回纯 `tsx watch`。详见 [TEST_REPORT.md](./TEST_REPORT.md) 第 7.4 节。

- 全局前缀 `/api`（`main.ts` 中 `app.setGlobalPrefix('api')`）。
- 监听 `0.0.0.0:API_PORT`。
- Swagger：`/api/docs`；健康检查：`/api/health`（含数据库探测）。
- 自带限流（`API_RATE_LIMIT_PER_MIN` 默认 300、`AI_RATE_LIMIT_PER_MIN` 默认 20）、JWT 守卫、角色守卫、审计拦截器、统一错误过滤器。
- 生产建议用进程管理器（systemd / PM2 / 容器）守护，并配置重启与日志；若改用纯 `node` 运行，需先把 `packages/core`、`packages/knowledge-data` 构建为 JS 并将各自 `package.json` 的 `exports.default` 指向 `dist`，否则 Node 无法直接加载 TS 源码（开发/自托管用 `tsx` 加载器即可）。

## 6. Web 静态托管

```bash
pnpm build                # 先 tsc 构建 packages/*，再 vite build → apps/web/dist
# 本地预览产物
pnpm --filter @apocalypse/web preview
```

`apps/web/dist` 为纯静态目录，可直接由 Nginx / CDN / 对象存储托管。构建实测：PWA 预缓存 49 项，约 1265 KiB（`vite-plugin-pwa`/Workbox）。注意：

- 使用 **SPA history fallback**：所有非文件请求回退到 `index.html`（见下方 Nginx `try_files`）。
- 为带 hash 的静态资源设置长缓存；`index.html`、`sw.js`、`manifest` 不缓存或短缓存，保证 PWA 能更新。
- 移动端 Capacitor 复用同一份 `apps/web/dist`（`webDir: ../web/dist`）。

## 7. Nginx 反代示例

`/api` 转发到 `:3000`，其余走静态文件 + SPA fallback；SSE 需关闭缓冲。

```nginx
server {
    listen 80;
    server_name survival.example.com;
    # 生产环境请改用 443 + TLS，HTTP 仅用于 ACME 校验或重定向
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name survival.example.com;

    ssl_certificate     /etc/letsencrypt/live/survival.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/survival.example.com/privkey.pem;

    root  /var/www/apocalypse-survival;   # 指向 apps/web/dist
    index index.html;

    # 静态资源长缓存
    location /assets/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # PWA 关键文件不缓存，保证更新
    location ~* (^/(sw\.js|manifest\.webmanifest|index\.html)$) {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # API 反向代理到 NestJS :3000
    location /api/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        # SSE 关键：关闭缓冲、保持长连接
        proxy_buffering    off;
        proxy_cache        off;
        proxy_set_header   Connection '';
        proxy_read_timeout 300s;
        chunked_transfer_encoding on;
    }

    # SPA history fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 上传体积需与 UPLOAD_MAX_BYTES 协调（AI 识别图片为 base64）
    client_max_body_size 12m;
}
```

> SSE 的 `/api/ai/chat` 必须 `proxy_buffering off`（服务端已设置 `X-Accel-Buffering: no`），否则流式输出会被 Nginx 缓冲成一次性返回。

## 8. PWA HTTPS 要求

- Service Worker 与「添加到主屏幕 / 安装」仅在**安全上下文**生效：`https://` 或 `http://localhost`。用 IP/HTTP 部署到局域网时 PWA 安装不可用。
- 证书可用 Let's Encrypt 自动签发；确保 `sw.js` 与 `manifest` 通过 HTTPS 同源提供。
- 跨源 `/api` 请求在 Workbox 中配置为 `NetworkOnly`，不缓存；生产 CORS 用 `CORS_ORIGINS` 白名单。
- 升级部署后注意 SW 更新策略为 `autoUpdate`（`vite-plugin-pwa` `registerType: 'autoUpdate'`），`index.html` 不缓存以便前端感知新版本。

## 9. 部署后自检清单

```bash
# 健康检查（含数据库探测）
curl -s https://survival.example.com/api/health
# Swagger 可达
curl -s -o /dev/null -w '%{http_code}\n' https://survival.example.com/api/docs
# 首页统计 / 搜索
curl -s 'https://survival.example.com/api/content/home/stats'
curl -s 'https://survival.example.com/api/content/search?q=%E5%87%89%E8%A1%A3'
# AI 健康（是否配置了服务端密钥）
curl -s https://survival.example.com/api/ai/health
```

真实接口清单见 [API.md](./API.md)；已知限制见 [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)。

## 10. 相关文档

- [../README.md](../README.md) · [INSTALL.md](./INSTALL.md) · [BACKUP.md](./BACKUP.md) · [API.md](./API.md) · [TEST_REPORT.md](./TEST_REPORT.md) · [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)
