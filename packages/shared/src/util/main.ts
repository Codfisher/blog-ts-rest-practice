import type { SimplifyToObjectIdDeep } from '../type'

/** 只保留 mongo 物件 id 部分
 *
 * @example
 * ```typescript
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
 * // 變為
 *
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
export function simplifyToDocIdDeep<T>(
  object: T,
): T extends object ? SimplifyToObjectIdDeep<T> : T {
  if (object === null || object === undefined) {
    // @ts-expect-error null 和 undefined 不需要額外處理
    return object
  }

  // 一般型別
  if (typeof object !== 'object') {
    const value: any = object
    return value
  }

  // 矩陣
  if (Array.isArray(object)) {
    const result: any = object.map(simplifyToDocIdDeep)
    return result
  }

  // 單層
  if (object && typeof object === 'object' && 'id' in object) {
    return object.id as any
  }

  // 深層物件
  const result: any = {}

  Object.entries((object as any)).forEach(([key, value]: [string, any]) => {
    if (Array.isArray(value)) {
      const newValue = value.map(simplifyToDocIdDeep)
      result[key] = newValue
      return
    }

    if (typeof value === 'object') {
      if (!value) {
        result[key] = value
        return
      }

      if ('id' in value) {
        result[key] = value.id
        return
      }

      const newValue = simplifyToDocIdDeep(value)
      result[key] = newValue
      return
    }

    result[key] = value
  })

  return result
}
