import type { INestApplication } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import type { ClientInferRequest } from '@ts-rest/core'
import type { accountContract } from '@ts-rest-practice/shared'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { json, raw, text, urlencoded } from 'express'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { connect, type Connection } from 'mongoose'
import { nanoid } from 'nanoid'
import { AppModuleStub } from '../app.module.stub'
import { AllExceptionsFilter } from '../common/exception-filter'
import dbConfig from '../configs/db.config'
import mainConfig from '../configs/main.config'
import secretConfig from '../configs/secret.config'
import storageConfig from '../configs/storage.config'
import { createAccountApi } from './account.e2e'

type AccountContract = ClientInferRequest<typeof accountContract>

describe('account e2e', () => {
  let mongodb: MongoMemoryReplSet
  let mongoConnection: Connection
  let app: INestApplication
  let server: ReturnType<INestApplication['getHttpServer']>

  let accountApi: ReturnType<typeof createAccountApi>

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

    accountApi = createAccountApi(server, {
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
        return collection.deleteMany({})
      }),
    )
  }
  /** 每次測試開始前與結束時，都清空 collection 資料，以免互相影響 */
  beforeEach(async () => await clearAll())
  afterEach(async () => await clearAll())

  function createAccount(
    params?: Partial<AccountContract['create']['body']>,
  ) {
    const expectData: AccountContract['create']['body'] = {
      username: nanoid(),
      name: 'test',
      password: 'test1234',
      ...params,
    }

    return accountApi.create(expectData)
  }

  describe('建立 account', () => {
    it('缺少必填參數', async () => {
      await accountApi.create(undefined as any, 400)
    })
    it('必填參數', async () => {
      const expectData: AccountContract['create']['body'] = {
        username: nanoid(),
        name: 'test',
        password: 'test1234',
      }

      const { body: result } = await accountApi.create(expectData)
      expect(result.id).toStrictEqual(expect.any(String))
    })
    it('username 重複', async () => {
      const expectData: AccountContract['create']['body'] = {
        username: nanoid(),
        name: 'test',
        password: 'test1234',
      }

      await accountApi.create(expectData)
      await accountApi.create(expectData, 400)
    })
  })

  describe('取得 account', () => {
    it('預設值', async () => {
      const { body } = await accountApi.find({
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
        createAccount(),
        createAccount(),
      ])

      {
        const { body: result } = await accountApi.find()
        expect(result.total).toBe(2)
        expect(result.data).toHaveLength(2)
      }

      {
        const { body: result } = await accountApi.find({ limit: 1 })
        expect(result.total).toBe(2)
        expect(result.data).toHaveLength(1)
      }
    })
  })

  describe('取得指定 account', () => {
    it('取得指定資料', async () => {
      const { body: data } = await createAccount()
      const { body: newData } = await accountApi.findOne(data.id)

      expect(newData.id).toEqual(data.id)
    })
  })

  describe('更新指定 account', () => {
    it('目標 ID 不存在', async () => {
      await accountApi.findOne('639709b56f4c80dd5fd48a1f', 404)
    })

    it('修改 name 為 cod', async () => {
      const { body: data } = await createAccount()
      const { body: newData } = await accountApi.update(data.id, {
        name: 'cod',
      })

      expect(newData.name).toBe('cod')
    })
  })

  describe('刪除指定 account', () => {
    it('刪除資料後，find 無法取得', async () => {
      const { body: data } = await createAccount()
      await accountApi.remove(data.id)
      const { body: result } = await accountApi.find()

      expect(result.data).toHaveLength(0)
    })
  })
})
