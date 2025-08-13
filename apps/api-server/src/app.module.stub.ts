import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { PassportModule } from '@nestjs/passport'
import { TsRestModule } from '@ts-rest/nest'
import { AccountModuleStub as AccountModule } from './account/account.module.stub'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'

import { LoggerModule } from './logger/logger.module'
import { CollectionDataModule } from './resource/collection-data/collection-data.module'
import { UserModule } from './user/user.module'
import { UtilsModule } from './utils/utils.module'

@Module({
  imports: [
    UtilsModule,
    PassportModule,
    AuthModule,
    LoggerModule,
    UserModule,
    AccountModule,
    EventEmitterModule.forRoot({
      maxListeners: 40,
    }),
    /** 預設使用 memory */
    CacheModule.register({ isGlobal: true }),

    TsRestModule.register({
      isGlobal: true,
      jsonQuery: true,
      validateResponses: true,
    }),

    CollectionDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModuleStub {
  //
}
