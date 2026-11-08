# API 文档（API）

> 适用于 `apps/api`（NestJS 11 + Prisma 6 + PostgreSQL）。本文接口清单依据 `apps/api/src/` 下各 controller 的真实路由、`apps/web/src/lib/ai.ts` 的调用与 `apps/api/src/ai/sse.ts` 的 SSE 契约编写，**未列出的接口即不存在**。总览见 [../README.md](../README.md)，部署见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 1. 概述

| 项 | 值 |
| --- | --- |
| 全局前缀 | `/api`（`main.ts`：`app.setGlobalPrefix('api')`） |
| 默认端口 | `API_PORT`（默认 `3000`），监听 `0.0.0.0` |
| Swagger | `GET /api/docs`（`DocumentBuilder` + `addBearerAuth`） |
| 健康检查 | `GET /api/health` |
| 请求体 | JSON；`ValidationPipe`（whitelist / transform）；体积上限与 `UPLOAD_MAX_BYTES` 相关（AI 识别图片为 base64） |
| CORS | `ENABLE_CORS_WHITELIST=true` 时取 `CORS_ORIGINS` 白名单，否则允许全部；`credentials: true` |

### 路由分组

`auth` / `content` / `admin` / `sync` / `ai` / `health` 六组。带 `@Public()` 的路由跳过 JWT 守卫；`admin` 组额外要求 `@Roles('ADMIN')`；`content` 组公开，但登录用户会按角色（`GUEST` / `USER` / `ADMIN`）做可见性过滤。

## 2. 认证与 JWT

注册 / 登录 / 刷新均返回统一结构：

```json
{
  "user": { "id": "...", "email": "...", "name": null, "role": "USER", "createdAt": "..." },
  "tokens": { "accessToken": "...", "refreshToken": "..." }
}
```

| Token | 类型 | 有效期 | 说明 |
| --- | --- | --- | --- |
| `accessToken` | `type: 'access'` | `JWT_EXPIRES_IN`（默认 `7d`） | 用于 `Authorization: Bearer <accessToken>` |
| `refreshToken` | `type: 'refresh'` | `30d` | 仅用于 `/api/auth/refresh`；bcrypt 哈希后存入 `UserSession`，刷新时轮换并作废旧会话，仅保留最近 10 个会话 |

用法：

```bash
# 登录取 token
curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@survival.local","password":"<password>"}'

# 带 token 访问受保护资源
curl -s http://localhost:3000/api/auth/me \
  -H 'Authorization: Bearer <accessToken>'
```

守卫链（`app.module.ts`）：`ThrottlerGuard` → `JwtAuthGuard`（`@Public()` 跳过）→ `RolesGuard`（`@Roles` 限定）→ `AuditInterceptor`（审计）。

## 3. 限流

`ThrottlerModule.forRootAsync` 配置两个限流器（`app.module.ts`）：

| 名称 | TTL | 上限 | 来源变量 |
| --- | --- | --- | --- |
| `default` | 60s | 默认 300 次 / 每 IP | `API_RATE_LIMIT_PER_MIN` |
| `ai` | 60s | 默认 20 次 / 每用户 | `AI_RATE_LIMIT_PER_MIN` |

- `auth` / `content` / `admin` / `sync` / `health` 控制器带 `@SkipThrottle({ ai: true })`，即**跳过 ai 限流器、仍受 default 限流**。
- `ai` 控制器无跳过标记，同时受 `default` 与 `ai` 限流约束，因此 AI 接口实际受 `AI_RATE_LIMIT_PER_MIN`（默认 20/分钟）限制。
- 超限返回 HTTP `429`（错误体格式见第 4 节）。

## 4. 统一错误码格式

全局 `AllExceptionsFilter` 把所有异常统一为：

```json
{ "code": "UNKNOWN_KIND", "message": "不支持的内容类型：xxx" }
```

- `code` 取自异常响应对象的 `code` 字段；否则为 HTTP 状态字符串或 `INTERNAL_ERROR`。
- `message` 为字符串，或参数校验错误数组用 `; ` 拼接。
- `ValidationPipe` 校验失败一般形如 `{ "code": "400", "message": "<字段> ..." }`。

代码中出现的业务 `code`（非完整清单）：

