import type { INestApplication } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import type { accountContract, userContract } from '@ts-rest-practice/shared'
import type { ClientInferRequest } from '@ts-rest/core'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { json, raw, text, urlencoded } from 'express'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { connect, type Connection } from 'mongoose'
import { nanoid } from 'nanoid'
import { createAccountApi } from '../account/account.e2e'
import { AccountModule } from '../account/account.module'
import { AccountModuleStub } from '../account/account.module.stub'
import { AppModuleStub } from '../app.module.stub'
import { createAuthApi } from '../auth/auth.e2e'
import { AccessTokenGuard } from '../auth/guard/access-token.guard'
import { AccessTokenGuardStub } from '../auth/guard/access-token.guard.stub'
import { AllExceptionsFilter } from '../common/exception-filter'
import dbConfig from '../configs/db.config'
import mainConfig from '../configs/main.config'
import secretConfig from '../configs/secret.config'
import storageConfig from '../configs/storage.config'
import { createUserApi } from './user.e2e'

type UserContract = ClientInferRequest<typeof userContract>
type AccountContract = ClientInferRequest<typeof accountContract>

describe('user e2e', () => {
  let mongodb: MongoMemoryReplSet
  let mongoConnection: Connection
  let app: INestApplication
  let server: ReturnType<INestApplication['getHttpServer']>

  let authApi: ReturnType<typeof createAuthApi>
  let accountApi: ReturnType<typeof createAccountApi>
  let userApi: ReturnType<typeof createUserApi>

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
      // AccessTokenGuard 直接放行（如果需要測試登入，請自行修改）
      .overrideGuard(AccessTokenGuard)
      .useClass(AccessTokenGuardStub)
      // 換回原本的 AccountModule
      .overrideModule(AccountModuleStub)
      .useModule(AccountModule)
      .compile()

    app = module.createNestApplication()
    app.use(json({ limit: '50mb' }))
    app.use(text({ limit: '50mb' }))
    app.use(urlencoded({ limit: '50mb', extended: true }))
    app.use(raw({ limit: '50mb' }))
    app.use(cookieParser('secret'))
    app.useGlobalFilters(new AllExceptionsFilter())

    await app.init()
    server = app.getHttpServer()

    accountApi = createAccountApi(server, {
      /** 使用 admin 帳號發送 req */
      headers: { role: 'admin' },
    })
    authApi = createAuthApi(server)
    userApi = createUserApi(server)
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

  describe('取得自身資料', () => {
    it('必填參數', async () => {
      const params = {
        username: nanoid(),
        password: 'test1234',
      }
      const { body: account } = await createAccount(params)
      const { body: token } = await authApi.localLogin(params)

      const { body: user } = await userApi.getSelf(200, {
        headers: { authorization: `Bearer ${token.accessToken}` },
      })

      expect(user.id).toBe(account.id)
    })
  })
})
