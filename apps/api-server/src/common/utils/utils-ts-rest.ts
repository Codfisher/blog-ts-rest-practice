import type {
  AppRoute,
  AppRouteMutation,
  AppRouteQuery,
  ClientInferRequest,
} from '@ts-rest/core'

// TODO: 研究如何簡化執行 controller method 方法
export async function tsRestExecuter(fn, data) {
  const task = await fn()
  const result = await task(data)

  return result
}

type ExtractQuery<T> = T extends { query: infer U } ? U : never
type ExtractBody<T> = T extends { body: infer U } ? U : never

interface UseContractReturn<Query, Body> {
  url: string;
  method: Lowercase<AppRoute['method']>;
  query: Query;
  body: Body;
}

/** 協助取出合約 API 指定 API 內容
 *
 * 主要用於 e2e 測試
 */
export function useContract<
  Route extends AppRouteQuery,
  Data extends ClientInferRequest<Route>,
>(
  route: Route,
  data?: Data
): UseContractReturn<ExtractQuery<Data>, ExtractBody<Data>>
export function useContract<
  Route extends AppRouteMutation,
  Data extends ClientInferRequest<Route>,
>(
  route: Route,
  data?: ClientInferRequest<Route>
): UseContractReturn<ExtractQuery<Data>, undefined>
export function useContract<
  Route extends AppRouteQuery | AppRouteMutation,
>(
  route: Route,
  data?: ClientInferRequest<Route>,
): any {
  const {
    method,
    path,
  } = route

  const url = path.replace(
    /:(\w+)/g,
    (match, key) => data?.params?.[key],
  )

  if (data && 'body' in data) {
    return {
      url,
      method: method.toLowerCase() as Lowercase<AppRoute['method']>,
      query: data?.query,
      body: data,
    }
  }

  return {
    url,
    method: method.toLowerCase() as Lowercase<AppRoute['method']>,
    query: data?.query,
  }
}
