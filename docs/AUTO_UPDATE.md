# 在线更新与发布

## v1.1.1 起的三端发布

正常版本发布使用 `.github/workflows/release-all.yml`：Web/PWA、Windows x64 安装程序和签名 Android APK 全部构建成功后，生成覆盖三个包的 `SHA256SUMS`。标签触发构建；手动启用 `publish_release` 才自动发布。旧 `release-web.yml` 保留为仅手动触发的 Web 工件入口。详见 [三端安装和验收说明](releases/v1.1.1-platforms.md)。

原生应用资源随安装包内置，关闭 PWA Service Worker 注册，以免缓存旧版资源。桌面与 Android 通过同平台的新安装包覆盖升级；目前不支持自动下载安装。Android 后续包须沿用发布证书；Windows 当前没有 Authenticode 签名。更新前建议导出 JSON 备份，不要先卸载。

## 当前实现

当前项目是离线优先的 React + Vite PWA，并由 Capacitor 复用 Web 资产。Web 端使用 `vite-plugin-pwa` 生成 Workbox Service Worker：

- 构建产物由 Service Worker 预缓存，断网时继续使用上一份可用资源。
- 更新策略为 `prompt`。发现新资源后，界面显示「立即更新 / 稍后处理」，不会在用户阅读中强制刷新。
- 设置页显示当前版本、Service Worker 状态、上次检查时间，并提供手动检查。
- 更新只替换同源 Web 静态资源；IndexedDB 中的收藏、历史、物资、笔记和档案不会被清除。
- 网络失败、没有 Service Worker 或不在 HTTPS/localhost 安全上下文时，应用继续启动并保留当前缓存。

版本由根 `package.json` 的 `version` 在 Vite 构建时注入 `VITE_APP_VERSION`。发布标签统一使用 `vMAJOR.MINOR.PATCH`，例如 `v1.0.1`。

## GitHub Pages 首次启用

在 GitHub 仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。之后推送到 `main`，`pages.yml` 会自动部署项目站点。默认地址为：

```text
https://yuchen0x1.github.io/Doomsday-Survival-Guide/
```

README 的在线入口已指向 GitHub Pages。历史 WorkBuddy Demo 属于另一套静态托管；GitHub Pages 部署不会自动替换那里的文件。

## GitHub Actions

- `.github/workflows/ci.yml`：只监听 `main` 的 push 和 Pull Request，执行 lint、typecheck、test、build，权限为 `contents: read`。
- `.github/workflows/release-all.yml`：版本标签或手动触发时构建三个平台并生成统一 SHA-256 文件；`release-web.yml` 只保留手动 Web 构建入口。
- `.github/workflows/pages.yml`：`main` 更新后，自动构建并部署 `apps/web/dist` 到 GitHub Pages；手动触发同样限定在 `main`，与 Pages 环境的分支保护规则一致。构建时使用仓库子路径，补充 `404.html` 以支持 SPA 路由。
- 正式 GitHub Release 默认不会自动创建。只有从 Actions 手动运行并明确勾选 `publish_release=true` 时，发布 job 才使用内置 `GITHUB_TOKEN` 创建 Release。
- Release 构建的临时 Actions 工件保留 14 天；正式 Release 附件长期保留，不受此期限影响。Pages 工件仅用于部署。

推荐发布步骤：

```bash
git checkout main
git pull --ff-only origin main
# 将根、Web、桌面、移动、Cargo、Tauri 与 Android 版本统一为下一版本
# 例如下一补丁版本 1.1.2；同时递增 Android versionCode
node scripts/verify-release-versions.cjs
# 完成验证并提交版本改动和 docs/releases/release-notes.md 后打标签
git tag v1.1.2
git push origin main v1.1.2
```

推送 `main` 会触发 GitHub Pages 部署，用户访问的站点会得到新构建；版本标签生成可下载的三端 Actions 工件。确认构建结果后，在 GitHub Actions 手动运行 `Three-platform release`，填写相同的标签并勾选正式发布，可同步创建 GitHub Release。

## 安全边界与限制

- PWA 静态资源必须从 HTTPS 或 localhost 同源提供；部署时请让 `index.html`、`sw.js` 和 manifest 使用短缓存或 `no-cache`。
- GitHub Actions 生成的 SHA-256 只用于发布工件校验；浏览器 PWA 不会把压缩包下载到本机再安装，因此不伪造桌面安装包签名、下载进度或静默安装能力。
- v1.1.1 起提供桌面安装程序和签名 Android APK；Windows 代码签名证书与原生自动更新服务器尚未配置。GitHub Pages 只负责 Web/PWA 静态站点。
- 本地 Git 元数据已经恢复；发布时保留远程 API/桌面源码，不把同步缺失项作为远程删除。

## 故障处理

更新检查失败时，当前版本继续可用；用户可以稍后重试。Service Worker 只有在新资源安装并接管后才刷新页面，旧缓存不会在检查失败时被删除。若发布工件校验失败，应停止分发该工件并重新构建，不要覆盖已发布版本。

## 外部验证

本地可以验证 TypeScript、构建和工作流文件内容；GitHub Actions 实际运行、Release 创建、HTTPS 缓存头、浏览器 Service Worker 接管和 Capacitor 商店更新，需要在远程仓库和真实部署环境中验证。

## v1.1.0 发布说明

2026-11-13 发布使用 Node 22.13+ / pnpm 11。GitHub Release 提供根路径 Web/PWA 压缩包，GitHub Pages 构建使用仓库子路径。API 与 Tauri 源码保留在远程，不包含新的原生安装器；同步盘本地缺失这些目录不代表新版本删除它们。

本次主分支部署已成功。旧工作流同时被 `v1.1.0` 标签触发，但标签部署被仅允许 `main` 的 Pages 环境规则拒绝；没有影响已上线站点。后续 Pages 仅部署主分支，标签继续用于 Release 打包。已发布标签与工件保持不变，远程验证记录见 [v1.1.0 发布验证](releases/v1.1.0-validation.md)。
