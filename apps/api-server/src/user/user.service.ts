import { Injectable } from '@nestjs/common'
import { User } from '@project-code/shared'
import to from 'await-to-js'
import { omit } from 'remeda'
import { AccountService } from '../account/account.service'
import { LoggerService } from '../logger/logger.service'

@Injectable()
export class UserService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly accountService: AccountService,
  ) {
    //
  }

  async getById({ id }: { id: string }) {
    const [findAccountError, account] = await to(
      this.accountService.findById(id),
    )
    if (findAccountError) {
      this.loggerService.error('取得 Account 錯誤')
      this.loggerService.error(findAccountError)

      throw findAccountError
    }

    if (!account) {
      return undefined
    }

    const user: User = {
      ...omit(account.toJSON(), ['refreshToken']),
      id: account._id.toString(),
    }
    return user
  }
}
