import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages 部署路徑：https://<user>.github.io/parking-monthly-registration/
  // dev 走根路徑，build 時套 repo 子路徑
  base: command === 'build' ? '/parking-monthly-registration/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      // 程式呼叫 /member/... → 轉發到正式 API
      '/member': {
        target: 'https://rental.mitwit-cre.com.tw',
        changeOrigin: true,
        secure: true,
      },
    },
  },
}))
