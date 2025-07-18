import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/gcip-iap-browser.js',
      name: 'GcipIap',
      fileName: 'gcip-iap-bundle',
      formats: ['umd']
    },
    outDir: './public',
    rollupOptions: {
      external: ['firebase', 'firebase/app', 'firebase/auth'],
      output: {
        globals: {
          firebase: 'firebase',
          'firebase/app': 'firebase',
          'firebase/auth': 'firebase'
        }
      }
    }
  }
});