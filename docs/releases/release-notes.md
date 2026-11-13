# 更新历史

按实际发布记录整理。v1.1.0、v1.1.1 为正式 GitHub Release；v1.0.0 仅记录历史源码能力。在线站点始终运行当前部署版本，不是旧版体验入口。

| 版本                                                                               | 发布日期     | 提供内容                                        |
| ---------------------------------------------------------------------------------- | ------------ | ----------------------------------------------- |
| [v1.1.1](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/tag/v1.1.1) | 2026-11-13   | Web/PWA、Windows x64 安装程序、签名 Android APK |
| [v1.1.0](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/tag/v1.1.0) | 2026-11-13   | Web/PWA 静态站点压缩包                          |
| v1.0.0                                                                             | 历史源码基线 | 源码；未创建正式 GitHub Release                 |

## v1.1.1 · 2026-11-13

### 三端安装与离线使用

- 首次同时提供网页版、Windows x64 安装程序和 Android APK，三端使用同一版本的知识库、物资管理与备份功能，包含 v1.1.0 的改进。
- Windows 安装程序内含 WebView2 离线安装组件，减少安装时额外下载运行环境的需求。
- Android 提供固定发布证书签名的正式 APK；知识和页面资源随安装包内置。
- 网页版继续支持浏览器安装为 PWA、离线缓存，以及发现新版本后由用户确认更新。

### 导出与更新体验

- Windows 与 Android 的备份、收藏导出和补货 CSV 使用系统文件保存窗口，可以自行选择文件位置。
- 取消保存不再误报导出成功；实际写入失败会明确提示，避免误以为备份已落盘。
- 原生应用直接使用安装包中的资源，避免网页缓存更新与应用版本混淆。
- 设置页展示安装包版本，并说明通过同平台新包覆盖安装更新；原生端暂不支持自动下载安装更新。

### 下载与升级

| 平台        | 入口 / 安装包                                                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web/PWA     | [在线使用](https://yuchen0x1.github.io/Doomsday-Survival-Guide/) · [自行托管压缩包](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/download/v1.1.1/apocalypse-survival-web-v1.1.1.tar.gz) |
| Windows x64 | [EXE 安装程序](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/download/v1.1.1/apocalypse-survival-windows-x64-v1.1.1-setup.exe)                                                           |
| Android     | [已签名 APK](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/download/v1.1.1/apocalypse-survival-android-v1.1.1.apk)                                                                       |

[SHA256SUMS](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/download/v1.1.1/SHA256SUMS) 包含三个安装 / 部署文件的校验值。Web 压缩包需通过 HTTPS 或 localhost 托管，并配置 SPA 路由回退。

个人数据保存在各设备本机，支持通过版本 1 JSON 备份手动迁移，不会自动跨设备同步。升级前先导出备份，再使用同平台新包覆盖安装；Android 后续版本须沿用发布证书，不要通过先卸载来升级。

### 已验证范围与限制

- 发布验收通过 133 项测试、类型检查及 Web 17 个页面与离线流程；Windows 完成实际安装、启动、保存 / 取消导出和离线知识页刷新；Android 完成一部已授权手机上的安装、启动和系统文件保存。
- Windows 安装程序尚无 Authenticode 签名，系统可能显示发布者未知。Android 签名不等同于已上架 Google Play。
- 未发布 iOS、macOS 或 Linux 安装包，未上架应用商店；未完成旧原生客户端升级迁移、全部 Android 版本与设备的兼容性验收。

详细范围见 [三端安装与验收说明](v1.1.1-platforms.md)，文件哈希及构建来源见 [发布记录](v1.1.1-published.md)。

## v1.1.0 · 2026-11-13

### 物资管理

- 物资可通过表单新增和编辑数量、分类、最低库存、优先级、备注与到期日，并支持清除到期日。
- 支持按名称、分类和备注搜索，以及按优先级、名称、到期日排序，便于查找和盘点。
- 只有实际数量低于最低库存时才计入缺货；补货清单按差额计算，并支持中文 CSV 导出。
- 修复连续调整数量时库存与流水不同步的问题，流水记录实际变化，保存失败时回滚；盘点调整也能查看记录。
- 拒绝负数与无效数量；补货 CSV 处理可能被表格软件误当作公式的文本。

### 备份与数据保护

- 设置、个人档案、物资页三个备份入口采用一致的导出与恢复流程，恢复前可预览数据数量。
- 损坏、重复标识或格式不合法的备份会明确报错；恢复在同一事务中完成，失败不会留下部分导入的数据。
- 兼容版本 1 JSON 备份，支持最多 25 MiB / 100000 条记录；按相同标识合并覆盖，备份中未包含的数据集合保持原样。
- 清除本应用个人数据时，仅清理本应用的数据与设置，保留同一站点下其他应用的数据。

### 阅读与手机体验

- 阅读历史开关与紧凑排版实际生效；尚未接入的设置明确标注，避免开关看似可用却不生效。
- 手机弹窗完整覆盖页面；键盘焦点保留在对话框内，关闭后回到原位置。
- 改善内部导航、离线知识检索、危险等级筛选与离线包数据一致性。

### 下载与升级

本版本仅提供 [Web/PWA 压缩包](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/download/v1.1.0/apocalypse-survival-web-v1.1.0.tar.gz) 与 [SHA256SUMS](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/download/v1.1.0/SHA256SUMS)，未发布 Windows、Android 或 iOS 安装包。个人数据仍存于本机，更新前可导出版本 1 备份；自行托管需使用 HTTPS 或 localhost。

发布时通过 128 项测试、类型检查、生产构建和浏览器物资 / 备份 / 离线验收，详见 [发布验证记录](v1.1.0-validation.md)。此版本的发布不自动更新历史 WorkBuddy Demo；当前在线站点可能已经运行更新版本。

## v1.0.0 · 历史源码基线

### 已有能力

- 离线知识图鉴与急救手册，支持分类浏览、搜索、危险等级展示和收藏。
- 物资清单、计算器、情境推演、学习记录与个人档案。
- 本地知识随前端分发；在线 AI 需要另行配置后端，离线时使用本地检索。
- 仓库包含 Web、API、桌面与移动工程，为后续平台打包提供源码基础。

该条目用于说明演进起点，不代表曾交付桌面或移动安装包。此前没有正式 GitHub Release，日期不作追溯补记；安装与发布状态以 v1.1.0、v1.1.1 的对应条目为准。
