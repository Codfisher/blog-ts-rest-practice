import { describe } from 'vitest'

/** FIX: vitest 會卡住，原因不明 */
describe.skip('then', () => {
  // it('應處理非 Promise 初始值和返回值的函數', async () => {
  //   const fn = vi.fn((data: string) => `${data}-modified`)
  //   const result = await pipe('initial', then(fn))
  //   expect(fn).toHaveBeenCalledWith('initial')
  //   expect(result).toBe('initial-modified')
  // })

  // it('應處理 Promise 初始值和返回值的函數', async () => {
  //   const fn = vi.fn((data: string) => `${data}-modified`)
  //   const result = await pipe(await Promise.resolve('initial'), then(fn))
  //   expect(fn).toHaveBeenCalledWith('initial')
  //   expect(result).toBe('initial-modified')
  // })

  // it('應處理非 Promise 初始值和返回 Promise 的函數', async () => {
  //   const fn = vi.fn(async (data: string) => Promise.resolve(`${data}-modified`))
  //   const result = await pipe('initial', then(fn))
  //   expect(fn).toHaveBeenCalledWith('initial')
  //   expect(result).toBe('initial-modified')
  // })

  // it('應處理 Promise 初始值和返回 Promise 的函數', async () => {
  //   const fn = vi.fn(async (data: string) => Promise.resolve(`${data}-modified`))
  //   const result = await pipe(await Promise.resolve('initial'), then(fn))
  //   expect(fn).toHaveBeenCalledWith('initial')
  //   expect(result).toBe('initial-modified')
  // })
})
