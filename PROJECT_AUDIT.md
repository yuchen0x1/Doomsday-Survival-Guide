# PROJECT AUDIT

> 历史快照（2026-11-16）：部分结论已被后续版本修复或取代。当前状态以 [CHANGELOG.md](CHANGELOG.md) 和 [v1.1.7 发布说明](docs/releases/v1.1.7.md) 为准。

审计日期：2026-11-16（Asia/Shanghai）

项目路径：E:\移动云盘同步盘\Doomsday Survival Guide

分支：main

HEAD：e40c3e1

## 1. 审计范围与证据口径

本审计以当前工作区实际存在的文件、配置、测试和构建输出为准，同时读取了 Git HEAD 中仍可追溯的 API/Tauri 目录以识别项目原始边界。没有恢复、覆盖或删除用户在开始审计前已经存在的工作区修改。

当前工作区存在大量既有未提交变化：apps/api 的源码、Prisma schema/迁移/seed/测试，以及 apps/desktop 的 Tauri 源码和资源被标记为删除；apps/mobile/android 有模板修改；LICENSE 也有既有行尾/格式变化。它们不是本轮为了完成审计而删除的内容。本轮只在 Web、共享包、配置和文档范围内追加变更。

联网竞品研究使用公开 GitHub 项目页、README、目录树、许可证、Release、Issues/PR 页面和重点源码路径。匿名 GitHub API 曾触发速率限制，因此报告不把无法核实的 Star、提交数或 API 返回写成事实；没有复制竞品代码或引入竞品依赖。

## 2. 项目定位

APOCALYPSE SURVIVAL 是离线优先的灾害与野外生存知识系统，面向需要在网络不稳定或断网环境查阅知识、管理家庭物资、练习应急决策和保存个人标记的普通用户。产品同时提供 Web/PWA、Capacitor 移动壳、Tauri 2 桌面壳和 NestJS/Prisma 后端边界。

核心产品原则：

- 知识内容编译进前端并由 Service Worker 预缓存，核心阅读能力不依赖 API。
- 收藏、历史、库存、笔记、档案、学习记录、离线包、会话和地图标记写入本机 IndexedDB。
- AI 没有服务或密钥时降级为明确标注的本地知识检索，不把本地检索伪装成模型回答。
- 危险等级、来源可信度、审核状态和急救免责声明进入共享类型与数据质量闸门。
- 地图标记默认私有，未核实地点不能作为安全避难点。

## 3. 技术架构

