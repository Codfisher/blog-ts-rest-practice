import { LoggingWinston } from '@google-cloud/logging-winston'
import { Module } from '@nestjs/common'

import { WinstonModule } from 'nest-winston'
import { LoggerService } from './logger.service'

/** 針對 winston 進行封裝的 logger，用於支援雲端託管平台的 logger 警報分級、log 類型等等。 */
@Module({
  imports: [WinstonModule.forRoot({ transports: [new LoggingWinston()] })],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {
  //
}
