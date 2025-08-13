import { defineConfig } from 'vitest/config'
// 原先的 vite 設定檔案

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
})
