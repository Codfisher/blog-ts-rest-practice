import process from 'node:process'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { json, raw, text, urlencoded } from 'express'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/exception-filter'
import { getMainConfig } from './configs/main.config'
import { getSecretConfig } from './configs/secret.config'
import { UtilsService } from './utils/utils.service'

const envMode = process.env.STAGE_ENV ?? process.env.NODE_ENV ?? 'development'

/** 原先計畫由 ConfigModule 取得 env
 *
 * 但由於 ConfigModule 不支援 forRootAsync，所以改為直接寫入 process.env
 */
async function loadEnv() {
  const client = new SecretManagerServiceClient()
  const [version] = await client.accessSecretVersion({
    name: `projects/859506126692/secrets/api-server-${envMode}/versions/latest`,
  })

  const payload = version.payload?.data?.toString() || ''
  const envData = payload
    .split('\n')
    .filter((line) => line.trim() !== '')
    .reduce((acc, line) => {
      /** 只能拆分第一個 = */
      const [_key, ...other] = line.split('=')
      const value = other.join('=').trim()

      if (_key && value !== undefined) {
        const key = _key.trim()

        acc[key] = value
        process.env[key] = value
      }
      return acc
    }, {} as Record<string, string>)

  // console.log('🚀 ~ [loadEnv] envData:', envData)
}

async function bootstrap() {
  /** 需要需求啟用 */
  // await loadEnv()

  const app = await NestFactory.create(AppModule, {
    // snapshot: true,
  })

  app.use(json({ limit: '50mb' }))
  app.use(text({ limit: '50mb' }))
  app.use(urlencoded({ limit: '50mb', extended: true }))
  app.use(raw({ limit: '50mb' }))

  const configService = app.get(ConfigService)
  const mainConfig = getMainConfig(configService)
  const secretConfig = getSecretConfig(configService)

  const utilsService = app.get(UtilsService)

  if (!utilsService.isDev()) {
    app.use(helmet({
      strictTransportSecurity: true,
    }))
  }

  if (utilsService.isStage()) {
    app.setGlobalPrefix('_stage')

    /** 依照官網說明實踐 https://docs.nestjs.com/openapi/introduction
     *
     * 已啟用 CLI plugin
     */
    // const config = new DocumentBuilder()
    //   .setTitle('API Document')
    //   .setDescription('API description')
    //   .setVersion('1.0')
    //   .build();
    // const document = SwaggerModule.createDocument(app, config);
    // SwaggerModule.setup('document', app, document);
  }

  app.use(compression())
  app.use(cookieParser(secretConfig.jwtAccessSecret))

  // 使用 ts-rest 後，不再需要
  // app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new AllExceptionsFilter())

  await app.listen(mainConfig.port)
}
bootstrap()
