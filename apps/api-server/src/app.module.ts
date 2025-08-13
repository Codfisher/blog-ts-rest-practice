import process from 'node:process'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { TsRestModule } from '@ts-rest/nest'
import { AccountModule } from './account/account.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import dbConfig, { getDbConfig } from './configs/db.config'
import mainConfig from './configs/main.config'
import secretConfig from './configs/secret.config'
import storageConfig from './configs/storage.config'
import { LoggerModule } from './logger/logger.module'
import { UserModule } from './user/user.module'
import { UtilsModule } from './utils/utils.module'

const envMode = process.env.STAGE_ENV ?? process.env.NODE_ENV ?? 'development'

@Module({
  imports: [
    // DevtoolsModule.register({
    //   http: process.env.NODE_ENV !== 'production',
    // }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '../../', 'client'),
    //   exclude: ['/api*'],
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mainConfig, dbConfig, secretConfig, storageConfig],
      envFilePath: [`env/.env.${envMode}`, 'env/.env'],
      cache: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { mongo: { uri } } = getDbConfig(configService)
        return {
          uri,
          dbName: envMode,
        }
      },
    }),
    EventEmitterModule.forRoot({
      maxListeners: 40,
    }),
    LoggerModule,
    PassportModule,

    TsRestModule.register({
      isGlobal: true,
      jsonQuery: true,
      validateResponses: true,
    }),

    UtilsModule,
    AuthModule,
    UserModule,
    AccountModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule { }
