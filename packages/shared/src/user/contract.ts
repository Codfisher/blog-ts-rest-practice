import type { AppRoute } from '@ts-rest/core'
import { initContract } from '@ts-rest/core'
import { errorMessageSchema } from '../common/schema'
import { userSchema } from './schema'

const contract = initContract()

// 取得 user 自身資料
const getSelf = {
  method: 'GET',
  path: '/v1/user/self',
  responses: {
    200: userSchema,
  },
  summary: '取得 user 自身資料',
} satisfies AppRoute

export const userContract = contract.router({
  getSelf,
}, {
  pathPrefix: '/api',
  commonResponses: {
    400: errorMessageSchema,
    401: errorMessageSchema,
    403: errorMessageSchema,
    500: errorMessageSchema,
  },
})
