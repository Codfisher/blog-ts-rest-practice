import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import vueI18n from '@intlify/unplugin-vue-i18n/vite'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  const isBuild = command === 'build'
  const base = isBuild ? (process.env.VITE_BASE_URL ?? '/_admin/') : '/'
  console.log('[web] baseUrl:', base)

  const legacyTargets = isBuild
    ? ['Android > 39', 'Chrome >= 60', 'Safari >= 10.1', 'iOS >= 10.3', 'Firefox >= 54', 'Edge >= 15']
    : undefined

  return {
    base,
    optimizeDeps: {
      exclude: ['type-fest', '@project-code/shared'],
    },
    esbuild: {
      drop: isBuild ? ['console', 'debugger'] : [],
    },
    css: {
      preprocessorOptions: {
        sass: {
          silenceDeprecations: ['legacy-js-api'],
          // FIX: 會導致 [sass] Can't find stylesheet to import.，待確認原因
          // api: 'modern-compiler', // or 'modern'
        },
      },
    },
    plugins: [
      // VueDevTools(),
      VueRouter({
        // 只有 index 或 ] 結尾名稱會變成 route
        filePatterns: ['**/*index', '**/*]'],
      }),
      // FIX: 此插件在 HMR 時會讓整個頁面消失，暫停使用，需要進一步調查問題
      // Layouts(),
      vue({
        template: { transformAssetUrls },
      }),
      vueI18n({
        include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
      }),

      quasar({
        // 改由 UnoCSS 處理
        // sassVariables: 'src/style/quasar-variables.sass',
      }),

      Unocss(),

      legacy({ targets: legacyTargets }),
    ],
    test: {
      environment: 'happy-dom',
      coverage: {
        reporter: ['html'],
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['../../'],
      },
    },
  }
})
