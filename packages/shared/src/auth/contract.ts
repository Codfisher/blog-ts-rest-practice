import type { AppRoute } from '@ts-rest/core'
import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import { errorMessageSchema } from '../common'

const c = initContract()

// 本地登入
const localLogin = {
  method: 'POST',
  path: '/v1/auth/local',
  body: z.object({
    username: z.string(),
    password: z.string(),
  }),
  responses: {
    200: z.object({
      accessToken: z.string(),
    }),
    403: c.noBody(),
  },
  summary: '本地登入',
} satisfies AppRoute

// 更新權杖
const refresh = {
  method: 'GET',
  path: '/v1/auth/refresh',
  responses: {
    200: z.object({
      accessToken: z.string(),
    }),
    403: c.noBody(),
  },
  summary: 'access token 過期後，可用 refresh token 取得新的 access token',
} satisfies AppRoute

// 登出
const logout = {
  method: 'DELETE',
  path: '/v1/auth',
  body: c.noBody(),
  responses: {
    204: c.noBody(),
  },
  summary: '登出',
} satisfies AppRoute

export const authContract = c.router({
  localLogin,
  refresh,
  logout,
}, {
  pathPrefix: '/api',
  commonResponses: {
    400: errorMessageSchema,
    401: errorMessageSchema,
    500: errorMessageSchema,
  },
})
