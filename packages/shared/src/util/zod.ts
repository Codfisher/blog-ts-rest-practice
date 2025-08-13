import z from 'zod'

/** 解決 z.coerce.boolean() 轉換問題
 *
 * 在 query string 中的 false 會被當為 'false'，導致被轉換成 true
 *
 * 2025/02/10 發現
 * 使用 [jsonQuery](https://ts-rest.com/docs/nest/configuration#jsonquery) 可以解決這個問題
 *
 * ts-rest 會自動轉換，不需要使用這個函數
 *
 * @example
 * ```typescript
 * const find = {
 *   ...
 *   query: findDtoSchema.extend({
 *     lean: z.boolean()
 *       .or(z.string())
 *       .pipe(toBoolean)
 *       .optional()
 *   }),
 *   ...
 * } as const satisfies AppRoute
 * ```
 */
export const toBoolean = z.coerce
  .string()
  .transform((value) => {
    if (['false', '0', 'null', 'undefined'].includes(value)) {
      return false
    }

    return true
  })

/** 處理大型型別序列化問題，通過 superRefine 轉換來簡化型別推導，提供型別安全的資料驗證
 *
 * 在 ts-rest 中，有時候會遇到 TS 警告資料序列化過大等等問題，使用此函數將 schema 簡化即可
 */
export function simplifyTypeInference<T>(schema: z.ZodType<T>) {
  return schema
}
