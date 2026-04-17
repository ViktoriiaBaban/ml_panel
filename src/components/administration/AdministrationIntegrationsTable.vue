<template>
  <v-card flat rounded="lg" class="admin-card">
    <v-data-table-server
      :headers="headers"
      :items="integrations"
      :items-length="integrations.length"
      :loading="loading"
      item-value="id"
      class="admin-table"
      density="comfortable"
      hover
    >
      <template #item.name="{ item }">
        <div class="name-cell">{{ item.name }}</div>
      </template>

      <template #item.status="{ item }">
        <div class="icon-text">
          <v-icon :icon="statusIcon(item.status)" :color="statusColor(item.status)" size="22" />
          <span :class="statusClass(item.status)">{{ statusLabels[item.status] }}</span>
        </div>
      </template>

      <template #item.actions="{ item }">
        <div class="actions-wrap">
          <v-btn
            v-if="!item.connected"
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="mdi-plus"
            class="action-btn"
            @click="$emit('edit-integration', item.id)"
          >
            Подключить
          </v-btn>

          <template v-else>
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              :prepend-icon="checkingIntegrationId === item.id ? 'mdi-loading mdi-spin' : 'mdi-refresh'"
              :disabled="checkingIntegrationId === item.id"
              class="action-btn"
              @click="$emit('check-integration', item.id)"
            >
              {{ checkingIntegrationId === item.id ? 'Проверка...' : 'Проверить' }}
            </v-btn>

            <v-btn icon="mdi-cog-outline" size="small" variant="text" color="default" @click="$emit('edit-integration', item.id)" />
            <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="$emit('delete-integration', item.id)" />
          </template>
        </div>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import type { AdminIntegration, IntegrationStatus } from '@/types/administration'

defineProps<{
  headers: DataTableHeader[]
  integrations: AdminIntegration[]
  statusLabels: Record<IntegrationStatus, string>
  loading: boolean
  checkingIntegrationId: string | null
}>()

defineEmits<{
  'check-integration': [id: string]
  'edit-integration': [id: string]
  'delete-integration': [id: string]
}>()

function statusIcon(status: IntegrationStatus) {
  if (status === 'not_connected') return 'mdi-alert-circle-outline'
  if (status === 'working') return 'mdi-check-circle-outline'
  if (status === 'warning') return 'mdi-alert-outline'
  return 'mdi-close-circle-outline'
}

function statusColor(status: IntegrationStatus) {
  if (status === 'not_connected') return '#9ca3af'
  if (status === 'working') return '#16a34a'
  if (status === 'warning') return '#d97706'
  return '#ef4444'
}

function statusClass(status: IntegrationStatus) {
  if (status === 'not_connected') return 'status-not-connected'
  if (status === 'working') return 'status-working'
  if (status === 'warning') return 'status-warning'
  return 'status-error'
}
</script>

<style scoped>
.admin-card {
  border: 1px solid #e5e7eb;
}

.name-cell {
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.25;
}

.icon-text {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.125rem;
  font-weight: 500;
}

.actions-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-btn {
  text-transform: none;
  letter-spacing: 0;
}

.status-working {
  color: #16a34a;
}

.status-warning {
  color: #d97706;
}

.status-not-connected {
  color: #64748b;
}

.status-error {
  color: #ef4444;
}

:deep(.admin-table .v-data-table-header__content) {
  text-transform: uppercase;
  font-weight: 600;
  color: #64748b;
}
</style>
