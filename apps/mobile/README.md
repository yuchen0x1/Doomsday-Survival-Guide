# @apocalypse/mobile — 移动端（Capacitor）

APOCALYPSE SURVIVAL 末日生存指南的 Android/iOS 壳。**前端完全复用 `apps/web`**（静态打包 `../web/dist`），平台差异全部在 web 层 `src/lib/platform.ts` 实现，页面不复制。

## 配置（`capacitor.config.ts`）

- `appId`: `local.survival.apocalypse`
- `appName`: `APOCALYPSE SURVIVAL`
- `webDir`: `../web/dist`
- 不配置 `server`：打包静态文件，离线可用（未配 live reload）

平台目录已生成：`android/`（applicationId `local.survival.apocalypse`）、`ios/`（PRODUCT_BUNDLE_IDENTIFIER 同值）。

## 常用命令

```bash
# 先构建 web（本包 build 即转发到 web）
pnpm --filter @apocalypse/mobile build

# 同步 web 产物与插件到原生工程（Android + iOS）
pnpm --filter @apocalypse/mobile sync     # = npx cap sync
pnpm --filter @apocalypse/android 同步单端：npx cap sync android

# 原生工程（需本机 Android Studio / Xcode）
npx cap open android
npx cap open ios
```

从零初始化（已执行，勿重复）：`npx cap add android` / `npx cap add ios`。

## 平台差异（均在 web 层实现）

| 差异                    | 实现                                                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 底部导航 + 悬浮急救按钮 | `usePlatformLayout()` 在 mobile 返回 `{sidebar:false, bottomNav:true, fab:true}`，`AppLayout` 强制显示（去掉 `md:hidden` 断点）                                                                                                |
| 安全区                  | `index.html` 已 `viewport-fit=cover`；`styles/index.css` body 左右 `env(safe-area-inset-*)`，header 顶部 `calc(env(safe-area-inset-top) + 10px)`，底部导航 `env(safe-area-inset-bottom)`；`env()` 不支持时回退 0，web 行为不变 |
| 相机权限                | 植物识别页 `<input type="file" accept="image/*" capture="environment">`——仅 `isMobile()` 时附加 `capture`，移动端直接调起后置相机；web/桌面仍是文件选择器                                                                      |
| 平台检测                | `window.Capacitor.isNativePlatform()`（全局对象，web 构建不依赖 @capacitor/core 包）                                                                                                                                           |

## 验证状态

- `npx cap add android` / `add ios` 成功，`npx cap sync` EXIT 0（Windows 无 CocoaPods/xcodebuild，iOS 的 pod install 被跳过——预期）
- v1.1.1 已完成 Android release APK 构建、发布签名以及 23049RAD8C 真机安装、启动与系统保存窗口导出备份。iOS 原生编译仍未验证。
- 原生打包先运行 `node scripts/build-native-web.cjs`，关闭 Web/PWA 缓存更新并内置全部静态资源。`SurvivalFilesPlugin` 使用 Android 系统文件选择器保存备份和 CSV，无需申请全盘文件访问权限。
- 发布使用 JDK 21、Gradle 8.11.1、Android SDK 34；签名材料仅保存在本机受保护文件与 Actions Secrets，后续版本沿用同一证书。详情见 [三端发布说明](../../docs/releases/v1.1.1-platforms.md)。
