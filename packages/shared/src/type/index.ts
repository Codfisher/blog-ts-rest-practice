/** 提取並替換 Mongo Document 物件 id 部分，
 * 用於將 form 物件資料內的關聯欄位轉換成更新用資料。
 *
 * @examples
 * ```typescript
 * // 例如目前的 form 為：
 * const data = {
 *   a: 1,
 *   b: {
 *     id: '2'
 *   },
 *   c: [
 *     {
 *       data: 3,
 *       d: {
 *         id: '4',
 *       }
 *     }
 *   ]
 * }
 *
 * // 可以看出含有 id 的物件是關聯資料，變更的時候應該只給 id，而不是整個物件。
 * // 得 API 傳輸的變更用資料為：
 * const data = {
 *   a: 1,
 *   b: '2',
 *   c: [
 *     {
 *       data: 3,
 *       d: '4'
 *     }
 *   ]
 * }
 * ```
 */
export type SimplifyToObjectIdDeep<T> =
  T extends Array<any> ? SimplifyToObjectIdDeep<T[number]>[] :
  /** 特殊物件要轉換成 mongo id */
    T extends { id: string } ? string :
      T extends object ? { [K in keyof T]: SimplifyToObjectIdDeep<T[K]> } :
        T
