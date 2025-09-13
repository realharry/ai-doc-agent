import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        options: resolve(__dirname, 'src/options/index.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'background' || chunkInfo.name === 'content' 
            ? '[name].js' 
            : 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Move HTML files to root level with proper names
          if (assetInfo.name?.endsWith('.html')) {
            if (assetInfo.name.includes('popup') || assetInfo.originalFileName?.includes('popup')) {
              return 'popup.html'
            } else if (assetInfo.name.includes('options') || assetInfo.originalFileName?.includes('options')) {
              return 'options.html'
            }
            return '[name].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        },
      },
    },
  },
  publicDir: 'public',
})