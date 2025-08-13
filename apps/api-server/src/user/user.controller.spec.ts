import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { LoggerModule } from '../logger/logger.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'

describe.skip('userController', () => {
  let controller: UserController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      controllers: [UserController],
      providers: [UserService],
    }).compile()

    controller = module.get<UserController>(UserController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
