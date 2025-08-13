import type { AccountRole } from '@ts-rest-practice/shared'

export const REFRESH_TOKEN_COOKIE_KEY = 'rt'
export const TOKEN_HEADER_KEY = 'authorization'

export interface JwtPayload {
  id: string;
  role: AccountRole;
}

/** 被 passport 嵌入 request 中的 user 物件 */
export type RequestUser = JwtPayload
