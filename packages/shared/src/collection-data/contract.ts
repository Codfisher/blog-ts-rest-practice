import type { AppRoute } from '@ts-rest/core'
import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import {
  definePaginatedDataSchema,
  errorMessageSchema,
  findDtoSchema,
  objectIdSchema,
} from '../common'
import { collectionDataSchema } from './schema'

const contract = initContract()

// 建立 collection-data
export const createCollectionDataDtoSchema = collectionDataSchema.omit({
  id: true,
}).partial({
  remark: true,
  description: true,
})
/** 建立 collection-data */
const create = {
  method: 'POST',
  path: '/v1/collection-data',
  body: createCollectionDataDtoSchema,
  responses: {
    200: collectionDataSchema,
  },
  summary: '建立 collection-data',
} as const satisfies AppRoute

// 取得 collection-data
const find = {
  method: 'GET',
  path: '/v1/collection-data',
  query: findDtoSchema.extend({}),
  responses: {
    200: definePaginatedDataSchema(collectionDataSchema),
  },
  summary: '取得 collection-data',
} as const satisfies AppRoute

// 取得指定 collection-data
const findOne = {
  method: 'GET',
  path: '/v1/collection-data/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  responses: {
    200: collectionDataSchema,
    404: contract.noBody(),
  },
  summary: '取得指定 collection-data',
} as const satisfies AppRoute

// 更新指定 collection-data
const update = {
  method: 'PATCH',
  path: '/v1/collection-data/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  body: createCollectionDataDtoSchema.partial().extend({
    /** 描述變更內容 */
    updateDescription: z.string().optional(),
  }),
  responses: {
    200: collectionDataSchema,
    204: contract.noBody(),
    404: contract.noBody(),
  },
  summary: '更新指定 collection-data',
} as const satisfies AppRoute

// 刪除指定 collection-data
const remove = {
  method: 'DELETE',
  path: '/v1/collection-data/:id',
  pathParams: z.object({
    id: objectIdSchema,
  }),
  body: contract.noBody(),
  responses: {
    200: contract.noBody(),
    404: contract.noBody(),
  },
  summary: '刪除指定 collection-data',
} as const satisfies AppRoute

/** collection-data API 合約
 *
 * 包含基本 CRUD 操作
 */
export const collectionDataContract = contract.router({
  create,
  find,
  findOne,
  update,
  remove,
}, {
  pathPrefix: '/api',
  commonResponses: {
    400: errorMessageSchema,
    401: errorMessageSchema,
    500: errorMessageSchema,
  },
})
