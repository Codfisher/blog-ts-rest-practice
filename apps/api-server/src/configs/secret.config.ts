import type { ConfigService } from '@nestjs/config'
import process from 'node:process'
import { registerAs } from '@nestjs/config'

export interface Config {
  jwtAccessSecret: string;
  /** ms 時間字串格式，ex: 1m、9h */
  accessExpiresIn: string;

  jwtRefreshSecret: string;
  /** ms 時間字串格式，ex: 1m、9h */
  refreshExpiresIn: string;
}

const name = 'secret'

export default registerAs(
  name,
  (): Config => ({
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'jwt-access-secret',
    accessExpiresIn: process.env.ACCESS_EXPIRES_IN ?? '15m',

    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'jwt-refresh-secret',
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN ?? '9h',
  }),
)

export function getSecretConfig(configService: ConfigService) {
  return configService.get(name) as Config
}
