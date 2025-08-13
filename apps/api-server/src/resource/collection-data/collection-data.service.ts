import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import {
  collectionDataContract,
} from '@ts-rest-practice/shared'
import { ServerInferRequest } from '@ts-rest/core'
import flat from 'flat'
import { defaultsDeep } from 'lodash'
import { ClientSession, FilterQuery, Model } from 'mongoose'
import { pipe } from 'remeda'
import { LoggerService } from '../../logger/logger.service'
import { UtilsService } from '../../utils/utils.service'
import { CollectionData, CollectionDataDocument } from './schema'

type CollectionDataContract = ServerInferRequest<typeof collectionDataContract>

interface BaseOptions {
  session?: ClientSession;
}

@Injectable()
export class CollectionDataService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly utilsService: UtilsService,
    @InjectModel(CollectionData.name)
    private model: Model<CollectionDataDocument>,
  ) {
    //
  }

  async create(
    dto: CollectionDataContract['create']['body'],
    options?: BaseOptions,
  ) {
    // 建立資料
    const data: CollectionData = defaultsDeep(
      dto,
      new CollectionData(),
    )

    const [result] = await this.model.create([data], { session: options?.session })
    if (!result) {
      throw new Error('建立 CollectionData 資料錯誤')
    }

    return result
  }

  async find(
    dto: CollectionDataContract['find']['query'],
    options?: BaseOptions,
  ) {
    const { skip = 0, limit = 10 } = dto ?? {}

    const match = pipe(
      {},
      (filter: FilterQuery<CollectionDataDocument>) => {
        return filter
      },
    )

    const [total, data] = await Promise.all([
      this.model.countDocuments(match, { session: options?.session }),
      this.model
        .find(match, {}, { session: options?.session })
        .sort({ 'timestamp.createdAt': -1 })
        .skip(skip)
        .limit(limit),
    ])

    return {
      total,
      skip,
      limit,
      data,
    }
  }

  findOne(
    id: string,
    options?: BaseOptions,
  ) {
    return this.model.findById(id, {}, { session: options?.session })
  }

  async checkExists(id: string) {
    return !!this.model.exists({ _id: id })
  }

  async update(
    id: string,
    dto: CollectionDataContract['update']['body'],
    options?: BaseOptions,
  ) {
    const oldData = await this.findOne(id)
    if (!oldData) {
      return undefined
    }

    const updateData = {
      ...dto,
      timestamp: {
        updatedAt: this.utilsService.getDate(),
      },
    }

    const flatData = flat(updateData, { safe: true }) as any
    const newData = await this.model
      .findByIdAndUpdate(
        id,
        { $set: flatData },
        {
          session: options?.session,
          new: true,
        },
      )

    return newData
  }

  async remove(
    id: string,
    options?: BaseOptions,
  ) {
    const isExisted = await this.checkExists(id)
    if (!isExisted) {
      return undefined
    }

    return this.model
      .deleteOne(
        { _id: id },
        { session: options?.session },
      )
  }
}
