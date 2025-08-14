import type { AppRouter } from '@ts-rest/core'
import { initClient, tsRestFetchApi } from '@ts-rest/core'
import { initQueryClient } from '@ts-rest/vue-query'
import { authContract } from '@ts-rest-practice/shared'
import { until } from '@vueuse/core'
import { memoize } from 'lodash-es'
import hash from 'object-hash'
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth-store'

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

/** 使用 memoize 避免反覆建立相同的 client，導致記憶體使用率激增 */

/** 用於防止多次 refresh */
const isRefreshing = ref(false)

/** 自動加入 Authorization Header 且 401 時自動 refresh */
export const useClient = memoize(
  <T extends AppRouter>(
    router: T,
    options?: Parameters<typeof initClient>[1],
  ) => initClient(router, {
    baseUrl,
    jsonQuery: true,
    api: async (args) => {
      const authStore = useAuthStore()

      await until(isRefreshing).toBe(false)
      let res = await tsRestFetchApi({
        ...args,
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
          ...args.headers,
        },
      })

      // 只有 401 需要處理 refreshToken
      if (res.status !== 401) {
        return res
      }

      // 防止多次 refresh
      if (!isRefreshing.value) {
        const refreshClient = initClient(authContract, {
          baseUrl,
          ...options,
        })

        isRefreshing.value = true
        const result = await refreshClient.refresh()
        isRefreshing.value = false

        if (result.status === 200) {
          authStore.setAccessToken(result.body.accessToken)
        }
      }

      await until(isRefreshing).toBe(false)
      /** 再發送一次剛剛被 401 的請求 */
      res = await tsRestFetchApi({
        ...args,
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
          ...args.headers,
        },
      })

      return res
    },
    ...options,
  }),
  (router, options) => hash({ router, options }),
)

/** 自動加入 Authorization Header */
export const useQueryClient = memoize(
  <T extends AppRouter>(
    router: T,
    options?: Parameters<typeof initQueryClient>[1],
  ) => initQueryClient(router, {
    baseUrl,
    baseHeaders: {},
    jsonQuery: true,
    api: async (args) => {
      const authStore = useAuthStore()

      await until(isRefreshing).toBe(false)
      let res = await tsRestFetchApi({
        ...args,
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
          ...args.headers,
        },
      })

      // 只有 401 需要處理 refreshToken
      if (res.status !== 401) {
        return res
      }

      if (!isRefreshing.value) {
        const refreshClient = initClient(authContract, {
          baseUrl,
          ...options,
        })

        isRefreshing.value = true
        const result = await refreshClient.refresh()
        isRefreshing.value = false

        if (result.status === 200) {
          authStore.setAccessToken(result.body.accessToken)
        }
      }

      await until(isRefreshing).toBe(false)
      /** 再發送一次剛剛被 401 的請求 */
      res = await tsRestFetchApi({
        ...args,
        headers: {
          ...args.headers,
          Authorization: `Bearer ${authStore.accessToken}`,
        },
      })

      return res
    },
    ...options,
  }),
  (router, options) => hash({ router, options }),
)
