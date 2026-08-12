import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // 部署到子路径（如 /diabetes/）时改为具体路径；默认 './' 相对路径可避免资源 404
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: true,
    open: false,
    // 开发环境代理：将 /api 请求转发到 SpringBoot 后端
    // 后端启动后（默认 http://localhost:8080），VITE_USE_MOCK=false 即可走真实接口
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
