import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor 配置：静态打包 @apocalypse/web 的构建产物（不配置 live server）。
 * 平台差异（底部导航 / 安全区 / 相机 capture）由 web 层 platform.ts 处理，页面不复制。
 */
const config: CapacitorConfig = {
  appId: 'local.survival.apocalypse',
  appName: 'APOCALYPSE SURVIVAL',
  webDir: '../web/dist',
  // 服务器不配置：打包静态文件，离线可用
};

export default config;
