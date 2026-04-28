<template>
  <v-container fluid class="notifications-page pa-3 pa-md-6">
    <v-card class="notifications-shell" rounded="xl" elevation="0" border>
      <div class="notifications-header">
        <div>
          <h2 class="text-h4 font-weight-bold mb-2">Уведомления</h2>
          <p class="text-body-1 text-medium-emphasis">История событий системы с фильтром до 30 дней</p>
        </div>
        <v-chip
          v-if="notificationsStore.unreadCount"
          color="primary"
          variant="flat"
          class="font-weight-bold text-uppercase"
          rounded="pill"
        >
          {{ notificationsStore.unreadCount }} новых
        </v-chip>
      </div>

      <div class="notifications-toolbar">
        <div class="d-flex ga-3 flex-wrap">
          <v-btn variant="outlined" rounded="lg" prepend-icon="mdi-check" @click="selectAllVisible">Выбрать все</v-btn>
          <v-btn variant="outlined" rounded="lg" prepend-icon="mdi-eye-outline" :disabled="!selectedIds.length" @click="markSelectedRead">
            Прочитать ({{ selectedIds.length }})
          </v-btn>
          <v-btn variant="outlined" color="error" rounded="lg" prepend-icon="mdi-delete-outline" :disabled="!selectedIds.length" @click="deleteSelected">
            Удалить ({{ selectedIds.length }})
          </v-btn>
        </div>

        <div class="d-flex ga-4 align-center flex-wrap">
          <div class="d-flex align-center ga-2">
            <span class="text-h6">Период:</span>
            <v-select
              v-model="periodDays"
              :items="periodOptions"
              variant="outlined"
              density="compact"
              hide-details
              style="width: 180px"
            />
          </div>
          <div class="d-flex align-center ga-2">
            <span class="text-h6">Статус:</span>
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              variant="outlined"
              density="compact"
              hide-details
              style="width: 200px"
            />
          </div>
        </div>
      </div>

      <div v-if="!filteredItems.length" class="pa-6">
        <v-alert type="info" variant="tonal">За выбранный период уведомлений нет.</v-alert>
      </div>

      <div v-else>
        <article v-for="item in filteredItems" :key="item.id" class="notification-row" :class="{ 'notification-row--read': item.read }">
          <div class="d-flex align-start ga-3 ga-md-4 flex-grow-1">
            <v-checkbox-btn :model-value="selectedIds.includes(item.id)" @update:model-value="toggleSelected(item.id)" />

            <div class="status-icon" :class="`status-icon--${item.severity}`">
              <v-icon :icon="statusIcon(item.severity)" size="28" :color="statusColor(item.severity)" />
            </div>

            <div class="notification-content flex-grow-1">
              <div class="d-flex align-center ga-3 flex-wrap">
                <v-icon icon="mdi-circle" :color="statusColor(item.severity)" size="12" />
                <h3 class="notification-title">{{ item.title }}</h3>
                <v-chip :color="statusColor(item.severity)" variant="tonal" size="small">{{ severityLabel(item.severity) }}</v-chip>
              </div>
              <p class="text-h6 text-medium-emphasis font-weight-regular mt-2">{{ item.message }}</p>
              <p class="text-body-1 text-medium-emphasis mt-4">Источник: {{ sourceLabel(item.source) }}</p>
            </div>
          </div>

          <div class="d-flex flex-column justify-space-between align-end ga-4">
            <div class="text-h5 text-medium-emphasis">{{ formatRelative(item.createdAt) }}</div>
            <div class="d-flex align-center ga-4">
              <v-btn
                v-if="!item.read"
                icon="mdi-eye-outline"
                variant="text"
                size="small"
                color="grey-darken-2"
                title="Прочитать"
                @click="notificationsStore.markRead(item.id, true)"
              />
              <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" title="Удалить" @click="notificationsStore.remove(item.id)" />
            </div>
          </div>
        </article>
      </div>
    </v-card>

  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNotificationsStore, type NotificationSeverity } from '@/stores/notifications'

const notificationsStore = useNotificationsStore()

const periodDays = ref(7)
const statusFilter = ref<'all' | 'unread' | 'error'>('all')
const selectedIds = ref<string[]>([])

const periodOptions = [
  { title: '1 день', value: 1 },
  { title: '7 дней', value: 7 },
  { title: '14 дней', value: 14 },
  { title: '30 дней', value: 30 },
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

watch(filteredItems, (list) => {
  const ids = new Set(list.map((item) => item.id))
  selectedIds.value = selectedIds.value.filter((id) => ids.has(id))
})

function toggleSelected(id: string) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
    return
  }
  selectedIds.value = [...selectedIds.value, id]
}

function selectAllVisible() {
  const visibleIds = filteredItems.value.map((item) => item.id)
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.value.includes(id))
  selectedIds.value = allSelected ? selectedIds.value.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...selectedIds.value, ...visibleIds]))
}

function deleteSelected() {
  selectedIds.value.forEach((id) => notificationsStore.remove(id))
  selectedIds.value = []
}

function markSelectedRead() {
  selectedIds.value.forEach((id) => notificationsStore.markRead(id, true))
}

function sourceLabel(source: string) {
  const sourceMap: Record<string, string> = {
    pipelines: 'GitLab CI/CD',
    storage: 'MinIO Storage',
    inference: 'BentoML',
  }
  return sourceMap[source] ?? source
}

function severityLabel(s: NotificationSeverity) {
  return { success: 'Успех', info: 'Инфо', warning: 'Предупреждение', error: 'Ошибка' }[s]
}

function statusIcon(s: NotificationSeverity) {
  return { success: 'mdi-check-circle-outline', info: 'mdi-information-outline', warning: 'mdi-alert-outline', error: 'mdi-alert-circle-outline' }[s]
}

function statusColor(s: NotificationSeverity) {
  return { success: 'success', info: 'info', warning: 'warning', error: 'error' }[s]
}

function formatRelative(isoDate: string) {
  const diffHours = Math.max(1, Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60)))
  return `${diffHours} ч назад`
}
</script>

<style scoped>
.notifications-shell {
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 30px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.notifications-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 30px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.notification-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 30px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.notification-row--read {
  opacity: 0.85;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
}

.status-icon--success {
  background: rgba(var(--v-theme-success), 0.12);
  border-color: rgba(var(--v-theme-success), 0.35);
}

.status-icon--info {
  background: rgba(var(--v-theme-info), 0.12);
  border-color: rgba(var(--v-theme-info), 0.35);
}

.status-icon--warning {
  background: rgba(var(--v-theme-warning), 0.12);
  border-color: rgba(var(--v-theme-warning), 0.35);
}

.status-icon--error {
  background: rgba(var(--v-theme-error), 0.08);
  border-color: rgba(var(--v-theme-error), 0.25);
}

.notification-title {
  font-size: 34px;
  line-height: 1.2;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .notifications-toolbar,
  .notification-row {
    flex-direction: column;
    align-items: stretch;
  }

  .notification-title {
    font-size: 28px;
  }
}
</style>
