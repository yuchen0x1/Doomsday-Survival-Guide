# 已知问题与限制（KNOWN_ISSUES）

> 如实列出当前版本的已知限制。每条给出「影响」与「规避建议」。内容类免责同样适用于 [../README.md](../README.md) 的许可证声明。验证状态见 [TEST_REPORT.md](./TEST_REPORT.md)。

## 总览

|   # | 问题                                  | 类别 | 影响                                           | 规避建议                                                         |
| --: | ------------------------------------- | ---- | ---------------------------------------------- | ---------------------------------------------------------------- |
|   1 | AI 识别为候选匹配，非确定性结论       | 安全 | 误把候选当确认物种可能导致误食/误触            | 身份未确认前禁止食用、药用或触碰；以权威图鉴/专业人员复核        |
|   2 | 地图瓦片依赖外部 OSM，离线不可用      | 离线 | 断网看不到底图；未核实地点可能被误当安全点     | 离线改用地形/纸质图与已核实坐标；`verified=false` 不得标为避难点 |
|   3 | 场景模拟为教学推演，非真实预测        | 认知 | 把推演结果当真实灾情判断                       | 明确标注 `isSimulation`；以官方应急指令为准                      |
|   4 | 医疗内容仅供参考                      | 安全 | 替代专业救治造成延误                           | 高危先拨打 120/119；用药前咨询专业人员                           |
|   5 | Windows 已发布，代码签名待完善        | 发布 | 安装程序可能显示发布者未知；其他桌面平台未发布 | 核对 Release 校验值，升级前备份；详见第 5 条                     |
|   6 | iOS 需 macOS + CocoaPods              | 构建 | Windows 无法构建 iOS 真机包                    | 在 macOS 上 `pod install` 并用 Xcode 构建                        |
|   7 | AI 需自备 API Key                     | 功能 | 未配置时无 AI 能力                             | 服务端 `.env` 填 `AI_API_KEY`；离线自动降级本地检索              |
|   8 | `relatedIds` 跨条目接线尚不完整       | 内容 | 部分「相关知识」跳转缺失                       | 通过全局搜索/分类浏览补足；后续完善数据关联                      |
|   9 | Prisma 6 / Capacitor 6 暂缓大版本迁移 | 依赖 | 迁移涉及后端互操作与原生工程兼容性             | 见下方第 9 条迁移清单；在独立变更中升级并全量回归                |

---

## 1. AI 识别为候选匹配，非确定性结论；身份未确认禁止食用

- **影响**：`/api/ai/identify` 返回的是按置信度排序的**候选物种**，不是鉴定结论。模型可能因图片角度、光照、相似种而给出错误候选。若用户据此采食、入药或徒手触碰有毒植物/危险动物，存在中毒、过敏、咬伤等真实风险。
- **规避建议**：
  - 服务端对无法确定时强制 `confidence < 0.5`，并在 `uncertainty` 写明「身份未确认」；固定 `warning` 为「识别结果由 AI 生成，置信度仅供参考；身份未确认前禁止食用、药用或触碰」。
  - 前端 `identifyImage()` 与本地 `matchLocalSpecies()` 仅用于比对相似种，不作采信依据。
  - 任何食用/药用决策必须以权威图鉴、当地农林/卫健部门或专业人员现场复核为准；高危时优先远离危险源并求助。
  - 详见 [API.md](./API.md) 的 `identify` 响应契约。

## 2. 地图瓦片依赖外部 OSM，离线不可用且未核实不能标避难点

- **影响**：`MAP_TILE_URL` 默认指向 `https://tile.openstreetmap.org/{z}/{x}/{y}.png`，属外部服务；断网/服务不可达时底图无法加载。此外地图上的自定义标记若未核实，可能被误当作可用水源、避难所或安全路线。
- **规避建议**：
  - 离线场景不依赖在线瓦片：改用预存地形图、纸质地图与已核实的经纬度；`apps/web/src/lib/offline.ts` 的离线包与 Service Worker 不缓存跨源瓦片（Workbox 对跨源 `/api/` 为 `NetworkOnly`）。
  - 数据模型 `MapMarker.verified` 为 `false` 的地点**不得标记为安全避难点**；`private` 标记不对外共享。
  - 生产可通过 `MAP_TILE_URL` / `MAP_ATTRIBUTION` 替换为合规服务商，并遵守其使用条款与署名要求。
  - 相关类型见 `packages/core/src/types.ts` 的 `MapMarker` / `MapRoute`。

