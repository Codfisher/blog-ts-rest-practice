import type * as z from 'zod'
import { get } from 'lodash-es'

// 遞迴取得巢狀欄位的路徑，使用時會自動產生提示
type ExtractPaths<ZodSchema, Prefix extends string = ''> =
  ZodSchema extends z.ZodObject<infer Shape>
    ? {
        [FieldName in keyof Shape]:
        Shape[FieldName] extends z.ZodObject<any>
          ? `${Prefix}${FieldName & string}` | `${Prefix}${FieldName & string}.${ExtractPaths<Shape[FieldName], ''>}`
          : `${Prefix}${FieldName & string}`;
      }[keyof Shape]
    : never

/**
 * 建立一個表單欄位的驗證函式
 * 此函式會生成一個用於驗證特定欄位的函式。驗證函式會根據給定的路徑，透過 `zodObject` 來尋找欄位的 schema 並進行驗證。
 *
 * @template Schema - 表示 Zod schema 的型別
 * @param zodObject - 表單的 Zod schema，包含各欄位的定義
 * @returns 返回一個函式，該函式接收欄位路徑 `path` 和要驗證的值 `val`，若驗證成功則返回 `true`，否則返回錯誤訊息 *
 * @example
 * // 建立一個驗證特定欄位的函式
 * const userFormValidator = createFieldValidator(userFormSchema);
 *
 * // 驗證 "user.userName" 欄位是否有效
 * <q-input
 *   v-model="user.userName"
 *   label="用戶名稱"
 *   :rules="[userFormValidator('userName')]"
 *   lazy-rules
 * />
 */
export function createFieldValidator<Schema extends z.ZodRawShape>(
  zodObject: z.ZodObject<Schema>,
): (path: ExtractPaths<z.ZodObject<Schema>>) => (val: unknown) => true | string {
  return <T extends ExtractPaths<z.ZodObject<Schema>>>(path: T) => (val: unknown) => {
    const pathArray = path.split('.')

    // 使用 reduce 來遍歷 pathArray，動態訪問深層次的 schema
    const fieldSchema = pathArray.reduce<z.ZodTypeAny | undefined>((acc, path) => {
      if (!acc)
        throw new Error('無效的欄位名稱')

      let result: object = acc

      // 如果欄位有設定為 optional， 會需要先 unwrap，再取出 shape
      if ('unwrap' in result && typeof result.unwrap === 'function') {
        result = result.unwrap()
      }

      if ('shape' in result && typeof result.shape === 'object' && result.shape) {
        result = result.shape
      }

      // 使用 lodash 的 get 方法從 result 中取出屬性
      return get(result, path) as z.ZodTypeAny
    }, zodObject)

    if (!fieldSchema) {
      throw new Error('無效的欄位名稱')
    }

    const result = fieldSchema.safeParse(val)

    // 驗證成功返回 true
    if (result.success)
      return true

    // 驗證失敗，返回錯誤訊息，若無錯誤訊息則返回預設訊息
    return result.error?.issues[0]?.message || '無效的輸入內容'
  }
}
