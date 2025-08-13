import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createFieldValidator } from './zod-validator'

describe('createFieldValidator', () => {
  const userSchema = z.object({
    userName: z.string().min(3, '用戶名稱至少要 3 個字'),
    userAge: z.number().min(18, '年齡必須大於或等於 18'),
    address: z.object({
      city: z.string().min(1, '城市名稱不能為空'),
    }),
  })

  const userFormValidator = createFieldValidator(userSchema)

  const validateUserName = userFormValidator('userName')

  it('應該驗證單層欄位的成功案例', () => {
    expect(validateUserName('Alice')).toBe(true)
  })

  it('應該驗證單層欄位的失敗案例', () => {
    expect(validateUserName('A')).toBe('用戶名稱至少要 3 個字')
  })

  const validateCity = userFormValidator('address.city')

  it('應該驗證嵌套欄位的成功案例', () => {
    expect(validateCity('Taipei')).toBe(true)
  })

  it('應該驗證嵌套欄位的失敗案例', () => {
    expect(validateCity('')).toBe('城市名稱不能為空')
  })

  it('應該驗證數字欄位的失敗案例', () => {
    const validateAge = userFormValidator('userAge')
    expect(validateAge(15)).toBe('年齡必須大於或等於 18')
  })

  it('應該丟出無效欄位名稱錯誤', () => {
    expect(() => userFormValidator('invalidField' as any)('value')).toThrow('無效的欄位名稱')
  })

  // 測試外層為 optional ，是否能成功驗證內層欄位
  const optionalUserFormSchema = z.object({
    user: z.object({
      userName: z.string().max(3, '用戶名稱不可超過三個字'),
    }).optional(),
  })

  const optionalUserFormValidator = createFieldValidator(optionalUserFormSchema)

  it('當使用者未定義時應通過驗證 (物件外層為 optional)', () => {
    const result = optionalUserFormValidator('user')(undefined)
    expect(result).toBe(true) // 因為 user 是 optional，應該允許 undefined
  })
})
