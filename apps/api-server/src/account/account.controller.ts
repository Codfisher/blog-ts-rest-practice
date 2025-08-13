import {
  Controller,
} from '@nestjs/common'
import { accountContract } from '@ts-rest-practice/shared'
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'
import to from 'await-to-js'
import { LoggerService } from '../logger/logger.service'
import { AccountService } from './account.service'

const CreateError = accountContract.create.responses[
  '400'
].shape.reason.unwrap().enum

@Controller()
export class AccountController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly accountService: AccountService,
  ) {
    //
  }

  @TsRestHandler(accountContract.create)
  async create() {
    return tsRestHandler(accountContract.create, async ({ body: dto }) => {
      const [createError, result] = await to(this.accountService.create(dto))
      if (createError?.message === CreateError['username-duplicate']) {
        return {
          status: 400,
          body: {
            reason: CreateError['username-duplicate'],
            message: 'username 已存在，請嘗試其他 username',
          },
        }
      }

      if (createError) {
        this.loggerService.error(`建立帳號發生錯誤 :`)
        this.loggerService.error(createError)

        return {
          status: 500,
          body: {
            message: '建立帳號發生錯誤，請稍後再試',
          },
        }
      }

      return {
        status: 200,
        body: {
          id: result,
        },
      }
    })
  }

  @TsRestHandler(accountContract.find)
  async find() {
    return tsRestHandler(accountContract.find, async ({ query: dto }) => {
      const [findError, result] = await to(
        this.accountService.find(dto),
      )
      if (findError) {
        this.loggerService.error(`取得所有 Account 錯誤 : ${findError}`)

        return {
          status: 500,
          body: {
            message: '取得資料發生錯誤，請稍後再試',
          },
        }
      }

      return {
        status: 200,
        body: result,
      }
    })
  }

  @TsRestHandler(accountContract.findOne)
  async findOne() {
    return tsRestHandler(accountContract.findOne, async ({ params }) => {
      const { id } = params

      const [error, result] = await to(this.accountService.findById(id))
      if (error) {
        this.loggerService.error(`查詢帳號 ID ${id} 錯誤 : ${error}`)

        return {
          status: 500,
          body: {
            message: '取得資料發生錯誤，請稍後再試',
          },
        }
      }
      if (!result) {
        return { status: 404 }
      }

      return {
        status: 200,
        body: result.toJSON(),
      }
    })
  }

  @TsRestHandler(accountContract.update)
  async update() {
    return tsRestHandler(accountContract.update, async ({ body: dto, params }) => {
      const { id } = params

      const [error, result] = await to(
        this.accountService.update(id, dto),
      )
      if (error) {
        this.loggerService.error(`更新資料 ${id} 錯誤 : ${error}`)

        return {
          status: 500,
          body: {
            message: '更新資料發生錯誤，請稍後再試',
          },
        }
      }
      if (!result) {
        return { status: 404 }
      }

      return {
        status: 200,
        body: result.toJSON(),
      }
    })
  }

  @TsRestHandler(accountContract.remove)
  async remove() {
    return tsRestHandler(accountContract.remove, async ({ params }) => {
      const { id } = params

      const [error, result] = await to(this.accountService.remove(id))
      if (error) {
        this.loggerService.error(`刪除帳號 ID ${id} 錯誤 : ${error}`)

        return {
          status: 500,
          body: {
            message: '刪除資料發生錯誤，請稍後再試',
          },
        }
      }
      if (!result) {
        return { status: 404 }
      }

      return { status: 200 }
    })
  }
}
