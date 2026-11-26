# UPGRADE REPORT

> 历史快照（2026-11-16）：部分结论已被后续版本修复或取代。当前状态以 [CHANGELOG.md](CHANGELOG.md) 和 [v1.1.7 发布说明](docs/releases/v1.1.7.md) 为准。

报告日期：2026-11-16（Asia/Shanghai）

## 1. 交付摘要

本轮按 PROJECT EVOLUTION ENGINE 的顺序完成了当前工作区可安全完成的扫描、公开竞品研究、40 项升级路线、Web/共享包升级、测试和文档回填。API 与 Tauri 文件在任务开始前已经被工作区标记为删除；按照项目规则没有擅自恢复或覆盖它们，因此后端、桌面和完整发布链路被如实列为阻塞。

本轮研究了 20 个相关开源项目，重点覆盖离线知识、地图、应急事件、任务审核、现场采集、库存和 PWA。没有复制竞品代码，没有引入新运行时依赖。

本轮代码侧重点：

- 修复 Web 地图环境变量契约：VITE_MAP_TILE_URL、VITE_MAP_ATTRIBUTION。
- 将地图瓦片失败从静默状态改为可见告警。
- 用键盘可操作的按钮层和按钮标记替换地图静态 click 交互。
- 对离线包读取真实 IndexedDB payload，统计实际条目；缺失/损坏副本不再显示为已下载。
- 增加离线包真实条目数测试。
- 清理受影响文件的 index key、未使用导入和根节点非空断言。
- 更新环境变量、部署、备份和已知问题文档。

## 2. 研究结果

- 研究项目：20
- 重点参考：Sahana Eden、Ushahidi、HOT Tasking Manager、HOT Field TM、Kiwix JS/PWA/Android、Survival Manual、Trail Sense、MapLibre GL JS、PMTiles、Organic Maps、OsmAnd、Project NOMAD、OpenStreetMap iD、QFieldCloud、KoboToolbox、OpenDroneMap、WebODM、StreetComplete。
- 最有价值的能力方向：
  - 离线内容包和 manifest：Kiwix、Survival Manual。
  - 离线地图与数据许可隔离：PMTiles、MapLibre、Organic Maps、OsmAnd。
  - 事件/角色/审核/任务状态：Sahana、Ushahidi、HOT Tasking Manager、Field TM。
  - 现场表单和离线同步：QFieldCloud、KoboToolbox、StreetComplete。
- 许可证决策：MIT/BSD/Apache/ISC 只作为设计参考并保留归因；GPL/AGPL 只重新实现思想，不复制代码；地图数据和内容数据许可证单独记录。

详细证据见 COMPETITOR_ANALYSIS.md。

## 3. 升级状态统计

| 状态     | 数量 | 编号                                        |
| -------- | ---: | ------------------------------------------- |
| COMPLETE |   16 | EV-001–EV-016                               |
| PARTIAL  |    4 | EV-017、EV-036、EV-039、EV-040              |
| PLANNED  |   16 | EV-018–EV-021、EV-023–EV-027、EV-029–EV-035 |
| BLOCKED  |    4 | EV-022、EV-028、EV-037、EV-038              |
| 合计     |   40 | EV-001–EV-040                               |

COMPLETE 中包含本轮新增和此前已经存在、且本轮重新核实的能力；未把只有文档或占位按钮的功能标成完成。

## 4. 本轮代码与文档变更

### 代码

- apps/web/src/pages/MapPage.tsx
  - 读取 VITE_MAP_TILE_URL/VITE_MAP_ATTRIBUTION 并校验 URL scheme。
  - 显示瓦片加载失败告警。
  - 地图添加层、地图标记和方向控制支持键盘操作。
  - 使用 Confirm 统一处理标记删除。
- apps/web/src/lib/offline.ts
  - 读取并解析 settings 中的 pkgdata payload。
  - 统计真实序列化条目。
  - 元数据状态与 payload 不一致时回退未下载。
- apps/web/src/pages/OfflinePage.tsx
  - 已下载包显示真实条目数。
- apps/web/tests/offline.test.ts
  - 增加真实 payload 条目计数回归测试。
- apps/web/src/App.tsx、main.tsx、components/detail.tsx、lib/ai.ts、pages/AIPage.tsx、CalculatorsPage.tsx、firstaid/FirstAidDetail.tsx
  - 清理受影响的稳定 key、未使用导入和 root 非空断言。

### 配置与文档

