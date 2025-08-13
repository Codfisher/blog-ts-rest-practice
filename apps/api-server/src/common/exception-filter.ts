import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { pipe } from 'remeda'

/** 將 exception.stack 使用 console.error 印出，不要讓錯誤默默消失，方便追蹤錯誤 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()

    const data = pipe(null, () => {
      if (exception instanceof HttpException) {
        return {
          statusCode: exception.getStatus(),
          data: exception.getResponse(),
          message: exception.message,
        }
      }

      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    })

    // log 5XX 錯誤之 stack trace，方便除錯
    if (data.statusCode >= 500) {
      console.error(exception instanceof Error ? exception.stack : exception)
    }

    response
      .status(data.statusCode)
      .json(data)
  }
}
