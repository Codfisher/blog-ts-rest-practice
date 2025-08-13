import type { PaginatedData } from '@project-code/shared'

export * from './utils-mongoose'

export function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms)
  })
}

export function createPaginatedData<Data>(data: PaginatedData<Data>) {
  return data
}
