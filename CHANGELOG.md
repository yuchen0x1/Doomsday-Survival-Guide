# Changelog

所有对外发布的版本变更记录，格式与 [GitHub Release 更新模板](docs/release-notes-template.md) 保持一致（概述 / 新增功能 / 改进与优化 / 问题修复 / 安全与兼容性 / 下载与安装 / 验证结果 / 已知问题），不适用的栏目省略。每个版本的完整发布说明见对应 `docs/releases/` 文档与 [GitHub Releases](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases) 页面。

## [Unreleased]

### 🔧 改进与优化

- 依赖升级：express ^5.3.0、vite 8.3.8、@vitejs/plugin-react 6.3.0、@biomejs/biome 2.6.8，以及 GitHub Actions 组合升级（10 项）。均为维护性更新，无用户可见功能变化。
- TypeScript 7.0.2 跨大版本升级因 CI（validate / postgres-smoke）未通过暂缓，待单独评估后再升级。

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
