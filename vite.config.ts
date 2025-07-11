import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/test_game/', // 꼭 수정
  plugins: [react()],
})