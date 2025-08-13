import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { LoggerModule } from '../logger/logger.module'
import { UtilsModule } from '../utils/utils.module'
import { AccountController } from './account.controller'
import { AccountService } from './account.service'
import { Account, AccountSchema } from './schema'

@Module({
  imports: [
    LoggerModule,
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    UtilsModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {
  //
}
