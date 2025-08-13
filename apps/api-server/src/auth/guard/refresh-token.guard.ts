import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { JWT_REFRESH_STRATEGY_NAME } from '../strategy/jwt-refresh.strategy'

/** Guard 會去找指定名稱的 strategy（https://docs.nestjs.com/recipes/passport#customize-passport）
 *
 * 拓展方法可見文件案：https://docs.nestjs.com/recipes/passport#extending-guards
 */
@Injectable()
export class RefreshTokenGuard extends AuthGuard(JWT_REFRESH_STRATEGY_NAME) {
}
