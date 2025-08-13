import {
  Controller,
} from '@nestjs/common'
import { collectionDataContract } from '@ts-rest-practice/shared'
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'
import to from 'await-to-js'
import { LoggerService } from '../../logger/logger.service'
import {
  CollectionDataService,
} from './collection-data.service'

@Controller()
export class CollectionDataController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly collectionDataService: CollectionDataService,
  ) {
    //
  }

  @TsRestHandler(collectionDataContract.create)
  async create() {
    return tsRestHandler(collectionDataContract.create, async ({
      body: dto,
    }) => {
      const [error, data] = await to(this.collectionDataService.create(
        dto,
      ))
      // ignore coverage
      if (error) {
        this.loggerService.error(`建立 CollectionData 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '建立 CollectionData 錯誤，請稍後再試',
          },
        }
      }

      return {
        status: 200,
        body: data,
      }
    })
  }

  @TsRestHandler(collectionDataContract.find)
  async find() {
    return tsRestHandler(collectionDataContract.find, async ({
      query: dto,
    }) => {
      const [error, result] = await to(this.collectionDataService.find(dto))
      // ignore coverage
      if (error) {
        this.loggerService.error(`取得所有 CollectionData 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '取得所有 CollectionData 錯誤，請稍後再試',
          },
        }
      }

      return {
        status: 200,
        body: result,
      }
    })
  }

  @TsRestHandler(collectionDataContract.findOne)
  async findOne() {
    return tsRestHandler(collectionDataContract.findOne, async ({
      params: { id },
    }) => {
      const [error, document] = await to(this.collectionDataService.findOne(id))
      // ignore coverage
      if (error) {
        this.loggerService.error(`取得指定 CollectionData 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '取得指定 CollectionData 錯誤，請稍後再試',
          },
        }
      }

      if (!document) {
        return {
          status: 404,
        }
      }

      return {
        status: 200,
        body: document,
      }
    })
  }

  @TsRestHandler(collectionDataContract.update)
  async update() {
    return tsRestHandler(collectionDataContract.update, async ({
      params: { id },
      body: dto,
    }) => {
      const oldData = await this.collectionDataService.findOne(id)
      if (!oldData) {
        return {
          status: 404,
        }
      }

      const [error, data] = await to(this.collectionDataService.update(id, dto))
      // ignore coverage
      if (error) {
        this.loggerService.error(`更新 CollectionData 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '更新 CollectionData 錯誤，請稍後再試',
          },
        }
      }
      if (!data) {
        return {
          status: 404,
        }
      }

      return {
        status: 200,
        body: data,
      }
    })
  }

  @TsRestHandler(collectionDataContract.remove)
  async remove() {
    return tsRestHandler(collectionDataContract.remove, async ({
      params: { id },
    }) => {
      const oldData = await this.collectionDataService.findOne(id)
      if (!oldData) {
        return {
          status: 404,
        }
      }

      const [error, data] = await to(this.collectionDataService.remove(id))
      // ignore coverage
      if (error) {
        this.loggerService.error(`刪除 CollectionData 錯誤 :`)
        this.loggerService.error(error)

        return {
          status: 500,
          body: {
            message: '刪除 CollectionData 錯誤，請稍後再試',
          },
        }
      }
      if (!data) {
        return {
          status: 404,
        }
      }

      return {
        status: 200,
      }
    })
  }
}
