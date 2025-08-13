import { defineConstants } from '../define'

/** 獨立 constant 檔案可以避免其他資料引用此資料常數時，出現循環引用的問題
 *
 * shard 內部互相引用時，請使用精準路徑 `../collection-data/constant` 來引用
 *
 * 而非 `../collection-data`，因為這樣即使沒用到 schema 也會導致循環引用
 */

export const {
  DATA_TYPE_KV: DATA_TYPE,
  DATA_TYPE_MAP_BY_KEY,
  DATA_TYPE_MAP_BY_VALUE,
  DATA_TYPE_VALUES,
  DATA_TYPE_LIST,
} = defineConstants(
  [
    {
      key: 'COD',
      value: 'cod',
    },
  ] as const,
  'DATA_TYPE',
)
export type DataType = typeof DATA_TYPE_VALUES[number]
