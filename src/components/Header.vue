<template>
  <v-app-bar flat color="white" border="b" height="76">
    <div class="header-wrap">
      <div>
        <AppBreadcrumbs :items="breadcrumbs" />
        <h1 class="header-title">{{ title }}</h1>
      </div>

      <div class="header-actions">
        <v-btn icon variant="text">
          <HelpCircle :size="20" />
        </v-btn>
        <v-badge :content="notificationsStore.unreadCount" :model-value="notificationsStore.unreadCount > 0" color="error" location="top end">
          <v-btn icon variant="text" @click="router.push({ name: 'notifications' })">
            <Bell :size="20" />
          </v-btn>
        </v-badge>
      </div>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { HelpCircle, Bell } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import AppBreadcrumbs, { type BreadcrumbItem } from './AppBreadcrumbs.vue'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const notificationsStore = useNotificationsStore()

withDefaults(defineProps<{
  title?: string
  breadcrumbs?: BreadcrumbItem[]
}>(), {
  title: '',
  breadcrumbs: () => [],
})
</script>

<style scoped>
.header-wrap {
  width: 100%;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 24px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