## 3. 场景模拟为教学推演，非真实预测

- **影响**：12 个灾害情境的选项、后果与 `quality` 评分用于**教学与决策训练**，不是对真实灾情的预测；把推演结论当作现实行动依据可能误导。
- **规避建议**：
  - `DisasterScenario.isSimulation: true` 在类型层强制标注为模拟；界面需保留「模拟/推演」语境。
  - 真实应急以官方预警、当地应急管理部门指令与专业救援为准。
  - 复盘（`debrief`）用于讨论取舍，不作为操作手册。

## 4. 医疗内容仅供参考，不能替代专业救治

- **影响**：急救指南（26 篇）、药物图鉴（17 种）与 AI 回答中的医疗信息为通用科普，不构成诊断、处方或个体化医嘱；误用可能延误救治或造成二次伤害。
- **规避建议**：
  - `MedicineEntry.disclaimer` 明确声明非医嘱；`AI_SYSTEM_PROMPT` 要求中毒/外伤/火灾/触电等先建议拨打 120/119 并远离危险源。
  - 用药、创伤处理、心肺复苏等以专业医护人员与正规培训为准；紧急情况优先联系急救系统。
  - 急救内容要求可追溯到权威来源（见 [TEST_REPORT.md](./TEST_REPORT.md) 的 `dataset.test.ts` 覆盖「急救权威来源」）。

## 5. Windows 已发布，代码签名与其他桌面平台仍待完善

- **影响**：v1.1.1 已发布 Windows x64 NSIS 安装程序，并完成安装、启动、系统文件导出与离线知识页刷新；安装包包含 WebView2 离线组件，但尚无 Authenticode 签名。macOS / Linux 安装包和原生自动更新未交付。
- **规避建议**：
  - 从正式 Release 下载安装包并核对 SHA-256；系统可能提示发布者未知。
  - 更新前导出 JSON 备份，使用同平台新安装包覆盖安装，不要先卸载。
  - 已验证范围与未测项见 [v1.1.1 三端发布说明](releases/v1.1.1-platforms.md)。

## 6. iOS 需 macOS + CocoaPods 才能构建

- **影响**：`cap add ios` / `cap sync` 已通过、`ios/` 平台目录已生成，但在 Windows 上无 CocoaPods，`pod install` 跳过属预期；iOS 真机构建/运行未执行。
- **规避建议**：
  - 在 macOS + Xcode + CocoaPods 环境执行 `cd apps/mobile/ios/App && pod install`，再用 Xcode 打开 `.xcworkspace` 构建。
  - 当前 Android 构建使用 JDK 21、Gradle 8.11.1 和 Android SDK 34；v1.1.1 已提供签名 APK 并完成一部手机的真机验收。
  - 仅做 Web/桌面验证时可忽略 iOS 构建。

## 7. AI 需自备 API Key

- **影响**：AI 助手 / 图片识别依赖服务端 `AI_API_KEY`（Base URL `https://api.xiaomimimo.com/v1`，模型 `mimo-v2.6-Flash`）。未配置或离线时无 AI 能力。
- **规避建议**：
  - 在服务端 `.env` 填入自备 `AI_API_KEY` 后重启 API；密钥**仅存服务端**，严禁打包进 Web / 桌面 / 移动端。
  - 无 Key/离线时前端 `localFallbackAnswer()` 自动降级为本地知识检索并明确标注来源，系统**不伪造 AI 输出**（见 [API.md](./API.md) 与 [DEPLOYMENT.md](./DEPLOYMENT.md)）。
  - 注意 `AI_RATE_LIMIT_PER_MIN`（默认 20）与 `AI_TIMEOUT_MS`（默认 60000）约束。

