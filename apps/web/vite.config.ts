import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const configuredBase = process.env.VITE_BASE_PATH?.trim() || '/';
const basePath = configuredBase.endsWith('/') ? configuredBase : `${configuredBase}/`;
const rootPackage = JSON.parse(
  fs.readFileSync(path.resolve(configDir, '../../package.json'), 'utf8'),
) as {
  version?: string;
};

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      disable: process.env.VITE_NATIVE_BUILD === '1',
      // 由界面提示用户更新，避免在阅读过程中强制重载页面。
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'APOCALYPSE SURVIVAL 末日生存指南',
        short_name: '末日生存指南',
        description: '跨平台末日生存百科全书：知识图鉴、急救手册、离线生存知识',
        theme_color: '#0B0D0C',
        background_color: '#0B0D0C',
        display: 'standalone',
        id: basePath,
        start_url: basePath,
        scope: basePath,
        icons: [
          { src: `${basePath}icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${basePath}icon-512.png`, sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // 核心知识全部预缓存，保证离线可用
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallback: `${basePath}index.html`,
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin !== location.origin && url.pathname.includes('/api/'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.VITE_APP_VERSION ?? rootPackage.version ?? '0.0.0'),
  },
  resolve: {
    alias: { '@': path.resolve(configDir, 'src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 4000,
  },
});