- .env.example：补充 VITE_MAP_TILE_URL/VITE_MAP_ATTRIBUTION，并说明服务端变量与 Vite 暴露变量的边界。
- docs/DEPLOYMENT.md：补充地图变量契约。
- docs/KNOWN_ISSUES.md：修正地图配置说明。
- docs/BACKUP.md：记录离线包 payload 校验与状态回退行为。
- PROJECT_AUDIT.md：当前真实项目档案。
- COMPETITOR_ANALYSIS.md：20 个项目的研究和许可证结论。
- UPGRADE_ROADMAP.md：40 个带 EV 编号、依据、方案和验收标准的升级项。
- UPGRADE_REPORT.md：本报告。
- CHANGELOG.md：本轮变更摘要。
- README.md：加入审计/路线/报告入口和当前验证范围。

### 未改动和未恢复

- 没有恢复或覆盖 apps/api、apps/desktop 的用户既有删除。
- 没有删除用户数据、.env、.git-cloud-placeholder-20261113 或 .evolution。
- 本轮已提交并推送 v1.1.2 的版本改动以及修正后的 v1.1.3；v1.1.2 的 Windows 锁文件问题导致其标签构建失败，未创建正式 Release，详情见 `docs/releases/v1.1.2-platforms.md`。
- v1.1.3 已创建正式 GitHub Release；三端构建、签名、哈希汇总和公开资产校验记录见 `docs/releases/v1.1.3-platforms.md`。

## 5. 测试与构建证据

| 检查                                          | 结果                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| pnpm --filter @apocalypse/web typecheck       | PASS                                                                            |
| pnpm --filter @apocalypse/web test            | PASS，6 files / 48 tests                                                        |
| pnpm --filter @apocalypse/core test           | PASS，4 files / 41 tests                                                        |
| pnpm --filter @apocalypse/knowledge-data test | PASS，1 file / 9 tests                                                          |
| pnpm typecheck                                | PASS，当前可见 4 个 workspace                                                   |
| pnpm test                                     | PASS，当前可见 workspace 共 98 tests                                            |
| pnpm build                                    | PASS，core/data 构建与 Web Vite/PWA 构建                                        |
| Web 生产构建                                  | PASS，51 个 precache entries，主入口约 1.04 MB、gzip 约 372 KB                  |
| node_modules/.bin/biome check .               | PASS，53 warnings、7 infos                                                      |
| git diff --check                              | PASS，只有 Windows 行尾转换提示                                                 |
| 并行基线 pnpm 命令                            | BLOCKED，同步盘 node_modules 出现 EBUSY/EPERM/EEXIST 重链接竞争；已改用串行验证 |

Biome warning 主要集中在既有的 Modal/Toast 静态交互、索引 key、React effect 依赖和少量未使用导入；它们已进入 EV-017，不把 lint 退出 0 误写成警告清零。

## 6. 项目变化

升级前：

- Web 已有较广的离线知识、库存、备份和地图能力。
- 地图部署配置与前端实际读取不一致，瓦片失败反馈不明显。
- 离线包有真实序列化副本，但页面主要信任 metadata，副本损坏时可能显示过于乐观。
- API/Tauri 在工作区已有删除状态，跨端当前不能完整构建。

升级后：

- 地图配置可按 Web 构建变量替换，并会提示瓦片加载失败。
- 地图关键操作可使用键盘。
- 离线包页显示真实 payload 条目，缺失副本不会继续显示为已下载。
- 当前 Web/共享包的类型检查、98 项测试、生产构建和 lint 退出状态通过。
- v1.1.3 已通过 GitHub Actions 的 Web、Windows、Android 构建、Android 签名、SHA256 汇总和正式 Release 发布。
- 文档现在明确区分实际完成、部分完成、计划和阻塞，不把旧报告或 HEAD 源码当成当前工作区实测。

仍然不足：

- 离线包还没有成为真正的动态内容加载器。
- 没有加密备份、跨设备冲突同步、离线地图包、事件/任务协作。
- API、真实数据库、真实 AI 上游和原生设备实际运行仍未由本地同步盘工作区证明；Tauri/Android 的发布打包与 Android 签名已由 v1.1.3 GitHub Actions 证明。

## 7. 下一阶段执行顺序

1. 由项目维护者确认 apps/api 与 apps/desktop 的删除是否应保留；确认后在隔离工作区恢复/验收后端、桌面和发布链路。
2. 完成 EV-018/019/020：离线包激活、manifest/hash、IndexedDB migration。
3. 完成 EV-021/022：加密备份与冲突可见的同步队列。
4. 完成 EV-023/024/025：离线地图包、路线编辑和核验来源。
5. 逐批清理 EV-017/036 的 a11y、Playwright 和性能预算。

本报告不宣布“生产级全面完成”，因为当前工作区仍有明确的跨端和外部依赖阻塞项。
