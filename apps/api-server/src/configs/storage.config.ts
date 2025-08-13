import type { ConfigService } from '@nestjs/config'
import process from 'node:process'
import { registerAs } from '@nestjs/config'

export interface Config {
  location: string;
  directory: string;
}

const name = 'storage'

export default registerAs(name, (): Config => {
  return {
    location: process.env.STORAGE_LOCATION ?? '',
    directory: process.env.STORAGE_DIRECTORY ?? 'files',
  }
})

export function getStorageConfig(configService: ConfigService) {
  return configService.get(name) as Config
}
