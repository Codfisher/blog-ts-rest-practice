import { Module } from '@nestjs/common'
import { AccountModule } from '../account/account.module'
import { LoggerModule } from '../logger/logger.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [AccountModule, LoggerModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {
  //
}
