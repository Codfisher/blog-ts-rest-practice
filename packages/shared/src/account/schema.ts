import { z } from 'zod'
import { objectIdSchema } from '../common'
import { ACCOUNT_ROLE } from './constant'

export const accountSchema = z.object({
  id: objectIdSchema,
  role: z.nativeEnum(ACCOUNT_ROLE),
  username: z.string(),
  name: z.string(),
  description: z.string().optional(),
})
/** 保留給內部使用，client 端應統一從合約取得資料型別
 *
 * [Inferring Response Body](https://ts-rest.com/docs/core/infer-types#inferring-response-body)
 */
export type Account = z.infer<typeof accountSchema>
