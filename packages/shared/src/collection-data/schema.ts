import { z } from 'zod'
import { objectIdSchema } from '../common'

export const collectionDataSchema = z.object({
  id: objectIdSchema,
  /** 名稱 */
  name: z.string(),
  description: z.string(),
  remark: z.string(),
})
/** 保留給內部使用，client 端應統一從合約取得資料型別
 *
 * [Inferring Response Body](https://ts-rest.com/docs/core/infer-types#inferring-response-body)
 */
export interface CollectionData extends z.infer<typeof collectionDataSchema> { }
