import process from 'node:process'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { InjectConnection } from '@nestjs/mongoose'
import dayjs from 'dayjs'
import timezonePlugin from 'dayjs/plugin/timezone'
import utcPlugin from 'dayjs/plugin/utc'
import { diff } from 'just-diff'
import { get } from 'lodash'
import { ClientSession, Connection, Model, Types } from 'mongoose'
import { map, pipe } from 'remeda'
import MainConfig from '../configs/main.config'
import { Log, LogDocument } from '../schema'

dayjs.extend(utcPlugin)
dayjs.extend(timezonePlugin)

export interface AddLogParam<T> {
  sourceId: string;
  oldData: T;
  newData: T;
  description?: string;
  editor?: string;
}

/** 通常依賴注入的 utils 才需要放在這裡，例：需要 config
 *
 * 不依賴注入的 utils 可以直接獨立 utils，攜帶性比較強
 */
@Injectable()
export class UtilsService {
  constructor(
    @Inject(MainConfig.KEY)
    private readonly mainConfig: ConfigType<typeof MainConfig>,

    @InjectConnection()
    private readonly connection: Connection,
  ) {
    //
  }

  isDev() {
    return process.env.NODE_ENV !== 'production'
  }

  isStage() {
    return !!process.env.STAGE_ENV
  }

  getUnix() {
    const { timezone } = this.mainConfig
    return dayjs().tz(timezone).unix()
  }

  getDate() {
    const { timezone } = this.mainConfig
    return dayjs().tz(timezone).toDate()
  }

  /** 取得包含時區的 dayjs 物件，方便後續操作
   *
   * @param date 時間資訊
   * @param format 解析格式
   */
  getDayjs(date?: dayjs.ConfigType, format?: string) {
    const { timezone } = this.mainConfig
    return dayjs(date, format).tz(timezone)
  }

  getDateTime(format: string) {
    const { timezone } = this.mainConfig
    return dayjs().tz(timezone).format(format)
  }

  /** 二次封裝 MongoDB transaction，以實現自定義邏輯
   *
   * 沒有特殊需求也可以使用 [Mongoose 提供的 transaction](https://mongoosejs.com/docs/transactions.html#transactions-in-mongoose)
   *
   * 特別注意！transaction 不支援並行操作
   *
   * 因此不要在 transaction 內使用 `Promise.all`、`Promise.allSettled` 這類操作
   *
   * 推薦仔細閱讀[官方指導文件](https://www.mongodb.com/blog/post/quick-start-nodejs--mongodb--how-to-implement-transactions)
   */
  async transaction<Result>(
    callback: (session: ClientSession) => Promise<Result>,
    option = {
      autoEnd: true,
    },
  ) {
    const session = await this.connection.startSession()

    let result: Awaited<Result> | undefined
    try {
      // withTransaction 可以在特定錯誤下自動重試，比使用 startTransaction 更好
      await session.withTransaction(async () => {
        result = await callback(session)
      })

      if (option.autoEnd) {
        await session.endSession()
      }

      return result
    }
    catch (err) {
      session.endSession()
      throw err
    }
  }

  /** 產生並寫入通用的 Log */
  async addLog<Data extends object>(
    model: Model<LogDocument>,
    params: AddLogParam<Data>,
    option?: {
      session?: ClientSession;
    },
  ) {
    const {
      newData,
      oldData,
      description = '',
      sourceId,
      editor,
    } = params

    const changes = pipe(
      diff(oldData, newData),
      /** 加入 oldValue */
      map((item) => {
        if (item.op !== 'replace')
          return item

        const oldValue = get(oldData, item.path, undefined)
        return {
          ...item,
          oldValue,
        }
      }),
    )

    const _id = new Types.ObjectId()
    const data: Omit<
      Log<any>,
      'editor' | 'id'
    > & {
      _id: Types.ObjectId;
      editor?: string;
    } = {
      _id: new Types.ObjectId(),
      sourceId,
      changes,
      oldData,
      description,
      editor,
      timestamp: {
        createdAt: this.getDate().toISOString(),
      },
    }
    return model.create([data], { session: option?.session })
  }
}
