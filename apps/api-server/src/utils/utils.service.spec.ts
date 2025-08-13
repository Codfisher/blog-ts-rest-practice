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
import { UtilsModule } from './utils.module'
import { UtilsService } from './utils.service'

describe('utilsService', () => {
  let mongodb: MongoMemoryReplSet
  let mongoConnection: Connection

  let service: UtilsService

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
      ],
    }).compile()

    service = module.get<UtilsService>(UtilsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
