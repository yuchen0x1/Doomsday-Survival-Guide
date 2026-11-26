# Changelog

所有对外发布的版本变更记录，格式与 [GitHub Release 更新模板](docs/release-notes-template.md) 保持一致（概述 / 新增功能 / 改进与优化 / 问题修复 / 安全与兼容性 / 下载与安装 / 验证结果 / 已知问题），不适用的栏目省略。每个版本的完整发布说明见对应 `docs/releases/` 文档与 [GitHub Releases](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases) 页面。

## [Unreleased]

- TypeScript 7.0.2 跨大版本升级因 CI（validate / postgres-smoke）未通过暂缓，待单独评估后再升级。

## [1.1.7] - 2026-11-26

发布页：[v1.1.7](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/tag/v1.1.7) · [完整版本说明](docs/releases/v1.1.7.md)

### 📢 版本概述

安全与兼容性补丁：管理端修改已发布内容会自动退回草稿并重新审核；生产环境默认启用 CORS 白名单、关闭 Swagger、数据库异常时健康检查返回 503；AI 流式回答改为空闲超时，不再因总时长被截断。同时修复旧 WebView 崩溃、分类搜索越界和备份读取无上限等缺陷。

### 🔧 改进与优化

- **内容复审**：管理端 PATCH 修改已提交、已审核或已发布内容时，同一事务内退回 `draft`、清空审核人/审核时间并写入审核记录，必须重新走状态机才能发布。
- **AI 流式超时**：`AI_TIMEOUT_MS` 对对话流改为两次数据之间的空闲超时，长回答只要持续输出就不会被 60 秒总时限中断；图片识别仍使用总超时。
- **生产安全默认值**：CORS 仅使用 `CORS_ORIGINS` 白名单（`ENABLE_CORS_WHITELIST=false` 仅在 development/test 生效）；Swagger 在 production 默认关闭；新增 `TRUST_PROXY` 配置，未设置时不信任 `X-Forwarded-For`。
- **健康检查**：数据库探测失败返回 HTTP 503，便于负载均衡摘除异常实例。
- **备份读取**：桌面端读取 JSON 备份前检查文件大小，超过 25 MB 直接拒绝，避免一次性读入超大文件。

### 🐛 问题修复

- **旧 WebView 崩溃**：物资流水页改用兼容写法，修复 Android 5.1 旧 WebView / 旧 Safari 不支持 `Array.prototype.toSorted` 导致的页面报错。
- **搜索类型计数**：全局搜索切换类型后不再丢失其他类型的筛选 chip 与计数。
- **分类内搜索**：在图鉴分类页搜索时只返回当前分类文章，不再越界到全库。
- **AI 超时误判**：持续输出的长回答不再被固定总时长截断。
- **死代码清理**：移除同步服务未使用的委托变量与认证服务未使用导入。

### 🔒 安全与兼容性

- **CORS 行为变化**：生产环境必须设置 `CORS_ORIGINS` 为实际前端域名；未配置时跨源浏览器请求会被拒绝，同源部署不受影响。
- **Swagger 默认关闭**：生产环境如需接口文档，显式设置 `ENABLE_SWAGGER=true`，并限制访问来源。
- **反向代理**：仅在可信代理后设置 `TRUST_PROXY`（如 `1` 或 `loopback`），否则限流与审计会按代理 IP 统计。
- **内容下线**：修改已发布内容会立即退回草稿并从公开接口消失，重新发布前请确认这是预期行为。
- 无数据库结构变更，覆盖安装保留本地数据。

### 📦 下载与安装

Web/PWA 下载 `.tar.gz` 后部署到 HTTPS 静态服务器；Windows 10/11 x64 关闭应用后覆盖安装；Android 使用系统安装器覆盖安装 APK（沿用正式签名）。文件名、平台、大小见 Release 页与 `release-metadata.json`，`SHA256SUMS` 提供下载文件摘要。Windows 安装程序未做 Authenticode 签名。

### 🧪 验证结果

- 本地 `pnpm lint`、`pnpm typecheck`、`pnpm test`（145 项）、`pnpm build`、`pnpm build:api`、`pnpm audit --prod --audit-level=high` 与 `node scripts/verify-release-versions.cjs` 全部通过。
- 三端安装包由标签触发的 `Three-platform release` 构建，并校验 Android 签名与 `SHA256SUMS`。

## [1.1.6] - 2026-11-26

发布页：[v1.1.6](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/tag/v1.1.6) · [完整版本说明](docs/releases/v1.1.6.md)

### 📢 版本概述

安全与稳定性补丁：审计日志不再记录密码、令牌和 AI 对话内容，修复依赖安全告警与发布链路阻断；Windows / Android 启动后可自动检查稳定版，Web/PWA 继续使用 Service Worker 更新提示。同时修正危险等级展示、同步 API、AI 系统提示词、地图与离线更新等缺陷。

