import { defineConstants } from '../define'

/** 獨立 constant 可以避免其他資料引用此資料常數時，出現循環引用的問題
 *
 * shard 內部互相引用時，請使用精準路徑 `../account/constant` 來引用
 *
 * 而非 `../account`，因為這樣即使沒用到 schema 也會導致循環引用
 */

export const {
  ACCOUNT_ROLE_KV: ACCOUNT_ROLE,
  ACCOUNT_ROLE_MAP_BY_KEY,
  ACCOUNT_ROLE_MAP_BY_VALUE,
  ACCOUNT_ROLE_VALUES,
  ACCOUNT_ROLE_LIST,
} = defineConstants(
  [
    {
      key: 'ADMIN',
      value: 'admin',
      label: '管理者',
      description: '可以設定各類原始資料',
    },
    {
      key: 'BASIC',
      value: 'basic',
      label: '使用者',
      description: '只能輸出、查看報價單內容',
    },
  ] as const,
  'ACCOUNT_ROLE',
)
export type AccountRole = typeof ACCOUNT_ROLE_VALUES[number]
