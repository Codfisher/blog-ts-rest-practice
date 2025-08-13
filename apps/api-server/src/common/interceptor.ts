import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'

/** 通常用於測試，覆蓋指定 Interceptor
 *
 * 例如：覆蓋 CacheInterceptor 關閉快取，讓測試不進行快取
 */
@Injectable()
export class NoopInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ) {
    // 直接進行下一個攔截器或路由處理器，不執行任何快取相關操作
    return next.handle()
  }
}