### ✨ 新增功能

- **原生端启动检查更新**：Windows / Android 启动后每天最多检查一次 GitHub 稳定版，发现新版本时显示覆盖安装提示；设置页仍可手动检查。

### 🔧 改进与优化

- **审计日志脱敏**：写操作审计不再保存密码、令牌、AI 对话或图片内容；嵌套敏感字段替换为 `[REDACTED]`，超长载荷只记录长度。
- **登录态即时校验**：JWT 守卫每次请求读取账号状态与最新角色，停用账号立即失效；`@Public()` 页面携带有效令牌时可识别登录用户。
- **AI 系统提示词**：改由 API 服务端注入，客户端无法覆盖；客户端断开后取消上游请求。
- **危险等级一致性**：审核规则提升后的等级同步到实体顶层字段，详情页、筛选器与搜索/元数据展示保持一致。
- 依赖升级：express ^5.3.0、vite 8.3.8、@vitejs/plugin-react 6.3.0、@biomejs/biome 2.6.8；新增 effect 3.22.1 覆盖以清除 ReDoS 告警。

### 🐛 问题修复

- **审计日志泄露敏感信息**：登录密码、刷新令牌和 AI 提示词不再写入审计载荷，并通过数据库迁移清理历史敏感载荷。
- **发布与 CI 阻断**：修正发布说明模板表格格式与 Biome schema 版本，`pnpm lint` 恢复通过。
- **管理端审核事务**：内容状态更新与审核记录改用同一事务客户端，任一步失败都会整体回滚。
- **同步 API**：历史、物资流水和答题记录按真实 `at` 字段排序；已删除物资对应的流水跳过；会话与消息 ID 改由服务端生成，避免跨用户主键冲突。
- **内容查询**：危险等级、审核状态和搜索词增加运行时校验；危险与题库不再错误套用 `tags` 过滤；首页统计不再重复计算昆虫，并统一排除 D 级来源。
- **AI 流式响应**：处理流结束时缺少换行符的最后一帧，避免丢失末段回答。
- **地图**：瓦片改为行优先排列，修复 5×5 网格与标记错位。
- **离线包**：更新时先成功下载再覆盖旧包，失败不再丢失上一版内容。
- **学习与档案**：防止快速重复点击写入重复答题记录；连续学习天数按本地时区计算；家庭人数限制为 1-30 的整数。
- **模拟器**：按选项 `nextStepId` 进入分支，并在切换场景时清空上一局进度。
- **更新检查与备份**：时间格式异常不再抛错；导出超过 25 MB 时明确报错，避免生成无法再次导入的文件。

### 🔒 安全与兼容性

- 历史审计载荷迁移会清空 `/auth/`、`/ai/chat`、`/ai/identify` 以及包含 password、accessToken、refreshToken 的旧 payload；部署时执行 `prisma migrate deploy` 后生效，请先备份数据库。
- 生产环境仍需单独设置至少 32 字符的 `JWT_SECRET`，不要使用 `.env.example` 中的默认值。
- 重跑 `prisma db seed` 不再重置已有管理员密码和状态；首次创建且未设置 `ADMIN_PASSWORD` 时仍使用默认口令，请登录后立即修改。

### 📦 下载与安装

Web/PWA 下载 `.tar.gz` 后部署到 HTTPS 静态服务器；Windows 10/11 x64 关闭应用后覆盖安装；Android 使用系统安装器覆盖安装 APK（沿用正式签名）。文件名、平台、大小见 Release 页与 `release-metadata.json`，`SHA256SUMS` 提供下载文件摘要。Windows 安装程序未做 Authenticode 签名。

### 🧪 验证结果

- 本地 `pnpm lint`、`pnpm typecheck`、`pnpm test`（139 项）、`pnpm build`、`pnpm build:api`、`pnpm audit --prod --audit-level=high` 与 `node scripts/verify-release-versions.cjs` 全部通过。
- 三端安装包由标签触发的 `Three-platform release` 构建，并校验 Android 签名与 `SHA256SUMS`。

## [1.1.5] - 2026-11-18

发布页：[v1.1.5](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/tag/v1.1.5) · [完整版本说明](docs/releases/v1.1.5.md)

### 📢 版本概述

Windows 和 Android 设置页可检查稳定版并打开官方发行页；Web/PWA 可调整定期检查频率，暂时关闭更新提示后仍能在设置中应用已缓存的新版本。自托管支持 Docker Compose 部署静态站；API 改用一次性刷新会话并校验生产密钥。

### ✨ 新增功能

- **稳定版检查入口**：Windows 和 Android 设置页新增稳定版检查与官方发行页跳转。
- **更新检查频率**：Web/PWA 可在设置中调整定期检查频率，等待中的更新不会被丢弃。
- **Docker Compose 静态站**：自托管者可以用 Compose 提供 Web/PWA 静态站点。

