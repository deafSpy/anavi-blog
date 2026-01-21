// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { VitePWA } from 'vite-plugin-pwa';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
  ],
  vite: {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Anavi Blog',
          short_name: 'Anavi',
          start_url: '/',
          display: 'standalone',
          background_color: '#f8fafc',
          theme_color: '#f8fafc',
          icons: [],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif}'],
          // Exclude large files from precaching for low-bandwidth users
          globIgnores: ['books/background.png'],
          maximumFileSizeToCacheInBytes: 2 * 1024 * 1024, // 2 MB limit
        },
        includeAssets: ['favicon.svg'],
      }),
    ],
  },
});
