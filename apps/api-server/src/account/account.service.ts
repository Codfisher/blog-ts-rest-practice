import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { accountContract } from '@project-code/shared'
import { ServerInferRequest } from '@ts-rest/core'
import to from 'await-to-js'
import bcrypt from 'bcryptjs'
import flat from 'flat'
import { defaults } from 'lodash'
import { Model } from 'mongoose'
import { pipe } from 'remeda'
import { LoggerService } from '../logger/logger.service'

import { UtilsService } from '../utils/utils.service'
import { Account, AccountDocument } from './schema'

type AccountContract = ServerInferRequest<typeof accountContract>

const CreateError = accountContract.create.responses[
  '400'
].shape.reason.unwrap().enum

@Injectable()
export class AccountService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly utilsService: UtilsService,
    @InjectModel(Account.name)
    private accountModel: Model<AccountDocument>,
  ) {
    //
  }

  /** 建立帳號
   *
   * 詳細錯誤型別為 CreateError
   */
  async create(dto: AccountContract['create']['body']) {
    const { username, password } = dto

    if (username !== '') {
      // 檢查 username 是否重複
      const existUsername = await this.findByUsername(dto.username)
      if (existUsername) {
        throw new Error(CreateError['username-duplicate'])
      }
    }

    // 建立資料
    const data: Account = defaults(
      {
        timestamp: {
          createdAt: this.utilsService.getDate(),
        },
      },
      dto,
      new Account(),
    )

    if (password) {
      const salt = await bcrypt.genSalt()
      data.password = await bcrypt.hash(password, salt)
    }

    const result = await this.accountModel.create(data)
    return result._id.toString()
  }

  async find(dto: AccountContract['find']['query']) {
    const { skip = 0, limit = 30 } = dto

    const [total, data] = await Promise.all([
      this.accountModel.countDocuments({
        'timestamp.deletedAt': { $exists: false },
      }),
      this.accountModel
        .find({ 'timestamp.deletedAt': { $exists: false } })
        .skip(skip)
        .limit(limit),
    ])

    return {
      total: total ?? 0,
      skip,
      limit,
      data: data ?? [],
    }
  }

  async findById(id: string, includeSecret: true): Promise<
    AccountDocument | undefined
  >
  async findById(id: string, includeSecret?: false): Promise<
    Omit<AccountDocument, 'password' | 'refreshToken'> | undefined
  >
  async findById(
    id: string,
    includeSecret = false,
  ) {
    const data = await pipe(this.accountModel.findById(id), (query) => {
      if (!includeSecret)
        return query

      return query.select('+password +refreshToken')
    })
    if (!data) {
      return undefined
    }

    return data
  }

  async findByUsername(username: string, includeSecret: true): Promise<
    AccountDocument | undefined
  >
  async findByUsername(username: string, includeSecret?: false): Promise<
    Omit<AccountDocument, 'password' | 'refreshToken'> | undefined
  >
  async findByUsername(
    username: string,
    includeSecret = false,
  ) {
    const task = pipe(this.accountModel.find({ username }), (query) => {
      if (!includeSecret)
        return query

      return query.select('+password +oAuthProviders +refreshToken')
    })

    const [err, result] = await to(task)
    if (err) {
      return Promise.reject(err)
    }
    const [account] = result
    return account
  }

  async update(id: string, dto: AccountContract['update']['body']): Promise<AccountDocument | null> {
    const { password } = dto

    const updateData = {
      ...dto,
      timestamp: {
        updatedAt: this.utilsService.getDate(),
      },
    }

    if (password) {
      const salt = await bcrypt.genSalt()
      updateData.password = await bcrypt.hash(password, salt)
    }

    const data = flat(updateData, { safe: true }) as any
    return this.accountModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
  }

  /** 更新 Refresh Token */
  updateRefreshToken(id: string, token: string) {
    return this.accountModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            refreshToken: token,
          },
        },
        { new: true },
      )
  }

  remove(id: string) {
    return this.accountModel
      .deleteOne(
        { _id: id },
      )
  }
}
