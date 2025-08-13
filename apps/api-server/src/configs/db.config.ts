import type { ConfigService } from '@nestjs/config'
import process from 'node:process'
import { registerAs } from '@nestjs/config'

interface Config {
  mongo: {
    username: string;
    password: string;
    uri: string;
  };
  gcpBucketName?: string;
}
const name = 'db'

export default registerAs(name, (): Config => {
  const username = process.env.MONGO_USERNAME ?? ''
  const password = encodeURIComponent(process.env.MONGO_PASSWORD ?? '')

  return {
    mongo: {
      username,
      password,
      uri: process.env.MONGO_URI ?? '',
    },
    gcpBucketName: process.env.GCP_BUCKET_NAME,
  }
})

export function getDbConfig(configService: ConfigService) {
  return configService.get(name) as Config
}
