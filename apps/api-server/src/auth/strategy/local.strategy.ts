import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from '../auth.service'
import { RequestUser } from '../auth.type'

export const LOCAL_STRATEGY_NAME = 'local'

/** 細節可參考文件：https://docs.nestjs.com/recipes/passport#implementing-passport-local */
@Injectable()
export class LocalStrategy extends PassportStrategy(
  Strategy,
  LOCAL_STRATEGY_NAME,
) {
  constructor(private readonly authService: AuthService) {
    super()
  }

  /** 此 method return 數值會被寫入 request.user 中。（回傳 falsy 表示不可通過） */
  async validate(username: string, password: string): Promise<RequestUser> {
    const account = await this.authService.validateLocalAccount(
      username,
      password,
    )

    if (!account) {
      throw new HttpException('帳號密碼錯誤', HttpStatus.BAD_REQUEST)
    }

    const user: RequestUser = {
      id: account.id,
      role: account.role,
    }

    return user
  }
}
