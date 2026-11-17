# Changelog

## Unreleased · 2026-11-17

- 网页/PWA 壳层支持自动语言选择、手动切换和本地持久化。
- 导航、搜索、离线状态和错误提示支持中英文；知识库内容保持原文。

## [1.1.3] · 2026-11-16

发布页：[v1.1.3](https://github.com/yuchen0x1/Doomsday-Survival-Guide/releases/tag/v1.1.3)

### Added

- 新增 PROJECT_AUDIT.md、COMPETITOR_ANALYSIS.md、UPGRADE_ROADMAP.md 和 UPGRADE_REPORT.md。
- 新增 20 个开源竞品的实现、许可证和可借鉴点核查记录。
- 离线包页面显示从 IndexedDB payload 读取的真实条目数。
- 新增离线包真实 payload 条目计数回归测试。

### Changed

- 地图 Web 构建改用 VITE_MAP_TILE_URL / VITE_MAP_ATTRIBUTION，并保留默认 OSM 配置。
- 地图瓦片加载失败会显示可见提示。
- 地图添加层、标记和方向控制支持键盘操作。
- 离线包 metadata 与 payload 不一致时回退为未下载，避免显示虚假的已下载状态。
- 补充部署、备份、已知问题和环境变量文档。
- 清理受影响组件的稳定列表 key、未使用导入和根节点非空断言。
- 对齐 Tauri Cargo.lock 中桌面应用版本，修复 Windows `--locked` 发布构建无法更新锁文件的问题。

### Verification

- Web typecheck PASS。
- Web 48 tests、core 41 tests、knowledge-data 9 tests PASS。
- 当前可见 workspace 的 typecheck、test、build PASS。
- Biome 退出 0，但仍有 53 warnings 和 7 infos，详见 UPGRADE_REPORT.md。

### Limitations

- apps/api 与 apps/desktop 在任务开始前已被工作区标记删除，本轮没有恢复或覆盖。
- 原生设备、真实数据库、真实 AI 上游、签名发布和离线地图底图未由本轮当前工作区完整验收。
