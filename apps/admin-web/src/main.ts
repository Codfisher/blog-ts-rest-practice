import type { QuasarPluginOptions } from 'quasar'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

// import i18n from './locales/i18n';
import dayjs from 'dayjs'
import {
  Dialog,
  Loading,
  Meta,
  Notify,
  Quasar,
} from 'quasar'

import iconSet from 'quasar/icon-set/material-symbols-rounded'
import quasarLang from 'quasar/lang/zh-TW'
// import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'

import App from './App.vue'

// icon 與字體改為在 HTML 中加入 CDN，降低 GAE 流量
// import '@quasar/extras/roboto-font/roboto-font.css'
// import '@quasar/extras/material-symbols-rounded/material-symbols-rounded.css'

// Import Quasar css
import 'quasar/src/css/index.sass'
import 'dayjs/locale/zh-tw'

// Uno CSS
import 'virtual:uno.css'
// 自訂樣式
import './style/transition.sass'
import './style/global.sass'

dayjs.locale('zh-tw')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

if (import.meta.hot) {
  handleHotUpdate(router)
}

createApp(App)
  .use(Quasar, {
    plugins: {
      Notify,
      Dialog,
      Loading,
      Meta,
    },
    lang: quasarLang,
    iconSet,
  } as QuasarPluginOptions)
  .use(createPinia())
  .use(router)
  .use(VueQueryPlugin)
  // .use(i18n)
  .mount('#app')
