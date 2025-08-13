import { describe, expect, it } from 'vitest'
import { createRule, isDate, notEmpty, optional } from './validator'

describe('validator', () => {
  describe('optional', () => {
    it(`當值為 null, undefined, '', [] 時，應返回 undefined`, () => {
      expect(optional(null)).toBe(undefined)
      expect(optional(undefined)).toBe(undefined)
      expect(optional('')).toBe(undefined)
      expect(optional([])).toBe(undefined)
    })

    it('當值為非空值時，應返回 true', () => {
      expect(optional('test')).toBe(true)
      expect(optional(123)).toBe(true)
      expect(optional([1, 2, 3])).toBe(true)
      expect(optional({})).toBe(true)
    })
  })

  describe('notEmpty', () => {
    it('當值為 null, undefined, 或空字串時，應返回 false', () => {
      expect(notEmpty(null)).toBe(false)
      expect(notEmpty(undefined)).toBe(false)
      expect(notEmpty('')).toBe(false)
    })

    it('當值為空陣列時，應返回 false', () => {
      expect(notEmpty([])).toBe(false)
    })

    it('當值為非空值時，應返回 true', () => {
      expect(notEmpty('test')).toBe(true)
      expect(notEmpty(123)).toBe(true)
      expect(notEmpty([1, 2, 3])).toBe(true)
      expect(notEmpty({})).toBe(true)
    })
  })

  describe('isDate', () => {
    it('當值為有效的 YYYY-MM-DD 日期字串時，應返回 true', () => {
      expect(isDate('2024-01-01')).toBe(true)
      expect(isDate('1999-12-31')).toBe(true)
      expect(isDate('2023-02-28')).toBe(true)
    })

    it('當值為無效的日期字串時，應返回 false', () => {
      expect(isDate('2024/01/01')).toBe(false)
      expect(isDate('01-01-2024')).toBe(false)
      expect(isDate('2024-1-1')).toBe(false)
      expect(isDate('2024-01-32')).toBe(false)
      expect(isDate('2024-13-01')).toBe(false)
      expect(isDate('not-a-date')).toBe(false)
    })

    it('當值為非字串時，應返回 false', () => {
      expect(isDate(null)).toBe(false)
      expect(isDate(undefined)).toBe(false)
      expect(isDate(12345)).toBe(false)
      expect(isDate({})).toBe(false)
    })
  })

  describe('createRule', () => {
    /** 同 Quasar Rule 判斷規則 */
    function hasError(result: Array<any>) {
      for (const item of result) {
        if (typeof item === 'string' && item) {
          return true
        }
      }

      return false
    }

    it('應回傳矩陣', () => {
      const rule = createRule([])
      expect(Array.isArray(rule)).toBe(true)
    })

    it('執行 isDate 規則', () => {
      const rule = createRule([
        isDate,
        (value) => {
          const data = String(value)

          if (!data.includes('2025')) {
            return '年份必須為 2025 年'
          }

          return true
        },
      ], '請輸入有效的日期格式（YYYY-MM-DD）')

      const validDate = '2025-01-01'
      const invalidYDate = '2024-01-01'
      const invalidDate = 'not-a-date'
      const emptyValue = ''

      // 模擬 Quasar 的 rules 執行
      const quasarRule = (value: any) => rule
        .map((fn: any) => fn(value))

      expect(hasError(quasarRule(validDate))).toBe(false)
      expect(hasError(quasarRule(invalidYDate))).toBe(true)
      expect(hasError(quasarRule(invalidDate))).toBe(true)
      expect(hasError(quasarRule(emptyValue))).toBe(true)
    })

    it('執行 Optional isDate 規則', () => {
      const rule = createRule([
        optional,
        isDate,
        (value) => {
          const data = String(value)

          if (!data.includes('2025')) {
            return '年份必須為 2025 年'
          }

          return true
        },
      ], '請輸入有效的日期格式（YYYY-MM-DD）')

      const validDate = '2025-01-01'
      const invalidYDate = '2024-01-01'
      const invalidDate = 'not-a-date'
      const emptyValue = ''

      // 模擬 Quasar 的 rules 執行
      const quasarRule = (value: any) => rule
        .map((fn: any) => fn(value))

      expect(hasError(quasarRule(validDate))).toBe(false)
      expect(hasError(quasarRule(invalidYDate))).toBe(true)
      expect(hasError(quasarRule(invalidDate))).toBe(true)
      expect(hasError(quasarRule(emptyValue))).toBe(false)
    })

    it('須能夠處理 rule throw error', () => {
      const rule = createRule([
        () => {
          throw new Error('年份必須為 2025 年')
        },
      ], '請輸入有效的日期格式（YYYY-MM-DD）')

      // 模擬 Quasar 的 rules 執行
      const quasarRule = (value: any) => rule
        .map((fn: any) => fn(value))

      expect(hasError(quasarRule(''))).toBe(true)
    })
  })
})
