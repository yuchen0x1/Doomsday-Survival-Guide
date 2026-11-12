# 在线更新与发布

## 当前实现

当前项目是离线优先的 React + Vite PWA，并由 Capacitor 复用 Web 资产。Web 端使用 `vite-plugin-pwa` 生成 Workbox Service Worker：

- 构建产物由 Service Worker 预缓存，断网时继续使用上一份可用资源。
- 更新策略为 `prompt`。发现新资源后，界面显示「立即更新 / 稍后处理」，不会在用户阅读中强制刷新。
- 设置页显示当前版本、Service Worker 状态、上次检查时间，并提供手动检查。
- 更新只替换同源 Web 静态资源；IndexedDB 中的收藏、历史、物资、笔记和档案不会被清除。
- 网络失败、没有 Service Worker 或不在 HTTPS/localhost 安全上下文时，应用继续启动并保留当前缓存。

版本由根 `package.json` 的 `version` 在 Vite 构建时注入 `VITE_APP_VERSION`。发布标签统一使用 `vMAJOR.MINOR.PATCH`，例如 `v1.0.1`。

## GitHub Pages 首次启用

在 GitHub 仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。之后推送到 `main` 或推送 `vMAJOR.MINOR.PATCH` 标签，`pages.yml` 会自动部署项目站点。默认地址为：

```text
https://yuchen0x1.github.io/Doomsday-Survival-Guide/
```

当前仓库 README 中的 WorkBuddy Demo 是另一套静态托管地址；GitHub Pages 部署不会自动替换 WorkBuddy 上的文件。若继续让用户访问 WorkBuddy 地址，必须在 WorkBuddy 的发布入口重新发布同一份 `apps/web/dist`。

## GitHub Actions

## GitHub Pages 首次启用

在 GitHub 仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。之后推送到 `main` 或推送 `vMAJOR.MINOR.PATCH` 标签，`pages.yml` 会自动部署项目站点。默认地址为：

```text
https://yuchen0x1.github.io/Doomsday-Survival-Guide/
```

当前仓库 README 中的 WorkBuddy Demo 是另一套静态托管地址；GitHub Pages 部署不会自动替换 WorkBuddy 上的文件。若继续让用户访问 WorkBuddy 地址，必须在 WorkBuddy 的发布入口重新发布同一份 `apps/web/dist`。

- `.github/workflows/ci.yml`：只监听 `main` 的 push 和 Pull Request，执行 lint、typecheck、test、build，权限为 `contents: read`。
- `.github/workflows/release-web.yml`：版本标签或手动触发时构建 `apps/web/dist`，生成压缩包和真实 SHA-256 文件，并上传 Actions 工件。
- `.github/workflows/pages.yml`：`main` 或版本标签更新后，自动构建并部署 `apps/web/dist` 到 GitHub Pages；构建时使用仓库子路径，补充 `404.html` 以支持 SPA 路由。
- 正式 GitHub Release 默认不会自动创建。只有从 Actions 手动运行并明确勾选 `publish_release=true` 时，发布 job 才使用内置 `GITHUB_TOKEN` 创建 Release。

推荐发布步骤：

```bash
git checkout main
git pull --ff-only origin main
# 修改根 package.json 的 version，例如 1.0.1
git tag v1.0.1
git push origin main v1.0.1
```

推送 `main` 或版本标签会触发 GitHub Pages 部署，用户访问的站点会得到新构建；版本标签还会生成可下载的 Actions 工件。确认构建结果后，在 GitHub Actions 手动运行 `Web release package`，填写相同的标签并勾选正式发布，可同步创建 GitHub Release。

## 安全边界与限制

- PWA 静态资源必须从 HTTPS 或 localhost 同源提供；部署时请让 `index.html`、`sw.js` 和 manifest 使用短缓存或 `no-cache`。
- GitHub Actions 生成的 SHA-256 只用于发布工件校验；浏览器 PWA 不会把压缩包下载到本机再安装，因此不伪造桌面安装包签名、下载进度或静默安装能力。
- 当前没有桌面安装包、代码签名证书或自定义更新服务器；Tauri/Capacitor 原生应用仍需分别通过其平台分发渠道更新。GitHub Pages 只负责 Web/PWA 静态站点。

## 故障处理

更新检查失败时，当前版本继续可用；用户可以稍后重试。Service Worker 只有在新资源安装并接管后才刷新页面，旧缓存不会在检查失败时被删除。若发布工件校验失败，应停止分发该工件并重新构建，不要覆盖已发布版本。

## 外部验证

本地可以验证 TypeScript、构建和工作流文件内容；GitHub Actions 实际运行、Release 创建、HTTPS 缓存头、浏览器 Service Worker 接管和 Capacitor 商店更新，需要在远程仓库和真实部署环境中验证。