| code | 含义 | 来源 |
| --- | --- | --- |
| `EMAIL_TAKEN` | 邮箱已注册 | `auth.service.ts` |
| `INVALID_CREDENTIALS` | 邮箱或密码错误 | `auth.service.ts` |
| `ACCOUNT_DISABLED` | 账号停用 | `auth.service.ts` |
| `INVALID_REFRESH_TOKEN` | 刷新令牌无效/过期/类型错误 | `auth.service.ts` |
| `UNAUTHORIZED` | 用户不存在（`/me`） | `auth.service.ts` |
| `UNKNOWN_KIND` | 不支持的 content kind | `content` / `admin` controller |
| `UNKNOWN_RESOURCE` | 未知同步资源 | `sync` |
| `INVALID_SYNC_PAYLOAD` | 同步载荷格式错误 | `sync.service.ts` |
| `AI_NOT_CONFIGURED` | 识别服务未配置 `AI_API_KEY` | `ai.service.ts` |
| `AI_UPSTREAM_ERROR` | 上游 AI 服务异常 | `ai.service.ts` |
| `INTERNAL_ERROR` | 兜底服务器内部错误 | `AllExceptionsFilter` |

## 5. REST 接口清单

### 5.1 auth（`/api/auth`）

| 方法 | 路径 | 鉴权 | 请求体 / 参数 | 说明 |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | 公开（`@Public()`） | `{ email, password(≥8), name? }` | 注册，返回 `user + tokens` |
| POST | `/api/auth/login` | 公开 | `{ email, password }` | 登录，返回 `user + tokens` |
| POST | `/api/auth/refresh` | 公开 | `{ refreshToken(≥10) }` | 刷新访问令牌（轮换） |
| GET | `/api/auth/me` | Bearer | — | 当前登录用户 `PublicUser` |

### 5.2 content（`/api/content`，公开）

> `:kind` 取值（`common/kinds.ts` 的 `CONTENT_KINDS`）：`articles`、`plants`、`animals`、`insects`、`medicines`、`first-aid`、`skills`、`supplies`、`scenarios`、`hazards`、`quizzes`。非法值返回 `UNKNOWN_KIND`。

| 方法 | 路径 | 参数 | 说明 |
| --- | --- | --- | --- |
| GET | `/api/content/home/stats` | 可选登录用户 | 首页统计（真实计数） |
| GET | `/api/content/search` | `q`、`limit`（1–50，默认 20） | 全文搜索（ILIKE），返回 `{ q, items, total }` |
| GET | `/api/content/:kind` | `page`(默认1)、`limit`(默认20)、`category`、`danger`、`status`、`tag` | 内容列表（分页 / 分类 / 危险等级 / 审核状态过滤） |
| GET | `/api/content/:kind/:id` | — | 内容详情（含 `meta` 与来源） |

### 5.3 admin（`/api/admin`，Bearer + `ADMIN` 角色）

审核状态机（`common/content-state.ts`）：`draft → pending_review → reviewed → published → retired`，迁移接口会校验合法边与审核规则。

| 方法 | 路径 | 参数 / 请求体 | 说明 |
| --- | --- | --- | --- |
| GET | `/api/admin/content/:kind` | `page`、`limit`、`status` | 管理端内容列表（含全部审核状态） |
| POST | `/api/admin/content/:kind` | 内容对象 | 创建内容草稿 |
| PATCH | `/api/admin/content/:kind/:id` | 内容对象 | 更新内容（版本号自增） |
| POST | `/api/admin/content/:kind/:id/status` | `{ status, note? }` | 审核状态迁移（带审核规则校验） |
| GET | `/api/admin/content/:kind/:id/reviews` | — | 内容的审核记录 |
| GET | `/api/admin/sources` | — | 来源列表 |
| POST | `/api/admin/sources` | 来源对象 | 登记资料来源 |
| GET | `/api/admin/audit` | `page`、`limit`(默认50) | 审计日志（分页） |
| GET | `/api/admin/stats` | — | 运营统计 |

> **验证 admin 接口需管理员账号**：注册接口默认 `role='USER'`，用其 token 调 `/api/admin/*` 会得到 403。请改用 seed 管理员登录取 token：`admin@survival.local` / `ADMIN_PASSWORD`（见根 `.env.example`，默认 `change-me-initial-admin-password`）。

### 5.4 sync（`/api/sync`，Bearer，按登录用户隔离）

