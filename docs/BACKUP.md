# 备份与恢复（BACKUP）

> 2026-11-13：当前工作区缺少 API 与 Tauri 源码，PostgreSQL / Tauri 章节仅作历史参考。本次验证范围为第 3 节的 IndexedDB 备份。

> 覆盖三类数据：服务端 PostgreSQL（内容/用户/审核/审计）、Web 端 IndexedDB 个人数据、前端离线知识包。部署架构见 [DEPLOYMENT.md](./DEPLOYMENT.md)，接口见 [API.md](./API.md)。

## 1. 备份对象总览

| 数据                                                              | 存放位置                                                 | 备份方式                                  | 是否随应用内置                |
| ----------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------- | ----------------------------- |
| 内容、用户、审核记录、审计日志、AI 用量                           | PostgreSQL（35 张表）                                    | `pg_dump` / `pg_restore`                  | 否，需定期备份                |
| 收藏、历史、物资、笔记、档案、学习记录、离线包、AI 会话、地图标记 | 浏览器 IndexedDB（库 `apocalypse-survival`）             | Web 设置页「导出全量备份 / 恢复备份」     | 否，用户个人数据              |
| 桌面端本地文件 / 备份                                             | Tauri `app_data_dir`                                     | Rust 命令 `export_backup` / `read_backup` | 否                            |
| 离线知识包                                                        | IndexedDB `settings`(键 `pkgdata:*`) + `offlinePackages` | 随 IndexedDB 全量备份一起导出             | 可重建（知识已编译进 bundle） |
| 知识数据集本体                                                    | `packages/knowledge-data/src/`（编译进 bundle）          | 随代码仓库版本管理                        | 是，无需单独备份              |

> 核心知识已编译进前端 bundle 并由 Service Worker 预缓存，**天然离线可用**；离线包只是按分类拆分的本地副本，删除后可重新「下载」重建，不是不可替代数据。

## 2. PostgreSQL 定时备份（pg_dump / pg_restore）

连接参数与根 `.env.example` 一致：`postgresql://survival:survival@localhost:5432/apocalypse_survival`。生产环境请把口令改为强随机值，并用环境变量 / secrets 注入，勿把密码写进脚本提交。

### 2.1 备份脚本示例（Linux / macOS）

```bash
#!/usr/bin/env bash
# 示例脚本：可自行保存为 scripts/pg-backup.sh（本仓库仅提供文档示例，不含该文件）
# 每日全量逻辑备份，保留 14 天
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/apocalypse}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
# 优先用独立环境变量，回退到 .env.example 的默认值
DATABASE_URL="${DATABASE_URL:-postgresql://survival:survival@localhost:5432/apocalypse_survival}"

mkdir -p "$BACKUP_DIR"
TS="$(date +%Y%m%d_%H%M%S)"
OUT="$BACKUP_DIR/apocalypse_${TS}.dump"

# 自定义格式（-Fc）便于 pg_restore 选择性恢复
pg_dump "$DATABASE_URL" -Fc --no-owner --no-privileges -f "$OUT"

# 校验产物非空
test -s "$OUT" || { echo "备份文件为空，失败" >&2; exit 1; }

# 清理过期备份
find "$BACKUP_DIR" -name 'apocalypse_*.dump' -type f -mtime +"$RETENTION_DAYS" -delete

echo "备份完成：$OUT"
```

在 Docker Compose 环境内也可这样导出（服务名以仓库根 `docker-compose.yml` 为准）：

```bash
docker compose exec -T postgres \
  pg_dump -U survival -d apocalypse_survival -Fc --no-owner --no-privileges \
  > "apocalypse_$(date +%Y%m%d_%H%M%S).dump"
```

### 2.2 定时执行（cron）

```cron
# 每天 02:30 执行备份，日志追加到文件
30 2 * * *  DATABASE_URL='postgresql://survival:survival@localhost:5432/apocalypse_survival' \
  /opt/apocalypse/scripts/pg-backup.sh >> /var/log/apocalypse-backup.log 2>&1
```

