# COMPETITOR ANALYSIS

研究日期：2026-11-16（Asia/Shanghai）

## 1. 研究方法

本轮实际核查 20 个有参考价值的开源项目。每个项目至少查看了公开仓库主页、README、目录树和许可证；重点项目进一步查看了核心源码路径、Release 页面、Issues/PR 页面、依赖或构建文件。研究以公开网页为证据，GitHub 匿名 API 遇到速率限制时改用仓库页面，不把无法核实的数字写成事实。

本项目没有复制这些仓库的代码、数据或 UI 资源。后续只采用“重新实现设计思想”的方式，并在采用前复核许可证、内容数据许可证、归因和维护成本。

## 2. 研究清单与对标结论

| 项目 / 仓库                                                          | 许可证与已核查实现                                                                                      | 对方优势                                               | 当前项目现状与差距                                        | 可借鉴方案 / 决策                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------- |
| Sahana Eden — https://github.com/sahana/eden                         | MIT；controllers、models、modules、views、tests、docs、VERSION；公开页面显示 2026-11-10 的 6.3 release  | 人道与应急管理领域模型完整，角色、个案和流程可扩展     | 当前项目以本地个人知识与物资为主，没有多人事件/个案模型   | 借鉴领域模块、状态机和角色边界；重新实现，不引入其代码                      |
| Ushahidi Platform — https://github.com/ushahidi/platform             | AGPL-3.0；app、database、gisconverter、routes、tests、Docker；REST、地图事件和来源适配器                | 信息采集、地理定位、审核后发布和可审计流               | 当前地图只有本地标记，缺少事件报告、来源适配器和审核队列  | 借鉴事件数据契约与审核流；AGPL 使直接集成不可接受，采用设计参考             |
| HOT Tasking Manager — https://github.com/hotosm/tasking-manager      | BSD-2-Clause；FastAPI/React/PostGIS；backend、frontend、migrations、tests、docs；v5.6.2 页面可见        | 区域切片、认领、质量复核和批处理                       | 当前没有任务分派或质量队列                                | 借鉴任务状态机、切片和质量门槛；BSD 允许低风险思想借鉴                      |
| HOT Field Tasking Manager — https://github.com/hotosm/field-tm       | AGPL-3.0 代码、CC-BY-4.0 内容；src/tasks、docs、deploy；近期 release 包含位置与数据库锁修复             | 现场核验、任务分配、实时位置与离线现场流程             | 当前本地标记没有现场任务和核验队列                        | 借鉴现场任务/核验模型；不复制 AGPL 代码或 CC 内容                           |
| MapLibre GL JS — https://github.com/maplibre/maplibre-gl-js          | Apache-2.0；TypeScript/WebGL2；src、build、docs、test、ARCHITECTURE、SECURITY；6.x release 线           | 浏览器向量瓦片、分层渲染、测试和架构文档               | 当前是 25 张栅格瓦片的简化投影，性能和离线能力有限        | 评估作为未来地图渲染参考；先做依赖体积和移动性能评估                        |
| PMTiles — https://github.com/protomaps/PMTiles                       | Version 3 单文件瓦片归档规范；js、openlayers、python、serverless、spec；公开页面注明没有 GitHub Release | Range 请求、静态存储、无需自建 tile backend            | 当前没有预打包底图或瓦片 manifest                         | 采用“单文件离线地图包 + 校验”的思想；集成前复核 LICENSE、数据来源和存储预算 |
| Kiwix JS PWA — https://github.com/kiwix/kiwix-js-pwa                 | GPL-3.0；app、archives、scripts、test、service worker、PWA manifest、更新清单                           | 内容包、离线索引、PWA/Electron 多目标和更新流程        | 当前知识编译进 bundle，分类包是本地副本，不能动态替换内容 | 借鉴内容包 manifest、索引和更新清单；GPL 代码不直接集成                     |
| Kiwix JS — https://github.com/kiwix/kiwix-js                         | GPL-3.0；www、service-worker.js、manifest、tests、vite/rollup 配置；v4.4.0 release 页面可见             | 纯 JS 离线阅读器，跨浏览器扩展与 PWA                   | 当前搜索索引每次从内置数据构建，没有增量索引格式          | 借鉴可移植离线格式和服务 worker 边界；重新实现接口                          |
| Kiwix Android — https://github.com/kiwix/kiwix-android               | GPL-3.0；app、core、benchmark、docs、migration、plugins                                                 | 内容库/核心库/UI 分层、迁移与基准测试                  | 当前 Capacitor 复用 Web，原生内容库迁移能力有限           | 借鉴 core/UI 分层和迁移测试；不复制 GPL 源码                                |
| Survival Manual — https://github.com/ligi/SurvivalManual             | GPL-3.0；Kotlin Android；assets 与 Markdown wiki 分离；5.0.0 release 页面可见                           | 完全离线、内容与客户端解耦、公版来源说明               | 当前中文数据与 Web bundle 耦合，内容更新要重新构建        | 借鉴内容仓库分离、来源和许可声明；内容许可需逐条复核                        |
| Trail Sense — https://github.com/kylecorry31/Trail-Sense             | MIT 代码；内容另有 Survival Guide License；app、guides、release-notes、SECURITY、脚本                   | 离线工具、指南、轨迹、信标、诊断导出、隐私默认值       | 当前有计算器和本地地图标记，但没有传感器/轨迹/诊断导出    | 借鉴模块化工具、诊断包和内容许可隔离；优先实现导出与轨迹                    |
| OsmAnd — https://github.com/osmandapp/OsmAnd                         | GPLv3 代码；地图数据与 UI 资源另有许可；多模块、plugins、tests、GPX/地图包                              | 离线向量地图、搜索、导航、偏航重算和 GPX               | 当前地图只加载外部栅格瓦片，没有离线路线/导航             | 借鉴地图分片、GPX 和本地搜索边界；不复制受限资源                            |
| Organic Maps — https://github.com/organicmaps/organicmaps            | Apache-2.0 代码；DATA_LICENSE、NOTICE、OSM ODbL/Wikipedia CC-BY-SA 数据声明                             | 隐私优先、无广告追踪、离线搜索/路由、多平台原生分层    | 当前个人数据本地化较强，但地图数据、归因和离线包不足      | 借鉴隐私默认值、数据与代码许可证拆分、公开校验和                            |
| Project NOMAD — https://github.com/crosstalk-solutions/project-nomad | Apache-2.0；admin、collections、install、Dockerfile、FAQ                                                | 离线知识集合、浏览器本地服务、可选本地 AI              | 当前内容集合内置但没有外部集合清单/管理员导入             | 借鉴集合 manifest、管理界面和可选本地服务；先评估部署复杂度                 |
| OpenStreetMap iD — https://github.com/openstreetmap/iD               | ISC；TypeScript/JavaScript；package-lock、tsconfig、Vitest；v2.42.3 页面可见                            | 浏览器编辑器、首次 walkthrough、键盘快捷键、渐进式表单 | 当前地图标记表单和引导较简单                              | 借鉴可重开的新手引导、键盘操作和渐进式表单                                  |
| QFieldCloud — https://github.com/opengisch/qfieldcloud               | 开源现场数据后端；README 与文档覆盖 change tracking、team management、offline sync                      | 离线编辑、增量同步、团队协作与冲突边界                 | 当前仅 IndexedDB 本地数据，跨设备同步还未验收             | 借鉴同步队列、版本和冲突处理；部署前单独核许可证                            |
| KoboToolbox / KPI — https://github.com/kobotoolbox/kpi               | 人道数据采集平台；API、表单/问题库、报告和导出；KoboCollect 支持离线采集                                | 表单驱动、离线队列、审计与导出                         | 当前事件/核验数据结构固定，缺少用户自定义采集             | 借鉴可配置表单和离线同步队列；先限制字段权限与数据敏感性                    |
| OpenDroneMap — https://github.com/OpenDroneMap/ODM                   | AGPLv3；Docker/GPU/pixi、run.py、settings.yaml、RELEASE                                                 | 影像批处理、正射影像、点云和 DEM                       | 当前没有灾情影像导入或批处理管线                          | 只作为未来灾情扩展参考；AGPL 不直接集成                                     |
| WebODM — https://github.com/WebODM/WebODM                            | AGPLv3；Web UI 与 OpenDroneMap 解耦，持续发布修复和功能                                                 | 影像处理队列、项目 UI、任务状态                        | 当前没有上传任务队列和长任务恢复                          | 借鉴任务队列和结果状态；先做本地导入接口再评估                              |
| StreetComplete — https://github.com/streetcomplete/StreetComplete    | GPLv3；移动端现场/离线 OSM 采集；2026-10 v64.0 页面可见                                                 | 任务式问答、低门槛现场采集、离线提交                   | 当前标记表单一次性字段多，缺少任务式核验                  | 借鉴任务式问答与离线提交；不复制 GPL 实现                                   |

