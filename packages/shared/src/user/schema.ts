import type { z } from 'zod'
import { accountSchema } from '../account'

export const userSchema = accountSchema.extend({
})
/** 保留給內部使用，client 端應統一從合約取得資料型別
 *
 * [Inferring Response Body](https://ts-rest.com/docs/core/infer-types#inferring-response-body)
 */
/** 針對當前使用者附加內容的 Account */
export interface User extends z.infer<
  typeof userSchema
> { }
