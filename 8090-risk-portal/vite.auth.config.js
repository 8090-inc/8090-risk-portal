import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    outDir: 'public',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        auth: path.resolve(__dirname, 'public/auth.js')
      },
      output: {
        entryFileNames: '[name]-bundle.js',
        format: 'iife'
      }
    }
  },
  resolve: {
    alias: {
      'promise-polyfill': path.resolve(__dirname, 'node_modules/promise-polyfill/dist/polyfill.js'),
      'whatwg-fetch': path.resolve(__dirname, 'node_modules/whatwg-fetch/dist/fetch.umd.js'),
      'url-polyfill': path.resolve(__dirname, 'node_modules/url-polyfill/url-polyfill.js')
    }
  }
});