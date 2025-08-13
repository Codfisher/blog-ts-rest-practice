import { CacheInterceptor } from '@nestjs/cache-manager'
import { Inject } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Cache } from 'cache-manager'

export const COLLECTION_DATA_CACHE = 'COLLECTION_DATA_CACHE'

export class CollectionDataCacheInterceptor extends CacheInterceptor {
  constructor(
    @Inject(COLLECTION_DATA_CACHE) cacheManager: Cache,
    reflector: Reflector,
  ) {
    super(cacheManager, reflector)
  }
}
