import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { pipe, when } from 'remeda'
import { AccountService } from '../../account/account.service'
import SecretConfig from '../../configs/secret.config'
import { UtilsService } from '../../utils/utils.service'
import {
  JwtPayload as AuthJwtPayload,
  REFRESH_TOKEN_COOKIE_KEY,
  RequestUser,
} from '../auth.type'

export const JWT_REFRESH_STRATEGY_NAME = 'jwt-refresh-token'

/** 細節可參考文件：https://docs.nestjs.com/recipes/passport#implementing-passport-jwt */
@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_STRATEGY_NAME,
) {
  constructor(
    @Inject(SecretConfig.KEY)
    private readonly secretConfig: ConfigType<typeof SecretConfig>,
    private readonly accountService: AccountService,
    private readonly utilsService: UtilsService,
  ) {
    const { jwtRefreshSecret } = secretConfig

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = pipe(
            request?.signedCookies?.[REFRESH_TOKEN_COOKIE_KEY],
            (result) => {
              // 非開發環境只取用 signedCookies
              if (!this.utilsService.isDev()) {
                return result
              }

              return result ?? request?.cookies?.[REFRESH_TOKEN_COOKIE_KEY]
            },
            String,
            when(
              (value) => value.includes('Bearer'),
              (value) => value.split('Bearer')[1] ?? '',
            ),
            (value) => value.trim(),
          )

          return token
        },
      ]),
      ignoreExpiration: true,
      secretOrKey: jwtRefreshSecret,
      /** https://docs.nestjs.com/recipes/passport#request-scoped-strategies */
      passReqToCallback: true,
    })
  }

  /** 此 method return 數值會被寫入 request.user 中。（回傳 falsy 表示不可通過） */
  async validate(
    /** passReqToCallback 設為 true，才能取得 request */
    request: Request,
    payload: JwtPayload & AuthJwtPayload,
  ): Promise<RequestUser | undefined> {
    const token = pipe(
      request?.signedCookies?.[REFRESH_TOKEN_COOKIE_KEY],
      (result) => {
        // 非開發環境只取用 signedCookies
        if (!this.utilsService.isDev()) {
          return result
        }

        return result ?? request?.cookies?.[REFRESH_TOKEN_COOKIE_KEY]
      },
      String,
      when(
        (value) => value.includes('Bearer'),
        (value) => value.split('Bearer')[1] ?? '',
      ),
      (value) => value.trim(),
    )

    const account = await this.accountService.findById(payload.id, true)
    if (!account) {
      return undefined
    }

    if (account.refreshToken === token) {
      return {
        id: account._id.toString(),
        role: account.role,
      }
    }

    return undefined
  }
}