Windows 可用「任务计划程序」调用等价的 PowerShell/批处理，或用 WSL 运行上述脚本；关键是把口令放在受控环境变量里。

### 2.3 恢复（pg_restore）

```bash
# 目标为全新/空库时（--clean --if-exists 先删后建，谨慎用于生产）
pg_restore --clean --if-exists --no-owner --no-privileges \
  -d "postgresql://survival:survival@localhost:5432/apocalypse_survival" \
  /var/backups/apocalypse/apocalypse_20261108_023000.dump

# Docker 内恢复
docker compose exec -T postgres \
  pg_restore -U survival -d apocalypse_survival --clean --if-exists --no-owner --no-privileges \
  < apocalypse_20261108_023000.dump
```

恢复后建议跑一次迁移对齐与自检：

```bash
pnpm --filter @apocalypse/api prisma:generate
pnpm db:migrate
curl -s http://localhost:3000/api/health
```

> `pg_dump` 为逻辑备份，适合中小规模；更大规模请补充 WAL 归档 / PITR 与异地存储。备份文件含用户数据，需加密存储并限制访问权限。

## 3. Web 端 IndexedDB「导出 / 导入全部数据」

实现位于 `apps/web/src/lib/db.ts`，UI 位于 `apps/web/src/pages/SettingsPage.tsx` 的「数据管理」面板。

### 3.1 操作入口

| 按钮             | 行为                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------ |
| **导出全量备份** | 调用 `exportAllData()`，生成 `survival-backup-YYYY-MM-DD.json` 并下载                |
| **恢复备份**     | 选择 `.json` 文件，完成结构预检并展示各表数量，确认合并后原子恢复并刷新页面          |
| **清除本地数据** | 二次确认后在事务中清空本应用的 11 个 store；保留其他数据库、localStorage 和 PWA 缓存 |

### 3.2 备份文件格式

```json
{
  "version": 1,
  "exportedAt": "2026-11-08T02:30:00.000Z",
  "bookmarks": [],
  "history": [],
  "inventory": [],
  "transactions": [],
  "notes": [],
  "settings": [],
  "quizRecords": [],
  "offlinePackages": [],
  "conversations": [],
  "mapMarkers": [],
  "mapRoutes": []
}
```

`exportAllData()` 导出 **11 个 object store**（`bookmarks`、`history`、`inventory`、`transactions`、`notes`、`settings`、`quizRecords`、`offlinePackages`、`conversations`、`mapMarkers`、`mapRoutes`），均为 `getAll()` 全量。个人生存档案 `profile` 存在 `settings` store 内（键 `survival_profile`），随备份一起导出。

### 3.3 导入语义（重要）

- `parseBackup()` 先检查版本、数据结构、主键重复、日期/坐标/数量及嵌套字段。最大 25 MiB / 100000 条；格式错误不写入任何数据。
- v1 备份继续有效，缺失的数据表保持不变；非法数据表类型不再被悄悄跳过。
- 所有表在一个 readwrite 事务内按主键 upsert；同一 ID 被备份记录覆盖，未出现的本地记录保留。
- 写入失败会回滚整个恢复事务；提交成功后才显示写入记录数并刷新。
- 导出使用一个 readonly 事务读取所有表，避免库存与流水取自不同时间点。
- 三个入口（设置、档案、物资）共用 `BackupControls`。预览可取消；这不会写入数据库。
- 若确实需要完全还原，先单独保存当前备份，再在确认后清除本应用数据并恢复；常规恢复不会删除额外记录。
- JSON 未加密，包含联系人和笔记等个人资料，请妥善保管。

### 3.4 范围说明

