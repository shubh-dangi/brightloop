import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
process.env.NAPI_RS_FORCE_WASI = 'true';

try {
  const oxidePath = require.resolve('@tailwindcss/oxide', {
    paths: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, '../../node_modules')],
  });
  const { Scanner } = require(oxidePath);

  // Patch Scanner.prototype.scan for WASI on Windows
  Scanner.prototype.scan = function () {
    const candidates = new Set<string>();
    const walk = (dir: string) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (
              entry.name !== 'node_modules' &&
              entry.name !== 'dist' &&
              entry.name !== '.git'
            ) {
              walk(full);
            }
          } else if (
            /\.(tsx|ts|jsx|js|html|css)$/.test(entry.name) &&
            !entry.name.includes('(2)')
          ) {
            try {
              const content = fs.readFileSync(full, 'utf8');
              const ext = path.extname(entry.name).slice(1);
              const found = this.getCandidatesWithPositions({
                content,
                extension: ext,
              });
              for (const item of found) {
                candidates.add(item.candidate);
              }
            } catch {}
          }
        }
      } catch {}
    };

    walk(path.resolve(__dirname, './src'));
    return Array.from(candidates);
  };
} catch (e) {
  console.warn('Could not patch Scanner:', e);
}

const { default: tailwindcss } = await import('@tailwindcss/vite');

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
