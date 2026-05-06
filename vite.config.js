import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// 复制 sql.js WASM 文件到 dist
function sqlJsWasmPlugin() {
  return {
    name: 'sql-js-wasm',
    closeBundle() {
      const srcWasm = path.resolve(__dirname, 'node_modules/sql.js/dist/sql-wasm.wasm');
      const destDir = path.resolve(__dirname, 'dist');
      const destWasm = path.join(destDir, 'sql-wasm.wasm');
      if (fs.existsSync(srcWasm) && !fs.existsSync(destWasm)) {
        fs.copyFileSync(srcWasm, destWasm);
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), sqlJsWasmPlugin()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    exclude: ['sql.js']
  }
});