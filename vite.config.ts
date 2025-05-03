import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['phaser'] // Phaser本体はCDNで読み込むため除外
    },
    assetsInlineLimit: 0,
  },
  base: '/jump-master/',
});