## 3. 横向差距

### 当前项目相对优势

- 中文生存知识、急救、危险等级、来源元数据和本地化数据已经形成完整产品链。
- Web/PWA 断网阅读、搜索、库存、备份和 AI 本地降级已经有真实代码与测试。
- 共享 core/data 包让 Web、移动和目标桌面复用同一套内容和规则。
- 本地隐私默认值较明确，地图标记和个人数据默认不上传。

### 最明显短板

- 缺少 Sahana/Ushahidi/HOT 类的事件、角色、任务状态和质量审核流。
- 缺少 Kiwix/Survival Manual 类的外部内容包 manifest、签名/校验和增量内容加载。
- 缺少 MapLibre/PMTiles/Organic Maps 类的离线地图包、离线搜索和路线。
- 缺少 QFieldCloud/KoboToolbox 类的离线队列、冲突合并和表单导出。
- 当前工作区 API/Tauri 被既有修改删除，真实后端、桌面和发布链路无法作为本轮通过证据。

## 4. 许可证与移植决策

优先重新实现思想：MIT、BSD、Apache、ISC 项目可做架构参考，但仍需保留必要归因。GPL/AGPL 项目只做行为和产品设计参考，除非未来明确隔离边界并完成法律审查，不复制代码。地图数据、Wikipedia 内容、Survival Guide 内容和 OSM 数据的许可证与代码许可证分开处理。所有未来导入的内容必须保留来源、发布日期、核验人和许可证字段。
