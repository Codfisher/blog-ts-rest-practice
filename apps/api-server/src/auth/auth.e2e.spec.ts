import type { INestApplication } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import type { accountContract } from '@project-code/shared'
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
import { AllExceptionsFilter } from '../common/exception-filter'
import dbConfig from '../configs/db.config'
import mainConfig from '../configs/main.config'
import secretConfig from '../configs/secret.config'
import storageConfig from '../configs/storage.config'
import { createAuthApi } from './auth.e2e'
import { REFRESH_TOKEN_COOKIE_KEY } from './auth.type'
import { AccessTokenGuard } from './guard/access-token.guard'
import { AccessTokenGuardStub } from './guard/access-token.guard.stub'

type AccountContract = ClientInferRequest<typeof accountContract>

describe('account e2e', () => {
  let mongodb: MongoMemoryReplSet
  let mongoConnection: Connection
  let app: INestApplication
  let server: ReturnType<INestApplication['getHttpServer']>

  let accountApi: ReturnType<typeof createAccountApi>
  let authApi: ReturnType<typeof createAuthApi>

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
    authApi = createAuthApi(server, {
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

  describe('登入', () => {
    it('正常登入', async () => {
      const params = {
        username: nanoid(),
        password: 'test1234',
      }
      const { body: account } = await createAccount(params)
      const { body: account01 } = await accountApi.findOne(account.id)

      expect(account01.id).toBe(account.id)

      const { headers } = await authApi.localLogin(params)

      expect(headers['set-cookie']).toBeDefined()
      expect(headers['set-cookie']![0]).toContain(`${REFRESH_TOKEN_COOKIE_KEY}=`)

      const { body: account02 } = await accountApi.findOne(account.id)

      expect(account02.id).toBe(account.id)
    })

    it('登入兩次', async () => {
      const params = {
        username: nanoid(),
        password: 'test1234',
      }
      await createAccount(params)

      const { body: token01 } = await authApi.localLogin(params)

      // 要等一下，不然同時間產生的 token 會一模一樣
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const { body: token02 } = await authApi.localLogin(params)

      expect(token01.accessToken).toBeDefined()
      expect(token02.accessToken).toBeDefined()

      expect(token01).not.toEqual(token02)
    })
  })

  describe('更新 token', () => {
    it('使用 refreshToken 更新 token', async () => {
      const params = {
        username: nanoid(),
        password: 'test1234',
      }
      const { body: account } = await createAccount(params)
      const { body: token01, headers: token01Headers } = await authApi.localLogin(params)
      const { body: account01 } = await accountApi.findOne(account.id)

      // 要等一下，不然同時間產生的 token 會一模一樣
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const { body: token02 } = await authApi.refresh(200, {
        headers: {
          cookie: token01Headers['set-cookie']?.[0],
        },
      })

      const { body: account02 } = await accountApi.findOne(account.id)

      expect(token01).not.toEqual(token02)
    })
  })

  describe('登出', () => {
    it('正常登出', async () => {
      const params = {
        username: nanoid(),
        password: 'test1234',
      }
      await createAccount(params)

      const { headers: loginHeaders } = await authApi.localLogin(params)
      const cookieValue = `${REFRESH_TOKEN_COOKIE_KEY}=;`

      const loginCookie = loginHeaders['set-cookie']?.[0]
      expect(loginCookie).not.toContain(cookieValue)

      const { headers: logoutHeaders } = await authApi.logout()

      // cookie 中的 token 應該被清除
      const logoutCookie = logoutHeaders['set-cookie']?.[0]
      expect(logoutCookie).toContain(cookieValue)
    })
  })
})