### 🔧 改进与优化

- 正式标签经三端构建、Android 签名核验和草稿下载校验后自动发行，降低误发风险。

### 🔄 升级与数据迁移

- 已保存的收藏、库存、笔记和学习记录随原有本地数据库保留；覆盖安装前仍建议导出 JSON 备份。
- 自托管 API 的刷新会话改为一次性轮换：使用旧刷新会话需重新登录，已有数据库记录可继续读取。
- 生产模式需单独设置至少 32 字符的 JWT 密钥。

### 📦 下载与安装

Web/PWA 下载 `.tar.gz` 后部署到静态服务器或使用 GitHub Pages；Windows 10/11 x64 关闭应用后覆盖安装；Android 使用系统安装器覆盖安装 APK（沿用正式签名）。文件名、平台、大小见 Release 页与 `release-metadata.json`，`SHA256SUMS` 提供下载文件摘要。

## [1.1.4] - 2026-11-17

发布页：[v1.1.4](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/tag/v1.1.4)

### 📢 版本概述

网页/PWA 壳层支持中文 / English 自动检测、手动切换和本地持久化，界面层全面双语；生存知识库内容保持原文。

### ✨ 新增功能

- **界面多语言**：按浏览器或系统语言自动选择简体中文或 English，设置入口支持手动切换并写入本地存储持久化。
- 覆盖导航、搜索、离线状态和错误恢复提示的界面语言层。

### 🔧 改进与优化

- 语言切换后，导航、搜索占位、在线/离线提示和错误恢复提示即时更新。
- `document.documentElement.lang` 随界面语言更新，便于浏览器与辅助技术识别。
- 生存知识数据、植物/动物/急救等内容保持原文，不因界面语言被自动改写。

### 🐛 问题修复

- 修复 i18n 发布验证在跨平台环境中的兼容性问题。
- 恢复 Biome 行尾默认配置，避免发布验证流程受平台行尾差异影响。

### 🧪 验证结果

- 标签触发的三端发布工作流中 Web、Windows、Android 及 collect 任务全部成功，Release 资产已随版本提供。

## [1.1.3] - 2026-11-16

发布页：[v1.1.3](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/tag/v1.1.3) · [发布记录](docs/releases/v1.1.3-platforms.md)

### 📢 版本概述

修复 v1.1.2 发布失败问题并完成三端正式发布；同时落地项目审计文档、地图瓦片配置化与离线包状态修正。

### ✨ 新增功能

- 新增 PROJECT_AUDIT.md、COMPETITOR_ANALYSIS.md、UPGRADE_ROADMAP.md 和 UPGRADE_REPORT.md，以及 20 个开源竞品的实现、许可证和可借鉴点核查记录。
- 离线包页面显示从 IndexedDB payload 读取的真实条目数，并新增回归测试。

### 🔧 改进与优化

- 地图 Web 构建改用 VITE_MAP_TILE_URL / VITE_MAP_ATTRIBUTION 环境变量，并保留默认 OSM 配置。
- 地图瓦片加载失败显示可见提示；层、标记和方向控制支持键盘操作。
- 补充部署、备份、已知问题和环境变量文档。
- 清理受影响组件的稳定列表 key、未使用导入和根节点非空断言。

### 🐛 问题修复

- 对齐 Tauri Cargo.lock 中桌面应用版本，修复 Windows `--locked` 发布构建无法更新锁文件的问题（即 v1.1.2 发布失败的根因）。
- 离线包 metadata 与 payload 不一致时回退为未下载，避免显示虚假的已下载状态。

### 🧪 验证结果

- Web 48 tests、core 41 tests、knowledge-data 9 tests PASS；当前可见 workspace 的 typecheck、test、build PASS。
- Biome 退出 0，但仍有 53 warnings 和 7 infos，详见 UPGRADE_REPORT.md。

### ⚠️ 已知问题

- apps/api 与 apps/desktop 在任务开始前已被工作区标记删除，本轮没有恢复或覆盖。
- 原生设备、真实数据库、真实 AI 上游、签名发布和离线地图底图未由本轮当前工作区完整验收。

## [1.1.2] - 2026-11-16 · 发布失败

[发布尝试记录](docs/releases/v1.1.2-platforms.md)

### 📢 版本概述