该备份只覆盖**本机浏览器**的 IndexedDB 个人数据，不含服务端 PostgreSQL 内容，也不含另一个设备/浏览器的数据。多设备一致性可借助登录后 `/api/sync/:resource`（见 [API.md](./API.md)），但同步与本地备份是两套机制，勿混用。

## 4. 桌面端 Tauri 备份命令

`apps/desktop/src-tauri/src/lib.rs` 暴露三个 Rust 命令（经 `invoke_handler` 注册）：

| 命令                         | 作用                                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `app_data_dir`               | 返回/创建应用数据目录（供 SQLite、本地备份文件存放）                                                                       |
| `export_backup(json, path?)` | 把 JSON 备份写到指定路径；`path` 为空时弹系统「另存为」对话框（默认文件名 `apocalypse-backup.json`）；用户取消返回空字符串 |
| `read_backup()`              | 弹系统「打开文件」对话框，返回备份文件文本内容                                                                             |

> 桌面端复用 Web 的 `exportAllData()` 生成 JSON，再由 `export_backup` 落到系统目录；恢复时 `read_backup()` 读回文本交给 `importAllData()`。完整 `tauri build` release 打包未执行，见 [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)。

## 5. 离线包管理

实现位于 `apps/web/src/lib/offline.ts`，页面 `/offline`。

- **基础知识包**（`base-core`）：随应用内置，`status: downloaded`，永远离线可用，无需下载。
- **可下载包**（`PACKAGE_DEFS`，7 个）：植物、动物、生存技能、完整急救、灾害应对、野外求生、技术维保。
- 「下载」`downloadPackage()`：把该分类子集序列化为 JSON 写入 IndexedDB `settings` store（键 `pkgdata:<id>`），带 8 步进度回调——**这是本地副本写入，不是真实网络下载**（知识本就随 bundle 内置）。
- 「删除」`deletePackage()`：移除本地副本并置回 `not_downloaded`。
- 「更新」`updatePackage()`：版本不一致时标记 `update_available`，更新 = 删除后重新下载。
- 状态存 `offlinePackages` store，随第 3 节的 IndexedDB 全量备份一起导出；丢失后可重新下载重建。

## 6. 恢复演练步骤（建议定期执行）

1. **准备**：在测试环境准备一份最近的 PostgreSQL `.dump` 与一份 Web 导出的 `.json` 备份。
2. **隔离**：用独立数据库/端口或临时浏览器配置文件演练，避免覆盖生产数据。
3. **恢复 PostgreSQL**：

   ```bash
   pg_restore --clean --if-exists --no-owner --no-privileges \
     -d "$DATABASE_URL" apocalypse_YYYYMMDD_HHMMSS.dump
   pnpm --filter @apocalypse/api prisma:generate && pnpm db:migrate
   ```
4. **起服务自检**：

   ```bash
   pnpm api:start:dev
   curl -s http://localhost:3000/api/health
   curl -s 'http://localhost:3000/api/content/home/stats'
   curl -s 'http://localhost:3000/api/content/search?q=%E5%87%89%E8%A1%A3'
   ```
5. **恢复 Web 个人数据**：打开 Web → `/settings` → 先「清除本地数据」（演练环境）→「恢复备份」选择 `.json` → 确认收藏/物资/笔记数量与提示的 `N` 一致。
6. **离线包检查**：`/offline` 查看基础包为已下载、其余包状态；必要时重新下载。
7. **PWA 离线验证**：断网后刷新，确认知识浏览、搜索、练习可用，AI 助手显示本地检索降级标注。
8. **记录**：记录演练时间、备份版本、恢复耗时、发现的问题，并核对 [TEST_REPORT.md](./TEST_REPORT.md) 的未跑项状态。

## 7. 相关文档

- [../README.md](../README.md) · [INSTALL.md](./INSTALL.md) · [DEPLOYMENT.md](./DEPLOYMENT.md) · [API.md](./API.md) · [TEST_REPORT.md](./TEST_REPORT.md) · [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)
