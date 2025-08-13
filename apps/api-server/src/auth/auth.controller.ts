import type { Response } from 'express'
import {
  Controller,
  Inject,
  Res,
  UseGuards,
} from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { authContract } from '@project-code/shared'
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'
import to from 'await-to-js'
import { AccountService } from '../account/account.service'
import { ReqUser } from '../common/decorator'
import SecretConfig from '../configs/secret.config'
import { LoggerService } from '../logger/logger.service'
import { AuthService } from './auth.service'
import { REFRESH_TOKEN_COOKIE_KEY, RequestUser } from './auth.type'
import { LocalGuard } from './guard/local.guard'
import { RefreshTokenGuard } from './guard/refresh-token.guard'

@Controller()
export class AuthController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
    @Inject(SecretConfig.KEY)
    private readonly secretConfig: ConfigType<typeof SecretConfig>,
  ) {
    //
  }

  @UseGuards(RefreshTokenGuard)
  @TsRestHandler(authContract.refresh)
  async refresh(
    @ReqUser() user: RequestUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    return tsRestHandler(authContract.refresh, async () => {
      // 取得帳號
      const [error, account] = await to(this.accountService.findById(user.id))
      if (error) {
        this.loggerService.error('取得帳號失敗')
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '登入錯誤，請稍後再試',
          },
        }
      }

      if (!account) {
        return { status: 403 }
      }

      const {
        accessToken,
        refreshToken,
      } = await this.authService.updateRefreshToken(account)

      const {
        refreshExpiresIn,
      } = this.secretConfig

      const refreshOptions = this.authService.getCookieOptions({
        expiresIn: refreshExpiresIn,
        path: '/api/v1/auth/refresh',
      })
      res.cookie(
        REFRESH_TOKEN_COOKIE_KEY,
        refreshToken,
        refreshOptions,
      )

      return {
        status: 200,
        body: {
          accessToken,
          /** 預設禁止直接存取 refresh token */
          // refreshToken,
        },
      }
    })
  }

  @UseGuards(LocalGuard)
  @TsRestHandler(authContract.localLogin)
  async localLogin(
    @ReqUser() user: RequestUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    return tsRestHandler(authContract.localLogin, async () => {
      // 取得帳號
      const [error, account] = await to(this.accountService.findById(user.id))
      if (error) {
        this.loggerService.error('取得帳號失敗')
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '登入錯誤，請稍後再試',
          },
        }
      }

      if (!account) {
        return { status: 403 }
      }

      const {
        accessToken,
        refreshToken,
      } = await this.authService.updateRefreshToken(account)

      const {
        refreshExpiresIn,
      } = this.secretConfig

      const refreshOptions = this.authService.getCookieOptions({
        expiresIn: refreshExpiresIn,
        path: '/api/v1/auth/refresh',
      })
      res.cookie(
        REFRESH_TOKEN_COOKIE_KEY,
        `Bearer ${refreshToken}`,
        refreshOptions,
      )

      return {
        status: 200,
        body: {
          accessToken,
          /** 預設禁止直接存取 refresh token */
          // refreshToken,
        },
      }
    })
  }

  @TsRestHandler(authContract.logout)
  async logout(@Res({ passthrough: true }) res: Response) {
    return tsRestHandler(authContract.logout, async () => {
      res.clearCookie(REFRESH_TOKEN_COOKIE_KEY)
      return {
        status: 204,
        body: undefined,
      }
    })
  }
}
