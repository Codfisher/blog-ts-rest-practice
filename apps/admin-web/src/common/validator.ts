/** 各類表單驗證 function FP 版本 */

import type { ValidationRule } from 'quasar'
import { isNil } from 'lodash-es'

// TODO: 追加 test

/** 建立符合 Quasar field rule 參數
 *
 * rule 回傳 undefined 時，會提前中止檢查，通過驗證
 *
 * @example
 * ```typescript
 * // 單一規則
 * const notEmptyRule = createRule([notEmpty], '不可為空');
 *
 * // 加入 optional 變成選填
 * const mailRule = createRule([optional, isEmail], '必須為 E-mail');
 *
 * // 自定義規則與錯誤訊息
 * const rule = createRule([
 *   (value: string) => value.length <= 20 || '最多 20 個字',
 * ], '資料錯誤')
 *
 * // 也可以組合規則，用於判斷交叉條件
 * const startDateRule = createRule([
 *   isDate,
 *   (value: any) => {
 *     const data = String(value)
 *
 *     if (
 *       searchForm.value.endDate
 *       && dayjs(data).isAfter(searchForm.value.endDate)
 *     ) {
 *       return '開始日期不可晚於結束日期'
 *     }
 *     return true
 *   },
 * ], '請輸入有效日期（YYYY-MM-DD）')
 *
 * // 展開成矩陣可以組成複合規則
 * const nameRule = [
 *  ...createRule([notEmpty], '不可為空'),
 *  ...createRule([(value: string) => value.length <= 20], '最多 20 個字元'),
 * ];
 * ```
 */
export function createRule(
  rules: ((value: unknown) => boolean | string | undefined)[],
  message?: string,
) {
  return [
    (data: unknown) => {
      try {
        for (const rule of rules) {
          const result = rule(data)
          if (typeof result === 'string') {
            return result
          }

          if (result === undefined) {
            return true
          }

          if (result === true) {
            continue
          }

          if (result === false) {
            return message
          }
        }
      }
      catch (error) {
        return `${error}`
      }

      return true
    },
  ] as ValidationRule[]
}

/** 數值是否大於零之正整數 */
export function isPositiveNumberGreaterThan0(value: any) {
  return /^0*[1-9]\d*$/.test(`${value}`)
}

/** 數值是否正整數 */
export function isPositiveNumber(value: any) {
  return /^\d+$/.test(`${value}`)
}

/**
 * 數值是否為 `null`、`undefined`、`''`、`[]`
 */
function isOptional(value: any) {
  if (Array.isArray(value)) {
    return value.length === 0
  }

  return isNil(value) || value === ''
}

/**
 * 若數值是否為 `null`、`undefined`、`''`、`[]`，則回傳 `undefined`
 *
 * 讓 createRule 可以使用 `optional` 來判斷是否為選填欄位
 */
export function optional(value: any) {
  const result = isOptional(value)

  return result ? undefined : true
}
/** isOptional 的反轉 */
export function notEmpty(value: any) {
  return !isOptional(value)
}

/** 僅限 YYYY-MM-DD 格式 */
export function isDate(value: any) {
  const regex = /^(\d{4})-(\d{2})-(\d{2})$/
  if (!regex.test(value)) {
    return false
  }

  const [, year, month, day] = (regex.exec(value) as RegExpExecArray).map(Number)
  const date = new Date(year!, month! - 1, day)

  if (date.getFullYear() !== year
    || date.getMonth() + 1 !== month
    || date.getDate() !== day) {
    return false
  }

  return true
}
