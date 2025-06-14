import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // 👈 关键！打包后资源路径相对 index.html
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5172,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  }
})
