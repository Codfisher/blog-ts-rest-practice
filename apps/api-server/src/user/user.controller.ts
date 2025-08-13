import {
  Controller,
  UseGuards,
} from '@nestjs/common'
import { userContract } from '@ts-rest-practice/shared'

import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'
import to from 'await-to-js'
import { RequestUser } from '../auth/auth.type'
import { AccessTokenGuard } from '../auth/guard/access-token.guard'
import { ReqUser } from '../common/decorator'
import { LoggerService } from '../logger/logger.service'
import { UserService } from './user.service'

@Controller()
export class UserController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly userService: UserService,
  ) {
    //
  }

  @UseGuards(AccessTokenGuard)
  @TsRestHandler(userContract.getSelf)
  async getSelf(@ReqUser() user: RequestUser) {
    return tsRestHandler(userContract.getSelf, async () => {
      if (!user) {
        return {
          status: 401,
          body: { message: '帳號資料錯誤，請重新登入' },
        }
      }

      const [error, userData] = await to(
        this.userService.getById({ id: user.id }),
      )
      if (error) {
        this.loggerService.error('取得帳號資料失敗')
        this.loggerService.error(error)

        return {
          status: 500,
          body: { message: '取得帳號資料失敗' },
        }
      }

      if (!userData) {
        this.loggerService.warn('取得帳號資料失敗')

        return {
          status: 400,
          body: { message: '帳號資料錯誤，請重新登入' },
        }
      }

      return {
        status: 200,
        body: userData,
      }
    })
  }
}