| 层       | 当前实现                                                           | 证据位置                                       |
| -------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| 工作区   | pnpm 11 monorepo，packages/* 与 apps/*                             | package.json、pnpm-workspace.yaml              |
| 共享核心 | TypeScript 类型、中文 bigram 搜索、计算器、危险规则、内容校验      | packages/core/src                              |
| 知识数据 | 植物、动物、足迹、昆虫、药物、急救、技能、物资、场景、危险、题库   | packages/knowledge-data/src                    |
| Web      | React 19、React Router 7、Vite 8、Tailwind 4、Zustand、idb         | apps/web/package.json、vite.config.ts          |
| 离线     | Vite PWA/Workbox 预缓存，IndexedDB 个人数据与分类 payload          | apps/web/src/lib/offline.ts、db.ts             |
| AI       | 前端 SSE 客户端与本地检索降级；服务端实现仍在 Git HEAD 的 apps/api | apps/web/src/lib/ai.ts、git show HEAD:apps/api |
| 地图     | OSM 兼容瓦片、Web Mercator 简化投影、本地标记与路线数据            | apps/web/src/pages/MapPage.tsx                 |
| 移动     | Capacitor 6，复用 Web dist；Android/iOS 原生目录存在               | apps/mobile                                    |
| 桌面     | Tauri 2 目标仍在 Git HEAD；当前工作区文件被既有修改标记删除        | git show HEAD:apps/desktop                     |
| 发布     | GitHub Actions、GitHub Pages、Web/PWA、Windows、Android 发布文档   | .github、docs/releases、README.md              |

## 4. 当前能力清单

### 已在当前 Web/共享包中真实存在

- 38 条路由入口，包含知识图鉴、急救、植物/动物/昆虫/药物、技能、物资、库存、搜索、AI、离线包、计算器、模拟器、地图、档案、学习、危险和设置。
- 共享知识数据和搜索索引；标题、标签、正文和类别参与检索。
- IndexedDB 事务化的收藏、历史、库存与流水、笔记、学习记录、离线包、AI 会话、地图标记和路线。
- 备份版本 1 的大小、行数、字段、日期、坐标、重复键和嵌套结构校验；导入在单一 readwrite transaction 中写入，失败会 abort。
- 库存数量调整与流水写入同事务，异常时不会留下半更新库存。
- 离线包 payload 按包定义写入 settings，体积估算复用同一 payload；本轮增加了 payload 读取、条目计数和元数据不一致时回退未下载。
- PWA prompt 更新流程，用户确认后才应用 Service Worker 更新。
- 地图服务构建变量 VITE_MAP_TILE_URL/VITE_MAP_ATTRIBUTION、瓦片失败可见告警、地图添加标记与标记删除的键盘入口。
- 高危内容警告、来源列表、审核状态、可信度、AI 降级说明和急救拨号入口。

### 当前工作区无法证明的能力

- API、PostgreSQL、认证、内容管理、同步和服务端 AI 的当前工作区编译/运行：相关文件被既有修改删除，只能从 HEAD 读取，不能把 HEAD 代码当作当前工作区运行证据。
- Tauri 桌面打包和安装：当前工作区 Tauri 文件被既有修改删除。
- Android/iOS 真机构建与安装：当前环境没有完成本轮原生构建与设备验收。
- 真实 AI 上游联调：没有使用用户密钥，也没有伪造成功响应。
- 离线地图底图：当前默认使用跨源瓦片，断网只保证本地标记和灰底交互，不宣称已经缓存完整地图。

## 5. 本轮发现的主要问题

| 编号   | 问题                                          | 依据                                          | 影响                                                 | 处理                                             |
| ------ | --------------------------------------------- | --------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| AUD-01 | Web 地图读取错误的环境变量契约                | MapPage 原来硬编码瓦片；文档只写 MAP_TILE_URL | 部署者替换服务端变量后 Web 仍访问默认 OSM            | 已改为 VITE_MAP_*，保留安全默认值并更新文档      |
| AUD-02 | 瓦片加载失败曾经静默隐藏                      | MapPage 原来只设置 hidden span                | 用户无法区分无网、服务故障和空地图                   | 已改为可见告警                                   |
| AUD-03 | 地图表面和标记的鼠标交互不完整支持键盘        | Biome a11y 诊断；静态 div 绑定 onClick        | 键盘用户无法添加或触发标记操作                       | 已改为可聚焦 button 层和 button 标记             |
| AUD-04 | 离线包元数据可能与 IndexedDB payload 脱节     | loadPackageStates 只相信 offlinePackages 状态 | UI 可能显示已下载但实际副本已损坏                    | 已读取、解析和计数真实 payload，缺失时回到未下载 |
| AUD-05 | 全仓仍有 lint 警告                            | Biome 当前 53 warnings、7 infos               | 可访问性、索引 key、依赖数组和未使用导入仍有工程债务 | 本轮清理受影响文件的若干 warning；其余列入路线图 |
| AUD-06 | API/Tauri 被既有工作区删除                    | git status --short --branch                   | 无法在当前文件集上完成后端和桌面验收                 | 保留用户修改，列为阻塞，不恢复覆盖               |
| AUD-07 | pnpm 在同步盘并行执行会竞争 node_modules 链接 | 基线并行执行出现 EBUSY/EPERM/EEXIST           | 并行质量门禁不可靠                                   | 后续验证改为串行；锁文件已恢复到开始前状态       |

## 6. 工程成熟度判断

当前 Web/共享包属于“功能覆盖较广、离线基础稳固、质量闸门可运行，但跨端与运营链路未能在当前工作区完整验收”的阶段。

优势：

- 共享 core/data 包减少三端重复逻辑。
- 危险等级和来源追溯进入代码校验，不只停留在 UI 文案。
- 本地数据有事务、备份上限和公式注入防护。
- PWA 构建和路由级分包已真实生成。

短板：

- 当前工作区的 API/Tauri 删除状态使后端、桌面、发布链路无法作为本轮通过证据。
- 离线包仍是“按分类保存的本地副本”，不是动态替换 bundle 的内容加载器。
- 地图需要离线瓦片包、路线编辑和更强的来源/核实流程。
- lint 警告尚未清零，原生端和真实数据库/设备回归未覆盖。
- 个人备份是明文 JSON，没有密码加密和跨设备冲突合并。

## 7. 本轮验证记录

| 检查                                          | 结果                                                     |
| --------------------------------------------- | -------------------------------------------------------- |
| pnpm --filter @apocalypse/web typecheck       | PASS                                                     |
| pnpm --filter @apocalypse/web test            | PASS，6 files / 48 tests                                 |
| pnpm --filter @apocalypse/core test           | PASS，4 files / 41 tests                                 |
| pnpm --filter @apocalypse/knowledge-data test | PASS，1 file / 9 tests                                   |
| pnpm typecheck                                | PASS，当前可见 4 个 workspace；API/Tauri 删除后未纳入    |
| pnpm test                                     | PASS，当前可见 4 个 workspace；共 98 tests               |
| pnpm build                                    | PASS，共享包构建与 Vite/PWA 生产构建                     |
| node_modules/.bin/biome check .               | PASS，53 warnings、7 infos                               |
| git diff --check                              | PASS；仅有 Windows 行尾转换提示                          |
| 并行基线 pnpm test/typecheck/build            | BLOCKED，EBUSY/EPERM/EEXIST 重链接竞争；不是代码断言失败 |

## 8. 下一步优先级

1. 在保留用户删除状态的前提下，先确认 API/Tauri 是否应由用户恢复，再做后端与桌面专项验收。
2. 为离线包增加 manifest/hash 和真实内容加载策略，避免只保存副本。
3. 设计加密备份、跨设备同步冲突和迁移版本。
4. 以 MapLibre/PMTiles 的思想重新实现离线地图包，单独核对 OSM 数据和瓦片许可。
5. 逐批清理 lint/a11y 警告，建立浏览器端关键流程矩阵。

## 2026-11-18 基线核查

当前主工作区的 Git 元数据可读，API 和 Tauri 源码完整，初始 HEAD 为 `a4c5613`。冻结锁安装、类型检查、144 项 Vitest、Capacitor 归档回归及 Web 构建通过。Windows 同步盘 CRLF 检出触发格式差异。新增 PostgreSQL 实际启动验证时发现 API 未直接声明 Express。仓库已有三端版 v1.1.4，本轮修正发布入口、更新流程和部署文档，历史记录保留。见 [维护说明](docs/MAINTENANCE.md)。