> `:resource` 取值（`sync.service.ts` 的 `SYNC_RESOURCES`）：`bookmarks`、`history`、`notes`、`inventory`、`transactions`、`quiz-records`、`map-markers`、`map-routes`、`offline-packages`、`profile`、`conversations`。非法值返回 `UNKNOWN_RESOURCE`。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/sync/:resource` | 拉取该用户该资源的全量数据 |
| PUT | `/api/sync/:resource` | 批量上传；事务内**整包覆盖**（先删后建，失败回滚）；`profile` 传对象，其余传数组或 `{ items: [...] }` |

`PUT` 返回 `{ resource, count }`。所有读写以 `userId` 隔离，杜绝越权。

### 5.5 ai（`/api/ai`）

| 方法 | 路径 | 鉴权 | 请求体 | 说明 |
| --- | --- | --- | --- | --- |
| GET | `/api/ai/health` | 公开 | — | AI 服务健康检查（不外呼），返回 `{ available, model? }`；`available` 仅表示服务端是否配置了 `AI_API_KEY` |
| POST | `/api/ai/chat` | 公开 | `{ messages: [{ role: 'system'\|'user'\|'assistant', content }] }` | SSE 流式对话（服务端持有密钥） |
| POST | `/api/ai/identify` | 公开 | `{ image: <base64>, kind: 'plant'\|'animal' }` | 植物/动物图片识别 |

- 未配置 `AI_API_KEY` 时：`chat` 不假装成功，直接写回 `{"type":"error"}` 事件后结束；`identify` 抛 `AI_NOT_CONFIGURED`（HTTP 503）。
- `identify` 返回 `IdentifyResult`：`{ ok, kind, candidates:[{ name, scientificName?, confidence, matchedId? }], features, warning, uncertainty, needMoreFeatures, error? }`。候选为**非确定性匹配**，低置信度时明确写「身份未确认」，禁止建议食用/药用（见 [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)）。

> **健康检查路径已对齐**：`apps/api/src/ai/ai.controller.ts` 使用 `@Controller('ai')` + `@Get('health')`，暴露 `GET /api/ai/health`，与 `apps/web/src/lib/ai.ts` 的 `checkAIHealth()` 请求路径一致。

### 5.6 health（`/api/health`）

| 方法 | 路径 | 鉴权 | 响应 |
| --- | --- | --- | --- |
| GET | `/api/health` | 公开 | `{ status: 'ok'\|'degraded', db: 'up'\|'down', version, uptimeSec }`，含 `SELECT 1` 数据库探测 |

## 6. SSE 事件格式（`/api/ai/chat`）

响应头：

```text
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

每一帧为 `data: <JSON>\n\n`（`apps/api/src/ai/sse.ts` 的 `formatSSE`），契约如下：

| 事件 | 载荷 | 前端处理（`apps/web/src/lib/ai.ts` 的 `streamChat`） |
| --- | --- | --- |
| 增量文本 | `data: {"type":"delta","text":"..."}` | 累加并回调 `onDelta` |
| 工具调用 | `data: {"type":"tool_call","toolCall":{"name":"...","arguments":{...}}}` | 回调 `onToolCall` |
| 错误 | `data: {"type":"error","error":"..."}` | 抛错，由调用方降级 |
| 结束 | `data: [DONE]` | 忽略该帧，流结束后回调 `onDone` |

示例流：

```text
data: {"type":"delta","text":"问题分析："}

data: {"type":"delta","text":"先远离危险源"}

data: {"type":"tool_call","toolCall":{"name":"search_first_aid","arguments":{"q":"烧伤"}}}

data: [DONE]

```

`AIToolName`（`packages/core/src/types.ts`）可为：`search_knowledge`、`search_plants`、`search_animals`、`search_first_aid`、`search_items`、`search_skills`、`calculate_supplies`、`get_offline_status`。上游 OpenAI 兼容流的 `content` delta 转为 `delta`，`tool_calls` 分片按 index 聚合、流末统一 flush 为 `tool_call`。

请求示例：

```bash
curl -N -X POST http://localhost:3000/api/ai/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"被毒蛇咬伤怎么办"}]}'
```

> 经 Nginx 反代时必须 `proxy_buffering off`，否则流式输出会被缓冲（见 [DEPLOYMENT.md](./DEPLOYMENT.md)）。

## 7. 前端调用说明（`apps/web/src/lib/ai.ts`）

| 前端函数 | 调用 | 失败/离线行为 |
| --- | --- | --- |
| `checkAIHealth()` | `GET /api/ai/health`（4s 超时，与 controller 一致） | 返回 `false` 表示不可用 |
| `streamChat()` | `POST /api/ai/chat` | 非 2xx 抛错，由调用方降级 |
| `identifyImage()` | `POST /api/ai/identify` | 返回 `ok:false` + `error` |
| `localFallbackAnswer()` | 纯本地 `SearchIndex` 检索 | 输出明确标注「来自本地离线知识库检索」，**不伪造 AI 输出** |

图片客户端预检：`checkImageQuality()` 限制 `image/*`、5KB–5MB；与服务端 `UPLOAD_MAX_BYTES`（默认 5MB，body 上限取其 2 倍）配合。

## 8. 相关文档

- [../README.md](../README.md) · [INSTALL.md](./INSTALL.md) · [DEPLOYMENT.md](./DEPLOYMENT.md) · [BACKUP.md](./BACKUP.md) · [TEST_REPORT.md](./TEST_REPORT.md) · [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)
