import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

import { Request } from 'express'

import { JwtPayload } from 'jsonwebtoken'
import { ExtractJwt, Strategy } from 'passport-jwt'
import SecretConfig from '../../configs/secret.config'
import {
  JwtPayload as AuthJwtPayload,
  RequestUser,
  TOKEN_HEADER_KEY,
} from '../auth.type'

export const JWT_STRATEGY_NAME = 'jwt'

/** 細節可參考文件：https://docs.nestjs.com/recipes/passport#implementing-passport-jwt */
@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  JWT_STRATEGY_NAME,
) {
  constructor(
    @Inject(SecretConfig.KEY)
    private readonly secretConfig: ConfigType<typeof SecretConfig>,
  ) {
    const { jwtAccessSecret } = secretConfig

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const value: string
            = request?.headers?.[TOKEN_HEADER_KEY]
              ?? request?.signedCookies?.[TOKEN_HEADER_KEY]
              ?? request?.cookies?.[TOKEN_HEADER_KEY]
              ?? ''

          const [bearer, token] = value.split(' ')
          if (!token) {
            return null
          }

          return token
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtAccessSecret,
    })
  }

  /** 此 method return 數值會被寫入 request.user 中。（回傳 falsy 表示不可通過） */
  async validate(payload: JwtPayload & AuthJwtPayload): Promise<RequestUser> {
    return payload
  }
}
