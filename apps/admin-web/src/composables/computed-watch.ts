import type { UnwrapRef, WatchCallback, WatchSource } from 'vue'
import { cloneDeep } from 'lodash-es'
import { shallowRef, watch } from 'vue'

type ComputedWatchCallback<Value, OldValue, Data, OnCleanup> = (value: Value, oldValue: OldValue, onCleanup: OnCleanup) => Data

/** 解決 computed 無法 deep 問題 */
export function computedWatch<Target, Data>(
  source: WatchSource<Target>,
  initialState: Data,
  cb: ComputedWatchCallback<Target, Target | undefined, Data, Parameters<WatchCallback>[2]>,
) {
  const data = shallowRef<Data>(cloneDeep(initialState))

  watch(source, (value, oldValue, onCleanup) => {
    data.value = cb(cloneDeep(value), cloneDeep(oldValue), onCleanup) as UnwrapRef<Data>
  }, { deep: true, immediate: true })

  return data
}
