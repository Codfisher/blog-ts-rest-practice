import type { ConfigService } from '@nestjs/config'
import process from 'node:process'
import { registerAs } from '@nestjs/config'

export interface Config {
  port: number;
  timezone: string;

  gcpProjectId?: string;
  gcpServiceAccount?: string;
  gcpServiceAccountKey?: string;
}

const name = 'main'

export default registerAs(
  name,
  (): Config => ({
    port: Number.parseInt(process.env.PORT ?? '8080'),
    timezone: 'Asia/Taipei',

    gcpProjectId: process.env.GCP_PROJECT_ID,
    gcpServiceAccount: process.env.GCP_SERVICE_ACCOUNT,
    gcpServiceAccountKey: process.env.GCP_SERVICE_ACCOUNT_KEY?.replace(
      /\\n/g,
      '\n',
    ),
  }),
)

export function getMainConfig(configService: ConfigService) {
  return configService.get(name) as Config
}
