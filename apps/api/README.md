# @apocalypse/api

「APOCALYPSE SURVIVAL 末日生存指南」后端：NestJS 11 + Prisma 6 + PostgreSQL 16。
提供内容检索、审核状态机、认证与管理端、同步、AI 流式助手（SSE）等接口。

## 目录

- [启动顺序](#启动顺序)
- [常用地址](#常用地址)
- [环境变量](#环境变量)
- [AI 未配置 Key 时的降级行为（不伪造成功）](#ai-未配置-key-时的降级行为不伪造成功)
- [数据库备份与恢复](#数据库备份与恢复)
- [测试与构建](#测试与构建)
- [数据表](#数据表)

## 启动顺序

> 前置：Node 22、pnpm 11、Docker 29。数据库连接串与 `.env.example` 保持一致。
> 仓库不带 `.env`（已被 `.gitignore` 忽略），请先 `cp .env.example .env` 并按需填写；
> 也可以直接在 shell 中 `export DATABASE_URL=...` 后执行下面的命令。

```bash
# 0) 安装依赖（仓库根）
pnpm install

# 1) 启动 PostgreSQL（后台，带 healthcheck 与命名卷持久化）
docker compose up -d postgres

# 2) 生成 Prisma Client
pnpm --filter @apocalypse/api prisma:generate

# 3) 应用迁移（生产/本地一致，不生成新迁移）
pnpm --filter @apocalypse/api exec prisma migrate deploy

# 4) 灌入种子数据（管理员账号 + 系统配置 + 已发布知识内容）
pnpm --filter @apocalypse/api prisma:seed

# 5) 开发模式启动（tsx watch，热重载）
pnpm --filter @apocalypse/api start:dev
```

等价的简写（在 `apps/api` 目录下）：

```bash
pnpm prisma:generate
pnpm exec prisma migrate deploy
pnpm prisma:seed
pnpm start:dev
```

生产构建与启动：

```bash
pnpm --filter @apocalypse/api build
pnpm --filter @apocalypse/api start
```

验证服务是否就绪：

```bash
curl -s http://localhost:3000/api/health
curl -s http://localhost:3000/api/ai/health
curl -s "http://localhost:3000/api/content/articles?limit=2"
```

## 常用地址

| 地址                                  | 说明                                                           |
| ------------------------------------- | -------------------------------------------------------------- |
| `http://localhost:3000/api`           | 全局路由前缀（`app.setGlobalPrefix('api')`）                   |
| `http://localhost:3000/api/docs`      | Swagger UI（OpenAPI 文档，Bearer 认证）                        |
| `http://localhost:3000/api/health`    | 健康检查（含数据库探测，返回 `status` / `db`）                 |
| `http://localhost:3000/api/ai/health` | AI 服务健康（仅探测服务端是否配置密钥，不外呼）                |
| `http://localhost:8080`               | 可选 Adminer（`docker compose --profile tools up -d adminer`） |

主要接口：

| 方法 | 路径                                  | 认证             | 说明                                         |
| ---- | ------------------------------------- | ---------------- | -------------------------------------------- |
| GET  | `/api/health`                         | 公开             | 健康检查                                     |
| GET  | `/api/ai/health`                      | 公开             | `{ "available": boolean, "model"?: string }` |
| POST | `/api/ai/chat`                        | 公开             | SSE 流式对话                                 |
| POST | `/api/ai/identify`                    | 公开             | 植物/动物图片识别                            |
| GET  | `/api/content/:kind`                  | 公开             | 内容列表（如 `articles`），分页/过滤         |
| GET  | `/api/content/:kind/:id`              | 公开             | 内容详情                                     |
| GET  | `/api/content/search`                 | 公开             | 全文搜索                                     |
| POST | `/api/auth/register`                  | 公开             | 注册（默认 `USER` 角色）                     |
| POST | `/api/auth/login`                     | 公开             | 登录，返回 `accessToken` / `refreshToken`    |
| GET  | `/api/auth/me`                        | Bearer           | 当前登录用户                                 |
| GET  | `/api/admin/stats`                    | Bearer + `ADMIN` | 运营统计                                     |
| GET  | `/api/admin/content/:kind`            | Bearer + `ADMIN` | 管理端内容列表                               |
| POST | `/api/admin/content/:kind/:id/status` | Bearer + `ADMIN` | 审核状态迁移                                 |

审核状态机（纯函数，见 `src/common/content-state.ts`）：
`draft → pending_review → reviewed → published → retired`，仅允许相邻正向迁移，禁止回退与跨级。

## 环境变量

来自 `.env.example`。带 `*` 的为启动/迁移必填或强烈建议修改。

| 变量                                                                                                           | 默认值                                                              | 说明                                        |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------- |
| `API_PORT`                                                                                                     | `3000`                                                              | 服务监听端口                                |
| `NODE_ENV`                                                                                                     | `development`                                                       | 运行环境                                    |
| `DATABASE_URL` *                                                                                               | `postgresql://survival:survival@localhost:5432/apocalypse_survival` | PostgreSQL 连接串，与 docker-compose 一致   |
| `SQLITE_PATH`                                                                                                  | `./data/local.db`                                                   | 桌面端/本地回退库路径                       |
| `JWT_SECRET` *                                                                                                 | `change-me-to-a-strong-random-secret-32bytes`                       | JWT 签名密钥，生产必须替换为 ≥32 字节随机值 |
| `JWT_EXPIRES_IN`                                                                                               | `7d`                                                                | 访问令牌有效期（refresh 固定 30d）          |
| `ADMIN_EMAIL`                                                                                                  | `admin@survival.local`                                              | `prisma db seed` 创建的管理员邮箱           |
| `ADMIN_PASSWORD` *                                                                                             | `change-me-initial-admin-password`                                  | seed 管理员初始密码，部署后必须修改         |
| `AI_BASE_URL`                                                                                                  | `https://api.xiaomimimo.com/v1`                                     | OpenAI 兼容端点                             |
| `AI_MODEL`                                                                                                     | `mimo-v2.6-Flash`                                                   | 模型名                                      |
| `AI_API_KEY`                                                                                                   | （空）                                                              | **仅服务端持有**；留空即降级，见下节        |
| `AI_TIMEOUT_MS`                                                                                                | `60000`                                                             | 流式请求超时（毫秒）                        |
| `AI_RATE_LIMIT_PER_MIN`                                                                                        | `20`                                                                | 每用户每分钟 AI 请求上限                    |
| `API_RATE_LIMIT_PER_MIN`                                                                                       | `300`                                                               | 全局每 IP 每分钟请求上限                    |
| `UPLOAD_MAX_BYTES`                                                                                             | `5242880`                                                           | 上传体积上限（字节，默认 5MB）              |
| `ENABLE_CORS_WHITELIST`                                                                                        | `false`                                                             | 是否启用 CORS 白名单（生产建议 `true`）     |
| `CORS_ORIGINS`                                                                                                 | `http://localhost:5173,http://localhost:3000`                       | 允许的来源，逗号分隔                        |
| `S3_ENDPOINT` / `S3_REGION` / `S3_BUCKET` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_PUBLIC_BASE_URL` | （空）                                                              | 可选 S3 兼容对象存储                        |
| `MAP_TILE_URL`                                                                                                 | `https://tile.openstreetmap.org/{z}/{x}/{y}.png`                    | 地图瓦片服务，可替换为合规服务商            |
| `MAP_ATTRIBUTION`                                                                                              | `© OpenStreetMap contributors`                                      | 地图署名                                    |

> **安全红线**：`AI_API_KEY` 只能出现在服务端环境变量中，严禁写入前端代码、构建产物或提交到仓库。
> 所有密钥类变量都不应提交；`.env` 已被 `.gitignore` 忽略。

## AI 未配置 Key 时的降级行为（不伪造成功）

`AIService.isAvailable()` 只判断服务端 `AI_API_KEY` 是否非空，**绝不外呼探测**。未配置时：

- `GET /api/ai/health` → `200 { "available": false }`（不含 `model` 字段）。
- `POST /api/ai/chat` → 返回 SSE 流，但**只**发出一个明确的 error 事件后立即结束，绝不生成任何伪 AI 文本：

  ```
  data: {"type":"error","error":"AI 服务未配置（服务端缺少 AI_API_KEY），已停止请求"}

  data: [DONE]

  ```

- `POST /api/ai/identify` → `503`，错误体 `code: "AI_NOT_CONFIGURED"`，不返回任何识别候选。
- 前端 `apps/web/src/lib/ai.ts` 的 `checkAIHealth()` 得到 `false` 后，自动切换为**本地离线知识检索**降级回答，并在回答开头明确标注「AI 服务当前不可用……以下内容来自本地离线知识库检索」，不会把本地检索伪装成 AI 输出。

前端 SSE 事件契约（`src/ai/sse.ts`）：

```
data: {"type":"delta","text":"..."}
data: {"type":"tool_call","toolCall":{"name":"...","arguments":{...}}}
data: {"type":"error","error":"..."}
data: [DONE]
```

上游网络错误、非 2xx、响应体缺失等情况也统一转成 `{"type":"error"}` 事件，不假装成功。

## 数据库备份与恢复

`postgres` 服务监听 `localhost:5432`，库 `apocalypse_survival`，用户 `survival`。

```bash
# 自定义格式备份（推荐，含大对象，配合 pg_restore）
mkdir -p backup
docker compose exec -T postgres \
  pg_dump -U survival -d apocalypse_survival -Fc \
  > backup/apocalypse_survival_$(date +%Y%m%d_%H%M%S).dump

# 从自定义格式恢复（-c 先删对象，--if-exists 忽略不存在的对象；会覆盖现有数据）
docker compose exec -T postgres \
  pg_restore -U survival -d apocalypse_survival -c --if-exists \
  < backup/apocalypse_survival_YYYYMMDD_HHMMSS.dump

# 纯 SQL 备份 / 恢复
docker compose exec -T postgres \
  pg_dump -U survival -d apocalypse_survival --clean --if-exists \
  > backup/apocalypse_survival.sql

docker compose exec -T postgres \
  psql -U survival -d apocalypse_survival \
  < backup/apocalypse_survival.sql
```

> 恢复前建议先停机或确保无写入；`-c/--clean` 会重建对象，属于覆盖性操作，请先确认备份文件无误。
> 迁移历史由 `prisma migrate deploy` 管理，不要手工改 `_prisma_migrations` 表。

## 测试与构建

```bash
# 纯函数单测（不依赖数据库）：content-state / sse / visibility / openai
pnpm --filter @apocalypse/api test

# 类型检查
pnpm --filter @apocalypse/api typecheck

# 构建（tsc -p tsconfig.json）
pnpm --filter @apocalypse/api build
```

测试位于 `tests/` 目录，仅覆盖纯函数与可注入 mock 的模块，不连接真实数据库、不触发真实 AI 外呼。

## 数据表

`prisma/schema.prisma` 共 35 个 model（PostgreSQL）：

```
User                 UserSession          Source               Article
Plant                Animal               AnimalTrack          Insect
Medicine             FirstAidGuide        Skill                Supply
Scenario             ScenarioStep         ScenarioChoice       Hazard
QuizQuestion         ReviewRecord         ContentTag           Bookmark
ReadingHistory       UserNote             InventoryEntry       InventoryTransaction
SurvivalProfile      QuizRecord           AIConversation       AIMessage
MapMarker            MapRoute             OfflinePackage       AuditLog
SystemSetting        EmergencyContact     AIUsageLog
```

迁移文件：`prisma/migrations/20261108000000_init/migration.sql`。
