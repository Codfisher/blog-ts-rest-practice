import type { ClientInferRequest, ClientInferResponseBody } from '@ts-rest/core'
import type { IncomingHttpHeaders } from 'node:http'
import {
  userContract,
} from '@ts-rest-practice/shared'
import request from 'supertest'
import { useContract } from '../common/utils/utils-ts-rest'

// 這裡不可能出現其他 Contract，所以可以簡短命名
type Contract = typeof userContract
type ContractRequest = ClientInferRequest<Contract>

interface ApiOptions {
  headers?: IncomingHttpHeaders;
}

/** e2e 測試之合約轉換層
 *
 * 將合約轉換成 API 呼叫，這樣就可以直接拿合約內容進行 e2e 測試
 *
 * 也就是說只要合約有變動，這裡也要跟著變動，這樣就可以確保合約的正確性
 *
 * 同時只要 e2e 測試通過，即表示合約正確，可以交付
 *
 * 另一個附加好處是如果其他資源的 e2e 測試有依賴此資源，也可以直接拿去重複使用
 *
 * @param server 測試環境中的 HTTP server 主體
 * @param globalOptions 額外的選項。同 method 內的 options，method 內的 options 會覆蓋這裡的 options
 */
export function createUserApi(
  server: any,
  globalOptions?: ApiOptions,
) {
  return {
    async getSelf<
      Code extends keyof Contract['getSelf']['responses'] = 200,
    >(
      code = 200 as Code,
      options?: ApiOptions,
    ) {
      const { url, method } = useContract(userContract.getSelf, {})

      const { body, statusCode, headers } = await request(server)[method](url)
        .set({
          ...globalOptions?.headers,
          ...options?.headers,
        })

      if (code !== statusCode) {
        throw new Error(`${statusCode} : ${JSON.stringify(body, null, 2)}`)
      }

      return {
        headers,
        body: body as ClientInferResponseBody<
          typeof userContract.getSelf,
          Code
        >,
      }
    },

  }
}
