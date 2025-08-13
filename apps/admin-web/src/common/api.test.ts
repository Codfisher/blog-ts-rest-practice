import { initContract } from '@ts-rest/core'
import { describe, expect, it } from 'vitest'
import { useClient } from './api'

const baseContract = initContract().router({
  create: {
    method: 'GET',
    path: '/v1/collection-data',
    responses: {},
    summary: '建立 collection-data',
  },
}, {
  pathPrefix: '/api',
})

/** FIX: vitest 莫名其妙卡住，原因不明
 *
 * 相同案例有放到 App.vue 測試，結果正確
 */
describe('api', () => {
  describe('useClient', () => {
    it(`相同設定應取得同一個實例`, () => {
      const client1 = useClient(baseContract)
      const client2 = useClient(baseContract)

      expect(client1).toBe(client2)
    })

    it(`不同設定應取得不同實例`, () => {
      const client1 = useClient(baseContract)
      const client2 = useClient(baseContract, {
        baseUrl: '/custom',
        baseHeaders: { a: 'a', b: 'b' },
      })

      expect(client1).not.toBe(client2)
    })

    it(`同樣設定但順序不同，也應取得同一個實例`, () => {
      const client1 = useClient(baseContract, {
        baseUrl: '/custom',
        baseHeaders: { a: 'a', b: 'b' },
      })
      const client2 = useClient(baseContract, {
        baseHeaders: { b: 'b', a: 'a' },
        baseUrl: '/custom',
      })

      expect(client1).toBe(client2)
    })
  })
})
