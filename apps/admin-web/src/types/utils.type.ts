import type { DefineComponent } from 'vue'

/** 提取 Vue Component 之內部 props
 *
 * 會將 style、class、event 全部取出來
 *
 * @deprecated 建議使用 [vue-component-type-helpers](https://www.npmjs.com/package/vue-component-type-helpers)
 */
export type ExtractComponentParams<TComponent> =
  TComponent extends new () => { $props: infer P } ? NonNullable<P> :
    TComponent extends (props: infer P, ...args: any) => any ? P :
      never

/** 提取 Vue Component slots
 *
 * @deprecated 建議使用 [vue-component-type-helpers](https://www.npmjs.com/package/vue-component-type-helpers)
 */
export type ExtractComponentSlots<TComponent> =
  TComponent extends new () => {
    $slots: infer P;
  }
    ? P
    : never

/** 提取 Vue SFC 之 props 參數部分
 *
 * 也就是 setup script 之 Props 定義。
 *
 * @deprecated 建議使用 [vue-component-type-helpers](https://www.npmjs.com/package/vue-component-type-helpers)
 */
export type ExtractComponentProps<TComponent> =
  TComponent extends DefineComponent<
    infer P,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >
    ? P
    : never
