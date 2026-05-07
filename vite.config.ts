import { defineConfig } from 'vite-plus'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugin: [
          'babel-plugin-react-compiler',
          {
            target: '19'
          }
        ]
      }
    }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    lightningcss: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'esbuild'
  }
})
