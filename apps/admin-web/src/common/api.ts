import type { AppRoute, AppRouter, ClientInferResponseBody } from '@ts-rest/core'
import { authContract } from '@ts-rest-practice/shared'
import { initClient, tsRestFetchApi } from '@ts-rest/core'
import { initQueryClient } from '@ts-rest/vue-query'
import { memoize } from 'lodash-es'
import hash from 'object-hash'
import { useAuthStore } from '../stores/auth-store'
import { useUserStore } from '../stores/user-store'

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
console.log('[api] baseUrl:', baseUrl)

/** 使用 memoize 避免反覆建立相同的 client，導致記憶體使用率激增 */

/** 自動加入 Authorization Header */
export const useClient = memoize(
  <T extends AppRouter>(
    router: T,
    options?: Parameters<typeof initClient>[1],
  ) => initClient(router, {
    baseUrl,
    baseHeaders: {},
    jsonQuery: true,
    api: async (args) => {
      const { accessToken } = useAuthStore()

      return tsRestFetchApi({
        ...args,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...args.headers,
        },
      })
    },
    ...options,
  }),
  (router, options) => hash({ router, options }),
)

/** 自動加入 Authorization Header 且 401 時自動 refresh */
export const useAutoRefreshClient = memoize(
  <T extends AppRouter>(
    router: T,
    options?: Parameters<typeof initClient>[1],
  ) => initClient(router, {
    baseUrl,
    jsonQuery: true,
    api: async (args) => {
      const authStore = useAuthStore()
      let accessToken = authStore.accessToken

      let res = await tsRestFetchApi({
        ...args,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...args.headers,
        },
      })

      // 只有 401 需要處理 refreshToken
      if (res.status !== 401) {
        return res
      }

      const authApi = initClient(authContract, {
        baseUrl,
        ...options,
      })

      const result = await authApi.refresh()
      if (result.status === 200) {
        accessToken = result.body.accessToken
        authStore.setAccessToken(accessToken)
      }

      /** 再發送一次剛剛被 401 的請求 */
      res = await tsRestFetchApi({
        ...args,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...args.headers,
        },
      })
      if (res.status === 401) {
        const userStore = useUserStore()
        userStore.clear()
      }

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
      const { accessToken } = useAuthStore()

      return tsRestFetchApi({
        ...args,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...args.headers,
        },
      })
    },
    ...options,
  }),
  (router, options) => hash({ router, options }),
)

/** TODO: status code >= 400，自動拋出 Error */
export async function requestWithAutoThrow<
  Route extends AppRoute,
>(
  api: () => Promise<{
    status: number;
    body: ClientInferResponseBody<Route, 200 | 201>;
  }>,
) {
  const result = await api()
  if (result.status >= 400) {
    throw result.body
  }

  return result.body as ClientInferResponseBody<Route, 200 | 201>
}
