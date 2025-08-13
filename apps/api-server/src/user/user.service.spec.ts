import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { AccountModule } from '../account/account.module'
import { LoggerModule } from '../logger/logger.module'
import { UserService } from './user.service'

describe.skip('userService', () => {
  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule, AccountModule],
      providers: [UserService],
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
