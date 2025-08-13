import type { FlattenMaps, HydratedDocument } from 'mongoose'
import { Types } from 'mongoose'
import { first, map, pipe, when } from 'remeda'

type ParseObjectIdParams = string | Types.ObjectId | { _id: string } | { _id: Types.ObjectId }
/** 嘗試將 string 轉換為 ObjectId 物件
 *
 * 如果提供物件，且有 _id 屬性，則直接取出 _id
 *
 * 可以輸入 Array 會變為 Mongoose.Types.ObjectId[]
 */
export function parseObjectId(value: ParseObjectIdParams): Types.ObjectId
export function parseObjectId(value: ParseObjectIdParams[]): Types.ObjectId[]
export function parseObjectId(value: any) {
  if (!value)
    return value

  const isArray = Array.isArray(value)

  return pipe(
    isArray ? value : [value],
    map((item) => {
      if (!item) {
        return item
      }

      if (item instanceof Types.ObjectId) {
        return item
      }

      const id = pipe(
        undefined,
        () => {
          if (typeof item === 'object' && '_id' in item) {
            return `${item._id}`
          }

          return `${item}`
        },
      )

      return Types.ObjectId.createFromHexString(id)
    }),
    when(() => !isArray, first()),
  )
}

type SimplifiedDoc<Doc> = Omit<FlattenMaps<Doc>, '_id'> & { _id: string }

/** 將 Document 轉換為一般 JS 物件並將其中的 ObjectId 轉為 string
 *
 * 也可以避免 ts-rest 認為 id 的 ObjectId 與 string 不同的問題
 *
 * 目前型別判斷有些問題，會跑出很多不存在的 method，請不要使用資料以外的 property
 *
 * 不轉為一般物件的話 omit、pick 這類 utils function 會無法正常運作，
 * 也不用將 ObjectId 再轉成 string
 *
 * @deprecated Mongoose document 有提供 id 屬性，即為 string 版本的 _id
 *
 * ignore coverage
 */
export function toObject<Data, Doc extends HydratedDocument<Data>>(
  doc: Doc,
): SimplifiedDoc<Doc>
export function toObject<Data, Doc extends HydratedDocument<Data>>(
  doc: Doc | undefined | null,
): undefined | SimplifiedDoc<Doc>
export function toObject<Data, Doc extends HydratedDocument<Data>>(
  doc?: Doc | null,
) {
  if (!doc) {
    return undefined
  }

  try {
    const result = {
      ...doc.toObject({ flattenMaps: true }),
      _id: doc.id,
    }

    return result as SimplifiedDoc<Doc>
  }
  catch {
    return doc
  }
}
