import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { createCache } from 'cache-manager'
import { LoggerModule } from '../../logger/logger.module'
import { UtilsModule } from '../../utils/utils.module'
import { CollectionDataController } from './collection-data.controller'
import { CollectionDataService } from './collection-data.service'
import { COLLECTION_DATA_CACHE } from './interceptor/cache.interceptor'
import { CollectionData, CollectionDataSchema } from './schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CollectionData.name, schema: CollectionDataSchema },
    ]),
    UtilsModule,
    LoggerModule,
  ],
  controllers: [CollectionDataController],
  providers: [
    CollectionDataService,

    {
      provide: COLLECTION_DATA_CACHE,
      useFactory: async () => createCache({
        ttl: 5000,
      }),
    },
  ],
  exports: [CollectionDataService],
})
export class CollectionDataModule {
  //
}
