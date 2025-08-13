/**
 * 用於取得 request 中解析完成之 user
 * AuthGuard('jwt') 之 user 內容請見 jwt.strategy
 * AuthGuard('local') 之 user 內容請見 local.strategy
 */

import type {
  ExecutionContext,
} from '@nestjs/common'
import type { OnEventOptions } from '@nestjs/event-emitter/dist/interfaces'
import type { RequestUser } from '../auth/auth.type'
import {
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

/** 取得登入後的 User
 *
 * 登入授權相關的 strategy 習慣上將 user 放在 request.user 中。
 *
 * 記得將相關 Guard（例如 AccessTokenGuard）加在 Controller Method 上
 *
 * @example
 * ```typescript
 * @UseGuards(AccessTokenGuard)
 * async create(
 *   @ReqUser() user: RequestUser,
 * ) { }
 * ```
 */
export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as RequestUser
  },
)

/** 可以註冊多個事件的 OnEvent
 *
 * 基於 @nestjs/event-emitter 的 OnEvent
 *
 * wildcard 通用匹配符號無效的折衷方案
 *
 * @example
 * ```typescript
 * @OnEvents([
 *   GroupBuyOrderEvent.CREATED,
 *   GroupBuyOrderEvent.UPDATED,
 *   GroupBuyOrderEvent.NOT_PAID_YET,
 * ], { async: true })
 * async handleGroupBuyOrderEvent(payload: GroupBuyOrderPayload) { }
 * ```
 */
export function OnEvents(events: string[], options?: OnEventOptions) {
  return applyDecorators(...events.map((e) => OnEvent(e, options)))
}
