import type { TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { AccountModule } from '../account/account.module'
import dbConfig from '../configs/db.config'
import mainConfig from '../configs/main.config'

import secretConfig from '../configs/secret.config'
import storageConfig from '../configs/storage.config'
import { UtilsModule } from '../utils/utils.module'
import { AuthService } from './auth.service'

describe.skip('authService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [mainConfig, dbConfig, secretConfig, storageConfig],
          envFilePath: [`env/.env.development`],
        }),
        AccountModule,
        UtilsModule,
      ],
      providers: [AuthService],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
