import type { TestingModule } from '@nestjs/testing'
import { LoggingWinston } from '@google-cloud/logging-winston'
import { Test } from '@nestjs/testing'
import { WinstonModule } from 'nest-winston'
import { LoggerService } from './logger.service'

describe('loggerService', () => {
  let service: LoggerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [WinstonModule.forRoot({ transports: [new LoggingWinston()] })],
      providers: [LoggerService],
    }).compile()

    service = module.get<LoggerService>(LoggerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
