import type { AppRoute } from '@ts-rest/core'
import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import {
  definePaginatedDataSchema,
  errorMessageSchema,
  objectIdSchema,
} from '../common'
import { accountSchema } from './schema'

const c = initContract()

// 建立 account
const create = {
  method: 'POST',
  path: '/v1/accounts',
  body: z.object({
    username: z.string(),
    password: z.string(),
    name: z.string(),
    description: z.string().optional(),
  }),
  responses: {
    200: z.object({
      id: z.string(),
    }),
    400: z.object({
      reason: z.enum([
        'username-duplicate',
      ]).optional(),
      message: z.string(),
    }),
    403: c.noBody(),
  },
  summary: '建立 account',
} satisfies AppRoute

// 取得 account
const find = {
  method: 'GET',
  path: '/v1/accounts',
  // FIX: 使用 findDtoSchema 會一直出現 TypeError: Cannot read properties of undefined (reading 'extend')
  query: z.object({
    skip: z.coerce.number().int().min(0).optional(),
    limit: z.coerce.number().int().min(0).optional(),
    keyword: z.string().optional(),
  }),
  responses: {
    200: definePaginatedDataSchema(accountSchema),
    404: c.noBody(),
  },
  summary: '取得 account',
} satisfies AppRoute

// 取得指定 account
const findOne = {
  method: 'GET',
  path: '/v1/accounts/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  responses: {
    200: accountSchema,
    404: c.noBody(),
  },
  summary: '取得指定 account',
} satisfies AppRoute

// 更新指定 account
const update = {
  method: 'PATCH',
  path: '/v1/accounts/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  body: create.body.pick({
    name: true,
    password: true,
    description: true,
  }).partial(),
  responses: {
    200: accountSchema,
    403: c.noBody(),
    404: c.noBody(),
  },
  summary: '更新指定 account',
} satisfies AppRoute

// 刪除指定 account
const remove = {
  method: 'DELETE',
  path: '/v1/accounts/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  body: c.noBody(),
  responses: {
    200: c.noBody(),
    403: c.noBody(),
    404: c.noBody(),
  },
  summary: '刪除指定 account',
} satisfies AppRoute

export const accountContract = c.router({
  create,
  find,
  findOne,
  update,
  remove,
}, {
  pathPrefix: '/api',
  commonResponses: {
    400: errorMessageSchema,
    500: errorMessageSchema,
  },
})