标签 `v1.1.2` 已推送，但**没有创建正式 GitHub Release**，也没有三端附件可供下载。Windows 构建失败导致汇总与发布任务被跳过，修正后的锁文件与版本进入 [v1.1.3](#113---2026-11-16)。

### 🐛 问题修复（随失败一并中断）

- 依赖覆盖 rimraf 6.1.4、workbox glob 14.0.6，清除 Dependabot 安全告警。
- CI 修复：Android SDK 初始化、wrapper 规范化与定向验证。

### ⚠️ 已知问题

- Windows 构建失败原因：`apps/desktop/src-tauri/Cargo.toml` 已更新到 1.1.2，但 `Cargo.lock` 中桌面包仍为 1.1.1，工作流使用 `--locked` 拒绝生成新锁文件。
- Web 与 Android 构建成功，但均未发行。

## [1.1.1] - 2026-11-13

发布页：[v1.1.1](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/tag/v1.1.1) · [三端验收](docs/releases/v1.1.1-platforms.md) · [发布记录](docs/releases/v1.1.1-published.md)

### 📢 版本概述

首次同时提供网页版、Windows x64 安装程序和 Android APK，三端使用同一版本的知识库、物资管理与备份功能，并包含 v1.1.0 全部改进。

### ✨ 新增功能

- **三端安装包**：Web/PWA、Windows x64 安装程序、Android 已签名 APK 同步发布。
- Windows 安装程序内含 WebView2 离线安装组件，减少安装时额外下载运行环境。
- Android 知识和页面资源随安装包内置，使用固定发布证书签名。

### 🔧 改进与优化

- Windows 与 Android 的备份、收藏导出和补货 CSV 使用系统文件保存窗口，可自选文件位置。
- 原生应用直接使用安装包内资源，避免网页缓存与应用版本混淆。
- 设置页展示安装包版本；原生端暂不支持自动下载安装更新。
- 网页版继续支持 PWA 安装、离线缓存，以及发现新版本后由用户确认更新。

### 🐛 问题修复

- 取消保存不再误报导出成功；实际写入失败会明确提示，避免误以为备份已落盘。

### 🔄 升级与数据迁移

- 个人数据保存在各设备本机，通过版本 1 JSON 备份手动迁移，不自动跨设备同步。
- 升级前先导出备份，再用同平台新包覆盖安装；不要先卸载升级，Android 后续版本须沿用发布证书。

### 🧪 验证结果

- 133 项测试、类型检查及 Web 17 个页面与离线流程通过。
- Windows 完成实机安装、启动、保存/取消导出和离线知识页刷新；Android 在一部已授权手机上完成安装、启动和系统文件保存。

### ⚠️ 已知问题

- Windows 安装程序无 Authenticode 签名，系统可能提示发布者未知；Android 签名不等同于上架 Google Play。
- 未发布 iOS、macOS 或 Linux 安装包，未上架应用商店；未完成旧原生客户端迁移与全部设备的兼容性验收。

## [1.1.0] - 2026-11-13

发布页：[v1.1.0](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/tag/v1.1.0) · [发布验证记录](docs/releases/v1.1.0-validation.md)

### 📢 版本概述

物资管理与数据保护升级：物资条目可完整编辑与盘点，三入口统一的备份流程带恢复预览与事务保护，本版本仅发布 Web/PWA。

### ✨ 新增功能

- **物资管理**：表单新增和编辑数量、分类、最低库存、优先级、备注与到期日；按名称/分类/备注搜索，按优先级/名称/到期日排序。
- **补货清单**：只有实际数量低于最低库存才计入缺货；按差额计算并支持中文 CSV 导出。
- **备份与恢复**：设置、个人档案、物资页三个入口统一导出/恢复流程，恢复前可预览数据数量。

### 🔧 改进与优化

- 阅读历史开关与紧凑排版实际生效；尚未接入的设置明确标注，避免开关看似可用却不生效。
- 手机弹窗完整覆盖页面；键盘焦点保留在对话框内，关闭后回到原位置。
- 改善内部导航、离线知识检索、危险等级筛选与离线包数据一致性。

### 🐛 问题修复

- 修复连续调整数量时库存与流水不同步：流水记录实际变化，保存失败回滚，盘点调整可查看记录。

### 🔒 安全与兼容性

- 拒绝负数与无效数量；补货 CSV 对可能被表格软件误当作公式的文本做了处理。
- 兼容版本 1 JSON 备份，支持最多 25 MiB / 100000 条记录；按相同标识合并覆盖，备份未包含的数据集合保持原样。
- 清除本应用个人数据时仅清理本应用的数据与设置，保留同一站点下其他应用的数据。

### 📦 下载与安装

本版本仅提供 [Web/PWA 压缩包](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/download/v1.1.0/apocalypse-survival-web-v1.1.0.tar.gz) 与 [SHA256SUMS](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/download/v1.1.0/SHA256SUMS)，未发布 Windows、Android 或 iOS 安装包。

### 🧪 验证结果

- 128 项测试、类型检查、生产构建和浏览器物资/备份/离线验收通过。

### ⚠️ 已知问题

- 本版本的发布不自动更新历史 WorkBuddy Demo；当前在线站点可能已运行更新版本。
