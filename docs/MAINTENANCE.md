# 平台与维护

## 已有功能与共享边界

React/Vite 应用提供知识图鉴、急救与危险预警、搜索、收藏、阅读记录、物资清单、计算器、教学推演、学习、地图标记和备份。内置知识由 `packages/knowledge-data` 提供，校验、危险等级、搜索和计算器模型位于 `packages/core`。个人数据使用 IndexedDB，已有 JSON 备份格式保持兼容。地图在线底图、在线 AI 和可选后端接口有网络或服务依赖。

NestJS API 和 PostgreSQL 提供内容审核、个人数据副本与 AI 代理。`apps/api/prisma/migrations` 保存数据库迁移。Windows 的 Tauri 负责窗口、托盘、原生文件选择和系统浏览器。Android 的 Capacitor 宿主负责移动导航、系统文件选择和发行页交接。两个原生端复用离线界面与业务逻辑。

## 平台评估

A 纳入核心交付。B 纳入可选部署或适配。C 观察产品收益。D 当前缺少分发或验收条件。

| 候选平台                     | 等级 | 技术和体验                                                          | 分发、成本和验收                                                   |
| ---------------------------- | ---- | ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 桌面 Web                     | A    | 浏览器支持知识、备份、库存和键盘操作，在线地图需网络                | GitHub Pages 和静态归档，维护成本低                                |
| 移动 Web / 响应式 Web        | A    | 同源 IndexedDB，触控布局和安全区，浏览器限制后台运行                | 与桌面一起部署，移动视口需要回归                                   |
| PWA                          | A    | 用户确认切换 Service Worker，暂存离线资源，需先成功联网缓存         | HTTPS 或 localhost，安装界面取决于浏览器                           |
| Windows 10 / Windows 11 x64  | A    | Tauri/WebView2，托盘、键盘和系统文件选择，内置离线知识              | NSIS 覆盖安装，GitHub 下载；需要签名自动更新和系统安装生命周期验收 |
| Windows ARM64                | C    | 编译有技术路径，支持成本在运行时及安装器矩阵                        | 当前只发 x64，缺少原生设备回归                                     |
| Android 手机                 | A    | Capacitor/Android System WebView，触控、安全区和系统文件选择        | 现有 APK 签名和独立递增构建号；新版本需真机覆盖升级验收            |
| Android 平板                 | B    | 共用 APK，响应布局横屏可运行，需验证大屏交互和窗口尺寸              | 无独立包，待设备覆盖                                               |
| Android 折叠屏               | B    | 共用 APK，转屏、折叠和分屏可靠性取决于宿主和系统                    | 待折叠屏或模拟器验收                                               |
| iOS                          | D    | 仓库有 Capacitor 工程，需补文件交接适配及真机测试                   | 缺 Apple 签名、分发环境和验收设备。可使用移动 Web                  |
| iPadOS                       | D    | 与 iOS 同约束，需额外检查平板多任务和文件管理                       | 可使用移动 Web                                                     |
| Linux 通用 / Ubuntu / Debian | C    | PWA 可覆盖离线阅读，Tauri 原生需 WebKitGTK、桌面集成和安装验收      | AppImage 与 DEB 增加打包和更新维护，继续用 Web/PWA                 |
| Fedora                       | C    | 需额外验证 WebKitGTK、托盘协议与 RPM 包                             | PWA 替代可用，当前无 RPM                                           |
| Arch Linux                   | C    | 滚动发行版需要额外验证运行时和包依赖                                | PWA 替代可用，当前无原生包                                         |
| macOS Intel                  | C    | Web/PWA 覆盖主要场景，原生需签名、公证和真实 Intel 测试             | 当前无生产分发链                                                   |
| macOS Apple Silicon          | C    | 同上，需独立 Apple Silicon Runner 或设备                            | 当前无生产分发链                                                   |
| Chrome 扩展 / Edge 扩展      | C    | 浏览器标签与 PWA 已覆盖目标场景                                     | 扩展商店审核和权限维护的收益低                                     |
| Firefox 扩展                 | C    | 桌面浏览器可打开 Web，扩展需独立测试和签名分发                      | 当前没有浏览器级专属功能                                           |
| Docker / NAS                 | B    | Nginx 静态封装和可选 PostgreSQL，NAS 须支持容器、卷和 TLS 反代      | Compose Web profile，依赖目标设备架构与磁盘权限                    |
| 私有化 / 云服务器            | B    | 静态站可独立部署；账户功能另需 NestJS、PostgreSQL、环境密钥和 HTTPS | 隔离迁移验收后再连接真实环境，静态包回退由宿主负责                 |
| CLI                          | C    | 可复用数据校验与版本脚本，交互阅读和地图仍以 UI 更合适              | 只维护已有开发脚本                                                 |

## 证据与版本维护

- `main` 禁止删除与非快进更新，维护者可以直接提交。外部贡献使用 fork PR，检查状态在合并前查看。GitHub Pages 环境只接受 `main`。
- CI 在 Ubuntu 上做格式、类型、测试、版本同步、构建和 PostgreSQL 迁移与 API 冒烟。正式标签分别在 Ubuntu、Windows Runner 构建 Web、Android 和 Windows 产物。
- Release 标签使用 `vMAJOR.MINOR.PATCH`。同一标签版本同步到根包、各平台包、Tauri 及 Android。Android minor 和 patch 各占两位，避免构建号冲突。
- 正式工作流需完整三端产物。上传为草稿、下载校验、公开发布后检查不可变状态。既有发行记录保留原样。Windows 安装包的发布证明与 Authenticode 是不同的校验层。
- 依赖检查定期运行，Dependabot 提交的更新通过正常 CI。CodeQL 分析 JS/TS，生产依赖审计要求通过。2026-11-18 的工具链 `picomatch@4.0.7` 告警缺少可安装的官方修复版本。全量检查保留告警，生产依赖审计单独判定。
- 每周公开下载巡检确认构建资产、摘要和 PWA manifest。每轮大版本复核 [竞品证据](../COMPETITOR_ANALYSIS.md) 和 [40 项候选](../UPGRADE_ROADMAP.md)，比较最近 30、90、180 天变化。
- 更新用户说明、测试证据和平台差异后再打标签。若草稿校验中断，先核对其资产和摘要后再继续发布。已发布标签不可修改，回退用保留的资产或另发修正版本，并遵守系统降级限制。

[Actions](https://github.com/yuchen0x1/Doomsday-Survival-Guide/actions) · [正式发行](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/latest) · [安装](INSTALL.md) · [更新与回退](AUTO_UPDATE.md) · [安全](../SECURITY.md)
