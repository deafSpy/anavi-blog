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
          background_color: '#0f172a',
          theme_color: '#0f172a',
          icons: [],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif}'],
        },
        includeAssets: ['favicon.svg'],
      }),
    ],
  },
});
