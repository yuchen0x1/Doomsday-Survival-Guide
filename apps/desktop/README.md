# @apocalypse/desktop — 桌面端（Tauri 2）

APOCALYPSE SURVIVAL 末日生存指南的 Windows/macOS/Linux 桌面壳。**前端完全复用 `apps/web`**（React 19 + Vite 构建产物），本包只提供原生能力：托盘、系统文件对话框、应用数据目录。

## 启动

```bash
# 开发（会先启动 web 的 vite dev server @5173，再拉起 Tauri 窗口）
pnpm --filter @apocalypse/desktop dev

# 生产构建（先 pnpm --filter @apocalypse/web build，再打包安装包）
pnpm --filter @apocalypse/desktop build
# 等价于根目录：pnpm build:desktop
```

依赖：Rust（cargo）、系统 WebView2（Windows）。前端源在 `../web`，勿在本包内复制页面。

## 配置要点（`src-tauri/tauri.conf.json`）

| 项 | 值 |
| --- | --- |
| identifier | `local.survival.apocalypse` |
| 窗口 | 1280×800，最小 900×600，标题 `APOCALYPSE SURVIVAL` |
| devUrl | `http://localhost:5173`（web dev server） |
| frontendDist | `../web/dist`（web 构建产物） |
| trayIcon | `id: main-tray`，左键弹菜单 |
| beforeDev / beforeBuild | `pnpm --filter @apocalypse/web dev` / `build` |

`capabilities/default.json`：`core:default` + `core:tray:default` + `dialog:default`。

## Rust 命令（`src-tauri/src/lib.rs`）

- `app_data_dir()` → 应用数据目录（不存在则创建），供 SQLite / 本地备份
- `export_backup(json, path?)` → 写 JSON 备份；`path` 为空时弹系统「另存为」（tauri-plugin-dialog），取消返回空串
- `read_backup()` → 弹系统「打开文件」读取备份文本

## 托盘（中文菜单）

`setup_tray()`：**显示主窗口** / **紧急急救链接**（聚焦窗口并把前端路由推进到 `/first-aid`）/ **退出**。

## 平台差异

- 窗口标题、托盘中文菜单均为桌面专属
- `Ctrl+K` 聚焦全局搜索：在 web 层（`AppLayout`）注册，桌面窗口同样生效
- 布局：`usePlatformLayout()` 在 desktop 下返回 `{sidebar: true, bottomNav: false, fab: false}`（侧边栏常驻，不渲染底部导航/悬浮按钮）

## 验证状态

- `cargo check`（src-tauri）：见交付报告；`tauri.conf.json` / `capabilities/*.json` 均为合法 JSON
- 打包 `tauri build` 需完整 Rust 依赖下载与图标资源，未验证项以实际报告为准
