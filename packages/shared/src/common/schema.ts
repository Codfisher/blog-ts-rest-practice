import type { EmptyObject as FEmptyObject } from 'type-fest'
import { z } from 'zod'

export const objectIdSchema = z.coerce.string().regex(/^[0-9a-f]{24}$/)

/** nestjs 不允許 controller 回傳 null、undefined，
 * 會自動轉換成空物件，也就是 {}
 *
 * @deprecated 請不要使用，建議使用 contract.noBody()
 */
export const emptyObjectSchema = z.object({})
export type EmptyObject = FEmptyObject

/** 基本錯誤訊息 */
export const errorMessageSchema = z.object({
  message: z.string(),
})

/** bearer 授權標頭 */
export const bearerTokenSchema = z.object({
  authorization: z.string().regex(/^Bearer/).optional(),
})

export const timestampSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  /** 用於實現軟刪除 */
  deletedAt: z.string().datetime().optional(),
})
export interface Timestamp extends z.infer<typeof timestampSchema> { }

/** 基於頁數的分頁資料 */
export function definePaginatedDataSchema<Data extends z.ZodTypeAny>(dataSchema: Data) {
  return z.object({
    skip: z.coerce.number(),
    limit: z.coerce.number(),
    total: z.coerce.number(),
    data: z.array(dataSchema),
  })
}
/** 基於頁數的分頁資料 */
export interface PaginatedData<Data> {
  skip: number;
  limit: number;
  total: number;
  data: Data[];
}

/** 基於 Cursor 的分頁資料 */
export function defineCursorPaginatedDataSchema<Data extends z.ZodTypeAny>(dataSchema: Data) {
  return z.object({
    /** data 內的資料不包含 startId 項目 */
    startId: z.string().optional(),
    limit: z.coerce.number(),
    data: z.array(dataSchema),
  })
}
/** 基於 Cursor 的分頁資料 */
export interface CursorCursorPaginatedData<Data> {
  startId?: string;
  limit: number;
  data: Data[];
}
