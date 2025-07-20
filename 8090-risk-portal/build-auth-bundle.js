import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildAuthBundle() {
  try {
    await build({
      configFile: false,
      build: {
        outDir: path.resolve(__dirname, 'public'),
        emptyOutDir: false,
        lib: {
          entry: path.resolve(__dirname, 'public/auth.js'),
          name: 'AuthBundle',
          fileName: 'auth-bundle',
          formats: ['iife']
        },
        rollupOptions: {
          external: [],
          output: {
            globals: {}
          }
        }
      }
    });
    console.log('Auth bundle built successfully');
  } catch (error) {
    console.error('Failed to build auth bundle:', error);
    process.exit(1);
  }
}

buildAuthBundle();