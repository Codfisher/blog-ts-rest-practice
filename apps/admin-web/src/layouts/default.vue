<template>
  <q-layout view="hHh LpR fFf">
    <q-header class="bg-primary">
      <q-toolbar>
        <q-toolbar-title>
          <q-btn
            dense
            flat
            round
            icon="menu"
            @click="mainStore.toggleDrawerVisible()"
          />

          <span class="text-xl font-medium">
            管理系統
          </span>
        </q-toolbar-title>

        <!-- <q-icon
          name="logout"
          size="1.5rem"
          class="mr-1 cursor-pointer"
          @click="logout"
        /> -->

        <q-icon
          name="person"
          size="1.5rem"
          class="mr-1"
          @click="openDialog"
        />
        <!-- {{ user?.name }} -->
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawerVisible"
      side="left"
      bordered
    >
      <menu-nav />
    </q-drawer>

    <q-page-container>
      <q-page class="flex-col">
        <router-view />
      </q-page>
    </q-page-container>

    <!-- 登入 -->
    <!-- <q-dialog
      v-if="!isUserLoading"
      :model-value="!user"
      persistent
    >
      <login-form />
    </q-dialog> -->
  </q-layout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { openBaseDialog } from '../common/utils-quasar'
import MenuNav from '../components/menu-nav.vue'
import { useMainStore } from '../stores/main-store'

const mainStore = useMainStore()

const { drawerVisible } = storeToRefs(mainStore)

function openDialog() {
  const dialog = openBaseDialog({
    title: '標題',
  })

  /** 呼叫 update，就可以更新資料，params 同原本型別
   *
   * openUsingDialog 的 dialog 同理
   */
  setTimeout(() => {
    dialog.update({
      title: '更新後的標題',
    })
  }, 1000)
}
</script>
