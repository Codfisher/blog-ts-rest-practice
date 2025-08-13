/** 以下只是範例，可以任一新增 */
interface IBaseDef {
  key: PropertyKey;
  value: string | number;
  label?: string;
  /** Quasar 顏色名稱 */
  colorName?: string;
  /** HEX 進位色票 */
  color?: string;
  /** Material Symbols icon 名稱 */
  iconName?: string;
  /** 描述 */
  description?: string;
}

type ToPropertyPrefix<N extends string = ''> = N extends '' ? '' : `${N}_`

type ToProperty<
  Property extends string,
  N extends string = '',
> = `${ToPropertyPrefix<N>}${Property}`

type ToKeys<T> = T extends readonly [infer A, ...infer B]
  ? A extends {
    readonly key: infer K;
  }
    ? B['length'] extends 0
      ? [K]
      : [K, ...ToKeys<B>]
    : never
  : []

type ToValues<T> = T extends readonly [infer A, ...infer B]
  ? A extends {
    readonly value: infer K;
  }
    ? B['length'] extends 0
      ? [K]
      : [K, ...ToValues<B>]
    : never
  : []

type ToSingleKeyMap<T> = T extends {
  readonly key: infer K;
}
  ? K extends PropertyKey
    ? {
        readonly [Key in K]: T;
      }
    : never
  : never

export type MergeIntersection<A> = A extends infer T
  ? { [Key in keyof T]: T[Key] }
  : never

type ToKeyMap<T> = T extends readonly [infer A, ...infer B]
  ? B['length'] extends 0
    ? ToSingleKeyMap<A>
    : MergeIntersection<ToSingleKeyMap<A> & ToKeyMap<B>>
  : []

type ToSingleValueMap<T> = T extends {
  readonly value: infer K;
}
  ? K extends PropertyKey
    ? {
        readonly [Key in K]: T;
      }
    : never
  : never

type ToValueMap<T> = T extends readonly [infer A, ...infer B]
  ? B['length'] extends 0
    ? ToSingleValueMap<A>
    : MergeIntersection<ToSingleValueMap<A> & ToValueMap<B>>
  : []

type ToSingleKeyValue<T> = T extends {
  readonly key: infer K;
  readonly value: infer V;
}
  ? K extends PropertyKey
    ? {
        readonly [Key in K]: V;
      }
    : never
  : never

type ToKeyValue<T> = T extends readonly [infer A, ...infer B]
  ? B['length'] extends 0
    ? ToSingleKeyValue<A>
    : MergeIntersection<ToSingleKeyValue<A> & ToKeyValue<B>>
  : []

type ToSingleValueKey<T> = T extends {
  readonly key: infer K;
  readonly value: infer V;
}
  ? V extends PropertyKey
    ? {
        readonly [Key in V]: K;
      }
    : never
  : never

type ToValueKey<T> = T extends readonly [infer A, ...infer B]
  ? B['length'] extends 0
    ? ToSingleValueKey<A>
    : MergeIntersection<ToSingleValueKey<A> & ToValueKey<B>>
  : []

/** 用於建構列舉內容
 *
 * KV 是 key value 的意思。
 *
 * 定義矩陣資料記得加上 as const。
 *
 * 矩陣內容其實不需先在 IBaseDef 定義，直接新增也可以
 *
 * @example
 * ```typescript
 * // 運送方式常數定義
 * export const {
 *   DELIVERY_METHOD_KV: DELIVERY_METHOD,
 *   DELIVERY_METHOD_MAP_BY_KEY,
 *   DELIVERY_METHOD_MAP_BY_VALUE,
 *   DELIVERY_METHOD_VALUES,
 *   DELIVERY_METHOD_LIST,
 * } = defineConstants(
 *   [
 *     {
 *       key: 'HOME',
 *       value: 'home',
 *       label: '宅配',
 *     },
 *     {
 *       key: 'SELF_PICKUP',
 *       value: 'self-pickup',
 *       label: '自取',
 *     },
 *   ] as const,
 *   'DELIVERY_METHOD'
 * )
 * // 運送方式
 * export type DeliveryMethod = typeof DELIVERY_METHOD_VALUES[number];
 * ```
 */
export function defineConstants<
  T extends readonly IBaseDef[],
  N extends string = '',
>(defs: T, namespace?: N) {
  const prefix = namespace ? `${namespace}_` : ''
  return {
    [`${prefix}KEYS`]: defs.map((item) => item.key),
    [`${prefix}VALUES`]: defs.map((item) => item.value),
    [`${prefix}KV`]: defs.reduce(
      (map, item) => ({
        ...map,
        [item.key]: item.value,
      }),
      {},
    ),
    [`${prefix}VK`]: defs.reduce(
      (map, item) => ({
        ...map,
        [item.value]: item.key,
      }),
      {},
    ),
    [`${prefix}MAP_BY_KEY`]: defs.reduce(
      (map, item) => ({
        ...map,
        [item.key]: item,
      }),
      {},
    ),
    [`${prefix}MAP_BY_VALUE`]: defs.reduce(
      (map, item) => ({
        ...map,
        [item.value]: item,
      }),
      {},
    ),
    [`${prefix}KEY_MAP`]: defs.reduce(
      (map, item) => ({
        ...map,
        [item.key]: item,
      }),
      {},
    ),
    [`${prefix}MAP`]: defs.reduce(
      (map, item) => ({
        ...map,
        [item.key]: item.value,
      }),
      {},
    ),
    [`${prefix}LIST`]: defs,
  } as MergeIntersection<
    {
      [Key in ToProperty<'KV', N>]: ToKeyValue<T>;
    } & {
      [Key in ToProperty<'VK', N>]: ToValueKey<T>;
    } & {
      [Key in ToProperty<'KEYS', N>]: ToKeys<T>;
    } & {
      [Key in ToProperty<'VALUES', N>]: ToValues<T>;
    } & {
      [Key in ToProperty<'MAP_BY_KEY', N>]: ToKeyMap<T>;
    } & {
      [Key in ToProperty<'MAP_BY_VALUE', N>]: ToValueMap<T>;
    } & {
      [Key in ToProperty<'MAP', N>]: ToKeyValue<T>;
    } & {
      [Key in ToProperty<'LIST', N>]: T;
    }
  >
}