## 8. `relatedIds` 跨条目接线尚不完整

- **影响**：`KnowledgeArticle` / `FirstAidGuide` / `SurvivalSkill` 等类型含 `relatedIds`、`relatedArticleIds`、`relatedTutorialIds` 等关联字段，但数据集间的跨条目接线尚未全部补齐，部分「相关知识 / 推荐阅读」跳转可能缺失或指向空。
- **规避建议**：
  - 通过全局搜索、分类浏览与标签筛选补足关联发现路径，不依赖单一 `relatedIds` 跳转。
  - 内容维护时在 `admin` 后台逐步补齐关联并走审核状态机（见 [API.md](./API.md)）。
  - 后续版本按数据集批量补全关联并纳入 `validateDataset` 质量校验。

## 9. Prisma 6 / Capacitor 6 暂留次新大版本

- **影响**：2026-11 升级批次已把 Vite 6→8、vitest 3→5、@types/node 22→24、TypeScript 5.9 等升级到位；`@prisma/client`/`prisma`（6.19→7.x）与 `@capacitor/*`（6.x→8.x）**有意暂缓**：Prisma 7 为 ESM 优先 + 强制 driver adapter（`@prisma/adapter-pg`）+ `prisma.config.ts`，与本项目 NestJS CommonJS（`emitDecoratorMetadata`）构建链的互操作需要专门回归（DI 元数据、seed、迁移 CLI、运行时适配器全部受影响）；Capacitor 大版本升级需要原生工程迁移（`cap migrate`/`cap sync`），当前 Android 6.x 工程已完成构建与单设备验收；Capacitor 大版本迁移和 iOS 仍需单独验证。
- **规避建议**：
  - 当前锁文件固定依赖版本；安全状态以对应版本的依赖审计记录为准，不把暂缓大版本迁移等同于无漏洞。
  - Prisma 7 迁移清单：generator 换 `prisma-client`（指定 `output`）→ 新增 `prisma.config.ts`（schema/migrations/seed/datasource.url）→ 安装 `@prisma/adapter-pg` + `pg` 并改造 `PrismaService`（`new PrismaClient({ adapter })`）→ 6 个文件的 `@prisma/client` import 改为生成产物路径 → 全量跑 7.7 节的 Docker 冒烟回归。
  - Capacitor 8 迁移清单：`npx cap migrate` → `cap sync` → macOS/Android SDK 环境真实构建验证后回填 [TEST_REPORT.md](./TEST_REPORT.md)。
  - 升级务必走独立变更 + 全量回归（`pnpm lint && pnpm typecheck && pnpm test && pnpm build`），不要与功能改动混在一起。

---

## 相关文档

- [../README.md](../README.md) · [INSTALL.md](./INSTALL.md) · [DEPLOYMENT.md](./DEPLOYMENT.md) · [BACKUP.md](./BACKUP.md) · [API.md](./API.md) · [TEST_REPORT.md](./TEST_REPORT.md)

## 2026-11-13 当前限制补充

- 同步盘主目录仍缺失 API 与桌面源码；远程源码和完整隔离发布目录均已保留，这些缺失项未作为远程删除提交。原生安装、Android 签名与单设备验收已完成；真实 PostgreSQL、在线 AI 和旧原生客户端升级迁移仍未验证。
- L4 列表隐藏、全局删除确认偏好尚未接入，设置页已禁用这两个开关并说明状态；阅读历史与紧凑布局已接通。
- 备份最多 25 MiB / 100000 条，采用同 ID 合并覆盖，无加密与逐条冲突选择。旧畸形备份会明确报错，需先修复副本再恢复。
- 库存修改已在数据库事务内防止并发丢失，但其他标签页的界面不会自动刷新。
- 地图瓦片仍依赖网络；PWA 离线浏览需要事先成功缓存；首次完全离线访问无法加载未安装的网页。
- 全仓 Lint 有历史警告；已有一部 Android 手机的安装 / 导出验收和发布产物静态审计，但尚无低端机压测、广泛设备兼容性测试或完整安全审计。
