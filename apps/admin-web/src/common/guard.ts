import type { ComponentPublicInstance } from 'vue'

/** 是否為 ComponentPublicInstance
 *
 * Quasar 有些 hook 會回傳 Component，實際內容為 ComponentPublicInstance
 *
 * 但不知道為甚麼形別內容很貧乏，可以透過此 guard 保證型別
 */
export function isComponentPublicInstance(
  instance: any,
): instance is ComponentPublicInstance {
  return !!instance?.$el
}
