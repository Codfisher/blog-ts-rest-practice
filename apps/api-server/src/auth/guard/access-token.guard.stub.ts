import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { JWT_STRATEGY_NAME } from '../strategy/jwt.strategy'

/** 自動注入 user
 *
 * 可以從 header 修改 role，方便測試不同權限
 *
 * 可根據測試需求修改此 guard，例如：切換帳號等等邏輯
 */
@Injectable()
export class AccessTokenGuardStub extends AuthGuard(JWT_STRATEGY_NAME) {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    /**
     * canActivate 內部會 throw UnauthorizedException
     *
     * 使用 try-catch 忽略這個行為
     */
    try {
      await super.canActivate(context)
    }
    catch (error) {
      // console.log('🚀 ~ error:', error)
    }

    return true
  }
}
