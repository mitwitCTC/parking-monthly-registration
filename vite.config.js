import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
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
})
