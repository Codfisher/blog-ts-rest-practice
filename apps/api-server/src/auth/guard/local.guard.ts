import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { LOCAL_STRATEGY_NAME } from '../strategy/local.strategy'

/** Guard 會去找指定名稱的 strategy（https://docs.nestjs.com/recipes/passport#customize-passport）
 *
 * 拓展方法可見文件案：https://docs.nestjs.com/recipes/passport#extending-guards
 */
@Injectable()
export class LocalGuard extends AuthGuard(LOCAL_STRATEGY_NAME) {
  //
}
