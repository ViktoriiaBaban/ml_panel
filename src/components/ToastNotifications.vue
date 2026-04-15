<template>
  <div class="toast-wrap">
    <v-alert
      v-for="toast in notificationsStore.toastQueue"
      :key="toast.id"
      :type="toVuetifyType(toast.severity)"
      variant="flat"
      border="start"
      class="toast-item text-white"
      closable
      @click:close="notificationsStore.dismissToast(toast.id)"
    >
      <div class="font-weight-medium">{{ toast.title }}</div>
      <div class="text-caption mt-1">{{ toast.message }}</div>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { useNotificationsStore, type NotificationSeverity } from '@/stores/notifications'

const notificationsStore = useNotificationsStore()

function toVuetifyType(severity: NotificationSeverity): 'success' | 'info' | 'warning' | 'error' {
  return severity
}
</script>

<style scoped>
.toast-wrap {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2500;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(420px, calc(100vw - 32px));
}

.toast-item {
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.15);
  opacity: 1;
}
</style>
