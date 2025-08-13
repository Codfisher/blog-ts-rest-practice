import type { ClientInferRequest } from '@ts-rest/core'
import {
  authContract,
  userContract,
} from '@project-code/shared'
import { defineStore } from 'pinia'
import { clone } from 'remeda'
import { computed } from 'vue'
import {
  useClient,
  useQueryClient,
} from '../common/api'
import { useAuthStore } from './auth-store'

type LocalLoginParams = ClientInferRequest<typeof authContract.localLogin>

export const useUserStore = defineStore('user', () => {
  const authStore = useAuthStore()
  const authApi = useClient(authContract)
  const userApi = useQueryClient(userContract)

  // const {
  //   state: user,
  //   isLoading,
  //   execute: refresh,
  // } = useAsyncState(() => userApi.getSelf(), undefined, {
  //   resetOnExecute: false,
  // })

  const userResult = userApi.getSelf.useQuery(
    ['userContract.getSelf'],
    undefined,
    {
      refetchOnWindowFocus: false,
      retry: 1,
      select(data) {
        if (data.status === 200) {
          return data.body
        }
        return undefined
      },
    },
  )
  async function refresh() {
    await Promise.all([
      userResult.refetch(),
    ])
  }

  async function login(params: LocalLoginParams['body']) {
    const { status, body } = await authApi.localLogin({
      body: params,
    })

    if (status === 200) {
      authStore.setAccessToken(body.accessToken)
    }
    else {
      throw new Error('帳號密碼錯誤')
    }

    await userResult.refetch()
  }

  function clear() {
    authStore.setAccessToken('')
    userResult.remove()
    userResult.data.value = undefined
  }

  async function logout() {
    const { status } = await authApi.logout()

    if (status >= 400) {
      throw new Error('登出失敗')
    }

    clear()
    await userResult.refetch()
  }

  return {
    isLoading: userResult.isFetching,
    user: computed(() => clone(userResult.data.value)),
    refresh,
    /** 清除使用者資料 */
    clear,

    login,
    /** 登出同時清除使用者資料 */
    logout,
  }
})
