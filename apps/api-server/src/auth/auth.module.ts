import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AccountModule } from '../account/account.module'
import { LoggerModule } from '../logger/logger.module'
import { UtilsModule } from '../utils/utils.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategy/jwt.strategy'
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh.strategy'
import { LocalStrategy } from './strategy/local.strategy'

@Module({
  imports: [
    LoggerModule,
    AccountModule,
    JwtModule.register({}),
    PassportModule,
    UtilsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {
  //
}
