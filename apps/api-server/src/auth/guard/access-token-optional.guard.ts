import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { JWT_STRATEGY_NAME } from '../strategy/jwt.strategy'

/** 未登入也可通過的 Guard
 *
 * Guard 會去找指定名稱的 strategy（https://docs.nestjs.com/recipes/passport#customize-passport）
 *
 * 拓展方法可見文檔案：https://docs.nestjs.com/recipes/passport#extending-guards
 */
@Injectable()
export class AccessTokenOptionalGuard extends AuthGuard(JWT_STRATEGY_NAME) {
  handleRequest(err, user, info, context: ExecutionContext) {
    /** 如果有錯誤且無 user，則返回 null（允許訪問）
     *
     * 一般情況是 `return new UnauthorizedException()`
     *
     * [文件](https://docs.nestjs.com/recipes/passport#extending-guards)
     */
    if (err || !user) {
      return null
    }

    return user
  }
}
