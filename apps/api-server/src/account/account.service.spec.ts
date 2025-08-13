import type { TestingModule } from '@nestjs/testing'
import type { Connection } from 'mongoose'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { connect } from 'mongoose'
import dbConfig from '../configs/db.config'
import mainConfig from '../configs/main.config'

import secretConfig from '../configs/secret.config'
import storageConfig from '../configs/storage.config'
import { LoggerModule } from '../logger/logger.module'
import { UtilsModule } from '../utils/utils.module'
import { AccountService } from './account.service'
import { Account, AccountSchema } from './schema'

// TODO: 補完 AccountService 測試
describe('accountService', () => {
  let mongodb: MongoMemoryReplSet
  let mongoConnection: Connection

  let service: AccountService

  beforeAll(async () => {
    mongodb = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    })
    const uri = mongodb.getUri()
    mongoConnection = (await connect(uri)).connection

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        UtilsModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [mainConfig, dbConfig, secretConfig, storageConfig],
          envFilePath: [`env/.env.development`],
        }),
        MongooseModule.forRootAsync({
          useFactory: () => ({ uri }),
        }),
        MongooseModule.forFeature([
          { name: Account.name, schema: AccountSchema },
        ]),
      ],
      providers: [AccountService],
    }).compile()

    service = module.get<AccountService>(AccountService)
  }, 60000)

  afterAll(async () => {
    try {
      await mongoConnection.dropDatabase()
      await mongoConnection.close()
      await mongodb.stop()
    }
    catch (err) {
      console.warn('MongoMemory stop failed:', err)
    }
  })

  async function clearAll() {
    const collections = await mongoConnection.db?.collections() ?? []
    for (const collection of collections) {
      await collection.deleteMany({})
    }
  }
  /** 每次測試開始前與結束時，都清空 collection 資料，以免互相影響 */
  beforeEach(async () => await clearAll())
  afterEach(async () => await clearAll())

  it('service 存在', () => {
    expect(service).toBeDefined()
  })
})
