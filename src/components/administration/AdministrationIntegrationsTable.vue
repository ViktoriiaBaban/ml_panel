<template>
  <div class="integrations-layout">
    <v-card flat rounded="lg" class="admin-card">
      <v-card-text class="text-medium-emphasis pb-0">
        Мониторинг состояния глобальных подключений, используемых всей платформой.
      </v-card-text>

      <v-data-table-server
        :headers="headers"
        :items="integrations"
        :items-length="integrations.length"
        :loading="loading"
        item-value="id"
        :expanded="expanded"
        class="admin-table"
        density="comfortable"
      >
        <template #item.name="{ item }">
          <v-btn variant="text" color="default" class="name-btn" @click="$emit('toggle-expanded', item.id)">
            {{ item.name }}
          </v-btn>
        </template>

        <template #item.status="{ item }">
          <div class="icon-text">
            <v-icon :icon="statusIcon(item.status)" :color="statusColor(item.status)" size="18" />
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
              prepend-icon="mdi-plus-circle-outline"
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
                @click="$emit('check-integration', item.id)"
              >
                {{ checkingIntegrationId === item.id ? 'Проверка...' : 'Проверить' }}
              </v-btn>
              <v-btn
                color="default"
                variant="outlined"
                size="small"
                prepend-icon="mdi-pencil-outline"
                @click="$emit('edit-integration', item.id)"
              >
                Изменить
              </v-btn>
            </template>
          </div>
        </template>

        <template #expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length">
              <div class="details-wrap" v-if="item.details">
                <div v-if="item.details.url"><strong>URL:</strong> {{ item.details.url }}</div>
                <div v-if="item.healthCheckPath"><strong>Health-check:</strong> {{ item.healthCheckPath }}</div>
                <div v-if="item.details.version"><strong>Версия API:</strong> {{ item.details.version }}</div>
                <div v-if="item.details.error" class="text-error"><strong>Ошибка:</strong> {{ item.details.error }}</div>
                <div v-if="item.details.lastSuccessfulCall"><strong>Последний успешный вызов:</strong> {{ item.details.lastSuccessfulCall }}</div>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table-server>
    </v-card>

    <v-alert type="info" variant="tonal" border="start" class="health-checks">
      <div class="font-weight-medium mb-2">Health-check проверки:</div>
      <div v-for="check in healthChecks" :key="check.name"><strong>{{ check.name }}:</strong> {{ check.command }}</div>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DataTableHeader } from 'vuetify'
import type { AdminIntegration, HealthCheck, IntegrationStatus } from '@/types/administration'

const props = defineProps<{
  headers: DataTableHeader[]
  integrations: AdminIntegration[]
  healthChecks: HealthCheck[]
  statusLabels: Record<IntegrationStatus, string>
  loading: boolean
  expandedIntegrationId: string | null
  checkingIntegrationId: string | null
}>()

defineEmits<{
  'toggle-expanded': [id: string]
  'check-integration': [id: string]
  'edit-integration': [id: string]
}>()

const expanded = computed(() => (props.expandedIntegrationId ? [props.expandedIntegrationId] : []))

function statusIcon(status: IntegrationStatus) {
  if (status === 'not_connected') return 'mdi-link-off'
  if (status === 'working') return 'mdi-check-circle'
  if (status === 'warning') return 'mdi-alert'
  return 'mdi-alert-circle'
}

function statusColor(status: IntegrationStatus) {
  if (status === 'not_connected') return 'grey'
  if (status === 'working') return 'success'
  if (status === 'warning') return 'warning'
  return 'error'
}

function statusClass(status: IntegrationStatus) {
  if (status === 'not_connected') return 'text-medium-emphasis'
  if (status === 'working') return 'text-success'
  if (status === 'warning') return 'text-warning'
  return 'text-error'
}
</script>

<style scoped>
.integrations-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-card {
  border: 1px solid #e5e7eb;
}

.name-btn {
  justify-content: flex-start;
  text-transform: none;
  letter-spacing: normal;
}

.icon-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.details-wrap {
  padding: 12px;
  display: grid;
  gap: 6px;
  background: #f9fafb;
}

.actions-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
