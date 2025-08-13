import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/** 儲存 access token，不放在 userStore 中視為了避免 src\common\api.ts 循環依賴 */
export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref('')
  function setAccessToken(token: string) {
    accessToken.value = token

    // 若有需要也可以將儲存位置改為 localStorage
  }

  return {
    accessToken: computed(() => accessToken.value),
    setAccessToken,
  }
})
