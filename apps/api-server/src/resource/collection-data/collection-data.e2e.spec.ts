import type { INestApplication } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import type { ClientInferRequest } from '@ts-rest/core'
import type { collectionDataContract } from '@ts-rest-practice/shared'
import type { Connection } from 'mongoose'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { json, raw, text, urlencoded } from 'express'
import { pick } from 'lodash'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { connect } from 'mongoose'
import { AppModuleStub } from '../../app.module.stub'
import { AllExceptionsFilter } from '../../common/exception-filter'
import dbConfig from '../../configs/db.config'
import mainConfig from '../../configs/main.config'
import secretConfig from '../../configs/secret.config'
import storageConfig from '../../configs/storage.config'
import { createCollectionDataApi } from './collection-data.e2e'

type CollectionDataContract = ClientInferRequest<typeof collectionDataContract>

describe('collectionData e2e', () => {
  let mongodb: MongoMemoryReplSet
  let mongoConnection: Connection
  let app: INestApplication
  let server: ReturnType<INestApplication['getHttpServer']>

  let collectionDataApi: ReturnType<typeof createCollectionDataApi>

  beforeAll(async () => {
    // 啟動記憶體模式的 MongoDB
    mongodb = await MongoMemoryReplSet.create({
      replSet: { storageEngine: 'wiredTiger' },
      instanceOpts: [
        { launchTimeout: 1000 * 60 },
      ],
    })
    const uri = mongodb.getUri()
    mongoConnection = (await connect(uri)).connection

    // 建立模擬用的 Module，概念同 AppModule 在 main.ts 的過程
    const module: TestingModule = await Test
      .createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [mainConfig, dbConfig, secretConfig, storageConfig],
            envFilePath: [`env/.env.development`],
          }),
          MongooseModule.forRootAsync({
            useFactory: () => ({ uri }),
          }),

          AppModuleStub,
        ],
        providers: [],
        controllers: [],
      })
      .compile()

    app = module.createNestApplication()
    app.use(json({ limit: '50mb' }))
    app.use(text({ limit: '50mb' }))
    app.use(urlencoded({ limit: '50mb', extended: true }))
    app.use(raw({ limit: '50mb' }))
    app.useGlobalFilters(new AllExceptionsFilter())

    await app.init()
    server = app.getHttpServer()

    collectionDataApi = createCollectionDataApi(server, {
      /** 使用 admin 帳號發送 req */
      headers: { role: 'admin' },
    })
  }, 60000)

  /** 測試結束，關閉 DB */
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
    await Promise.allSettled(
      Object.values(collections).map((collection) => {
        /** 刻意不清空 accounts collection，保留 stub 使用者資料
         *
         * 方便登入相關測試
         */
        if (collection.collectionName === 'accounts')
          return undefined
        return collection.deleteMany({})
      }),
    )
  }
  /** 每次測試開始前與結束時，都清空 collection 資料，以免互相影響 */
  beforeEach(async () => await clearAll())
  afterEach(async () => await clearAll())

  function createCollectionData(
    params?: Partial<CollectionDataContract['create']['body']>,
  ) {
    const expectData: CollectionDataContract['create']['body'] = {
      name: 'test',
      description: '安安',
      ...params,
    }

    return collectionDataApi.create(expectData)
  }

  describe('建立 collection-data', () => {
    it('缺少必填參數', async () => {
      await collectionDataApi.create(undefined as any, 400)
    })
    it('全部參數', async () => {
      const expectData: Required<CollectionDataContract['create']['body']> = {
        name: 'name',
        description: 'description',
        remark: 'remark',
      }

      const { body: result } = await collectionDataApi.create(expectData)

      expect(result).toMatchObject(pick(
        expectData,
        ['name', 'description', 'remark'],
      ))
    })
  })

  describe('取得 collection-data', () => {
    it('預設值', async () => {
      const { body } = await collectionDataApi.find({
        limit: 10,
        skip: 0,
      })

      expect(body).toEqual({
        total: 0,
        skip: 0,
        limit: 10,
        data: [],
      })
    })

    it('取得指定筆數資料', async () => {
      await Promise.allSettled([
        createCollectionData(),
        createCollectionData(),
      ])

      {
        const { body: result } = await collectionDataApi.find()
        expect(result.total).toBe(2)
        expect(result.data).toHaveLength(2)
      }

      {
        const { body: result } = await collectionDataApi.find({ limit: 1 })
        expect(result.total).toBe(2)
        expect(result.data).toHaveLength(1)
      }
    })
  })

  describe('取得指定 collection-data', () => {
    it('取得指定資料', async () => {
      const { body: data } = await createCollectionData()
      const { body: newData } = await collectionDataApi.findOne(data.id)

      expect(newData).toEqual(data)
    })
  })

  describe('更新指定 collection-data', () => {
    it('目標 ID 不存在', async () => {
      await collectionDataApi.findOne('639709b56f4c80dd5fd48a1f', 404)
    })

    it('修改 name 為 cod', async () => {
      const { body: data } = await createCollectionData()
      const { body: newData } = await collectionDataApi.update(data.id, {
        name: 'cod',
      })

      expect(newData.name).toBe('cod')
    })
  })

  describe('刪除指定 collection-data', () => {
    it('目標 ID 不存在', async () => {
      await collectionDataApi.remove('639709b56f4c80dd5fd48a1f', 404)
    })

    it('刪除資料後，find 無法取得', async () => {
      const { body: data } = await createCollectionData()
      await collectionDataApi.remove(data.id)
      const { body: result } = await collectionDataApi.find()

      expect(result.data).toHaveLength(0)
    })
  })
})
