import { describe, expect, it } from 'vitest'
import { simplifyToDocIdDeep } from './main'

describe('simplifyToDocIdDeep', () => {
  it('應直接返回原始型別', () => {
    expect(simplifyToDocIdDeep(123)).toBe(123)
    expect(simplifyToDocIdDeep('hello')).toBe('hello')
    expect(simplifyToDocIdDeep(true)).toBe(true)
    expect(simplifyToDocIdDeep(null)).toBe(null)
    expect(simplifyToDocIdDeep(undefined)).toBe(undefined)
  })

  it('應簡化根層級帶有 id 的物件', () => {
    const data = { id: 'rootId', name: 'test' }
    expect(simplifyToDocIdDeep(data)).toBe('rootId')
  })

  it('應簡化巢狀物件中的 id', () => {
    const data = {
      a: 1,
      b: { id: 'nestedId1', value: 'b' },
      c: {
        data: 3,
        d: { id: 'nestedId2', value: 'd' },
      },
      e: { value: 'e' }, // No id here
    }
    const expected = {
      a: 1,
      b: 'nestedId1',
      c: {
        data: 3,
        d: 'nestedId2',
      },
      e: { value: 'e' },
    }
    expect(simplifyToDocIdDeep(data)).toEqual(expected)
  })

  it('應簡化帶有 id 的物件陣列', () => {
    const data = [
      { id: 'arrId1', value: 1 },
      { data: 2, nested: { id: 'arrNestedId1', value: 'nested' } },
      { value: 3 }, // No id here
      4, // Primitive in array
    ]
    const expected = [
      'arrId1',
      { data: 2, nested: 'arrNestedId1' },
      { value: 3 },
      4,
    ]
    expect(simplifyToDocIdDeep(data)).toEqual(expected)
  })

  it('應處理包含陣列和物件的複雜巢狀結構', () => {
    const data = {
      level1: { id: 'level1Id', value: 'l1' },
      items: [
        { id: 'item1Id', name: 'item1' },
        {
          data: 'item2Data',
          details: { id: 'details1Id', info: 'info1' },
          tags: [{ id: 'tag1Id' }, { id: 'tag2Id' }],
        },
        { nonIdObject: { value: 'abc' } },
      ],
      metadata: {
        timestamp: 12345,
        source: { id: 'sourceId', type: 'typeA' },
      },
      primitive: 'primitiveValue',
    }
    const expected = {
      level1: 'level1Id',
      items: [
        'item1Id',
        {
          data: 'item2Data',
          details: 'details1Id',
          tags: ['tag1Id', 'tag2Id'],
        },
        { nonIdObject: { value: 'abc' } },
      ],
      metadata: {
        timestamp: 12345,
        source: 'sourceId',
      },
      primitive: 'primitiveValue',
    }
    expect(simplifyToDocIdDeep(data)).toEqual(expected)
  })

  it('應處理空物件和空陣列', () => {
    expect(simplifyToDocIdDeep({})).toEqual({})
    expect(simplifyToDocIdDeep([])).toEqual([])
    const data = { a: {}, b: [] }
    expect(simplifyToDocIdDeep(data)).toEqual({ a: {}, b: [] })
  })

  it('應處理包含 null 或 undefined 的物件/陣列', () => {
    const data = {
      a: null,
      b: undefined,
      c: [null, undefined],
      d: { id: 'dId', value: null },
      e: { nested: { id: 'eId', value: undefined } },
    }
    const expected = {
      a: null,
      b: undefined,
      c: [null, undefined],
      d: 'dId',
      e: { nested: 'eId' },
    }
    expect(simplifyToDocIdDeep(data)).toEqual(expected)
  })

  it('若根物件沒有 id，則不應簡化', () => {
    const data = { name: 'test', value: 1 }
    expect(simplifyToDocIdDeep(data)).toEqual({ name: 'test', value: 1 })
  })
})
