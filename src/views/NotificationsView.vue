<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 mb-1">Уведомления</h2>
        <p class="text-medium-emphasis">История событий системы с фильтром до 30 дней.</p>
      </div>
      <v-btn variant="text" prepend-icon="mdi-check-all" :disabled="!notificationsStore.unreadCount" @click="notificationsStore.markAllRead()">
        Прочитать все
      </v-btn>
    </div>

    <v-card class="mb-4 pa-4">
      <div class="d-flex ga-4 flex-wrap">
        <v-select v-model="periodDays" :items="periodOptions" label="Период" hide-details density="comfortable" style="max-width: 220px" />
        <v-select v-model="statusFilter" :items="statusOptions" label="Статус" hide-details density="comfortable" style="max-width: 220px" />
      </div>
    </v-card>

    <v-alert v-if="!filteredItems.length" type="info" variant="tonal">За выбранный период уведомлений нет.</v-alert>

    <v-card v-for="item in filteredItems" :key="item.id" class="mb-3">
      <v-card-text>
        <div class="d-flex justify-space-between ga-4">
          <div>
            <div class="d-flex align-center ga-2">
              <v-chip size="small" :color="chipColor(item.severity)" variant="tonal">{{ severityLabel(item.severity) }}</v-chip>
              <v-chip size="small" :color="item.read ? 'default' : 'primary'" variant="outlined">{{ item.read ? 'Прочитано' : 'Непрочитано' }}</v-chip>
              <span class="text-caption text-medium-emphasis">{{ new Date(item.createdAt).toLocaleString('ru-RU') }}</span>
            </div>
            <div class="text-subtitle-1 font-weight-medium mt-2">{{ item.title }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ item.message }}</div>
          </div>
          <div class="d-flex flex-column ga-2 align-end">
            <v-btn size="small" variant="text" @click="notificationsStore.markRead(item.id, !item.read)">
              {{ item.read ? 'Отметить непрочитанным' : 'Отметить прочитанным' }}
            </v-btn>
            <v-btn v-if="item.severity === 'error' && item.details" size="small" variant="text" color="error" @click="openDetails(item)">Подробнее</v-btn>
            <v-btn size="small" variant="text" color="error" @click="notificationsStore.remove(item.id)">Удалить</v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="detailsOpen" max-width="720">
      <v-card>
        <v-card-title>Подробности ошибки</v-card-title>
        <v-card-text class="text-body-2" style="white-space: pre-wrap">{{ detailsText }}</v-card-text>
        <v-card-actions><v-spacer /><v-btn variant="flat" color="primary" @click="detailsOpen = false">Закрыть</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationsStore, type AppNotification, type NotificationSeverity } from '@/stores/notifications'

const notificationsStore = useNotificationsStore()

const periodDays = ref(7)
const statusFilter = ref<'all' | 'unread' | 'error'>('all')
const detailsOpen = ref(false)
const detailsText = ref('')

const periodOptions = [
  { title: '1 день', value: 1 },
  { title: '7 дней', value: 7 },
  { title: '14 дней', value: 14 },
  { title: '30 дней (макс)', value: 30 },
]
const statusOptions = [
  { title: 'Все', value: 'all' },
  { title: 'Непрочитанные', value: 'unread' },
  { title: 'Только ошибки', value: 'error' },
]

const filteredItems = computed(() => {
  const minDate = Date.now() - periodDays.value * 24 * 60 * 60 * 1000
  return notificationsStore.items.filter((item) => {
    if (new Date(item.createdAt).getTime() < minDate) return false
    if (statusFilter.value === 'unread') return !item.read
    if (statusFilter.value === 'error') return item.severity === 'error'
    return true
  })
})

function severityLabel(s: NotificationSeverity) {
  return { success: 'Успех', info: 'Инфо', warning: 'Предупреждение', error: 'Ошибка' }[s]
}
function chipColor(s: NotificationSeverity) {
  return { success: 'success', info: 'info', warning: 'warning', error: 'error' }[s]
}

function openDetails(item: AppNotification) {
  detailsText.value = item.details ?? 'Нет дополнительных данных.'
  detailsOpen.value = true
}
</script>
