import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 画面は必ず 5173 番で動かす。使用中なら別の番号にずれずにエラーで止まる（CLAUDE.md 参照）
    port: 5173,
    strictPort: true,
    // 画面から /api で始まる URL を呼ぶと、バックエンド（Spring Boot）へ取り次ぐ
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
