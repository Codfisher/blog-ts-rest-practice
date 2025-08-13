import { Types } from 'mongoose'
import { parseObjectId } from './utils-mongoose'

describe('parseObjectId', () => {
  it('應該被定義', () => {
    expect(parseObjectId).toBeDefined()
  })

  it('當給定有效的 ObjectId 字串時應該返回 ObjectId', () => {
    const idString = new Types.ObjectId().toHexString()
    const result = parseObjectId(idString)
    expect(result).toBeInstanceOf(Types.ObjectId)
    expect(result.toHexString()).toBe(idString)
  })

  it('當給定有效的 ObjectId 實例時應該返回 ObjectId', () => {
    const idInstance = new Types.ObjectId()
    const result = parseObjectId(idInstance)
    expect(result).toBeInstanceOf(Types.ObjectId)
    expect(result.toHexString()).toBe(idInstance.toHexString())
  })

  it('當給定具有 _id 屬性的物件時應該返回 ObjectId', () => {
    const idString = new Types.ObjectId().toHexString()
    const obj = { _id: idString }
    const result = parseObjectId(obj)
    expect(result).toBeInstanceOf(Types.ObjectId)
    expect(result.toHexString()).toBe(idString)
  })

  it('當給定有效 ObjectId 字串的陣列時應該返回 ObjectId 陣列', () => {
    const idStrings = [new Types.ObjectId().toHexString(), new Types.ObjectId().toHexString()]
    const result = parseObjectId(idStrings)
    expect(result).toBeInstanceOf(Array)
    result.forEach((id, index) => {
      expect(id).toBeInstanceOf(Types.ObjectId)
      expect(id.toHexString()).toBe(idStrings[index])
    })
  })

  it('當給定有效 ObjectId 實例的陣列時應該返回 ObjectId 陣列', () => {
    const idInstances = [new Types.ObjectId(), new Types.ObjectId()]
    const result = parseObjectId(idInstances)
    expect(result).toBeInstanceOf(Array)
    result.forEach((id, index) => {
      expect(id).toBeInstanceOf(Types.ObjectId)
    })
  })

  it('當給定具有 _id 屬性的物件陣列時應該返回 ObjectId 陣列', () => {
    const idStrings = [
      new Types.ObjectId().toHexString(),
      new Types.ObjectId().toHexString(),
    ] as const
    const objs = [{ _id: idStrings[0] }, { _id: idStrings[1] }]
    const result = parseObjectId(objs)
    expect(result).toBeInstanceOf(Array)
    result.forEach((id, index) => {
      expect(id).toBeInstanceOf(Types.ObjectId)
      expect(id.toHexString()).toBe(idStrings[index])
    })
  })

  it('當給定 undefined 時應該返回 undefined', () => {
    {
      // @ts-expect-error test undefined
      const result = parseObjectId(undefined)
      expect(result).toBeUndefined()
    }

    {
      // @ts-expect-error test [undefined]
      const result = parseObjectId([undefined])
      expect(result).toBeInstanceOf(Array)
    }
  })

  it('當給定 null 時應該返回 null', () => {
    // @ts-expect-error test null
    const result = parseObjectId(null)
    expect(result).toBeNull()
  })
})
