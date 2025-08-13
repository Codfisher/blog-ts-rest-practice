import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { LoggerModule } from '../logger/logger.module'
import { UtilsModule } from '../utils/utils.module'
import { AccountController } from './account.controller'
import { AccountService } from './account.service'

// TODO: 補完 AccountController 測試
describe.skip('accountController', () => {
  let controller: AccountController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule, UtilsModule],
      controllers: [AccountController],
      providers: [AccountService],
    }).compile()

    controller = module.get<AccountController>(AccountController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
