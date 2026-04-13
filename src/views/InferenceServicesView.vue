<template>
  <v-container fluid class="pa-0">
    <div class="flex-1 bg-[#F5F7FA] p-6">
      <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] max-w-[1360px] mx-auto">
        <div class="p-4 border-b border-gray-200">
          <div class="d-flex w-100 justify-space-around ga-3">
            <v-text-field
              v-model="searchTerm"
              prepend-inner-icon="mdi-magnify"
              placeholder="Поиск по названию, проекту или модели…"
              variant="outlined"
              density="compact"
              hide-details
            />
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              max-width="300"
              hide-details
            />
            <v-select
              v-model="projectFilter"
              :items="projectOptions"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              max-width="300"
              hide-details
            />
          </div>
        </div>
        <v-data-table-server
          :headers="serviceHeaders"
          :items="servicesStore.items"
          :items-length="servicesStore.total"
          :loading="servicesStore.loading"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          item-value="id"
          class="inference-services-table"
          density="comfortable"
          @update:options="onTableOptionsUpdate"
        >
          <template #item.name="{ item }">
            <button
              class="flex items-center gap-2 text-sm text-gray-700 hover:text-[#409EFF] transition-colors"
              @click="goToMonitoring(item.id, item.name)"
            >
              <Bot class="w-4 h-4 flex-shrink-0" />
              <span class="font-medium truncate">{{ item.name }}</span>
            </button>
          </template>
          <template #item.model="{ item }">
            <span class="text-sm text-gray-700">{{ item.model }}</span>
          </template>
          <template #item.endpoint="{ item }">
            <span class="text-sm text-gray-600">{{ item.endpoint }}</span>
          </template>
          <template #item.status="{ item }">
            <div class="flex items-center gap-2">
              <component :is="statusIcon(item.status)" :class="statusIconColor(item.status)" class="w-4 h-4" />
              <span class="text-sm text-gray-900">{{ statusText(item.status) }}</span>
            </div>
          </template>
          <template #item.rps="{ item }">
            <span class="text-sm text-gray-900">{{ item.rps > 0 ? item.rps.toFixed(1) : '—' }}</span>
          </template>
          <template #item.latencyP95="{ item }">
            <span :class="['text-sm font-medium', latencyColor(item.latencyP95)]">
              {{ item.latencyP95 > 0 ? `${item.latencyP95} ms` : '—' }}
            </span>
          </template>
          <template #item.errorRate="{ item }">
            <span class="text-sm text-gray-900">
              {{ item.status === 'running' ? `${item.errorRate.toFixed(1)}%` : '—' }}
            </span>
          </template>
          <template #item.actions="{ item }">
            <v-menu location="bottom end">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  variant="text"
                  size="small"
                  class="text-gray-500"
                >
                  <MoreHorizontal class="w-4 h-4" />
                </v-btn>
              </template>
              <v-list density="compact" min-width="168">
                <v-list-item :disabled="item.status === 'running'" title="Запустить">
                  <template #prepend>
                    <Play class="w-4 h-4 text-green-600" />
                  </template>
                </v-list-item>
                <v-list-item :disabled="item.status === 'stopped'" title="Остановить">
                  <template #prepend>
                    <Square class="w-4 h-4 text-red-600" />
                  </template>
                </v-list-item>
                <v-list-item :disabled="item.status === 'stopped'" title="Перезапустить">
                  <template #prepend>
                    <RotateCw class="w-4 h-4 text-[#409EFF]" />
                  </template>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table-server>
        <div class="px-4 py-3 border-t border-gray-200">
          <div class="text-sm text-gray-600">Показано {{ servicesStore.items.length }} из {{ servicesStore.total }} сервисов</div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { DataTableHeader, DataTableOptions } from 'vuetify'
import { Play, Square, RotateCw, Bot, CheckCircle, XCircle, MinusCircle, MoreHorizontal } from 'lucide-vue-next'
import { useInferenceServicesStore, type ServiceStatus } from '@/stores/inferenceServices'

const router = useRouter()

const searchTerm = ref('')
const statusFilter = ref('all')
const projectFilter = ref('all')

const servicesStore = useInferenceServicesStore()
servicesStore.fetchServices({ search: '', status: 'all', project: 'all', page: 1, perPage: 10 })
const currentPage = computed(() => servicesStore.page)
const itemsPerPage = computed(() => servicesStore.perPage)
const serviceHeaders = computed<DataTableHeader[]>(() => ([
  { title: 'Название', key: 'name', sortable: false },
  { title: 'Проект', key: 'project', sortable: false, width: 180 },
  { title: 'Модель', key: 'model', sortable: false, width: 180 },
  { title: 'Endpoint', key: 'endpoint', sortable: false, width: 210 },
  { title: 'Версия', key: 'version', sortable: false, width: 110 },
  { title: 'Статус', key: 'status', sortable: false, width: 140 },
  { title: 'RPS', key: 'rps', sortable: false, width: 90 },
  { title: 'P95', key: 'latencyP95', sortable: false, width: 100 },
  { title: 'Ошибки', key: 'errorRate', sortable: false, width: 90 },
  { title: '', key: 'actions', sortable: false, width: 56, align: 'end' },
]))

function statusIcon(s: ServiceStatus) { return s === 'running' ? CheckCircle : s === 'stopped' ? MinusCircle : XCircle }
function statusIconColor(s: ServiceStatus) { return s === 'running' ? 'text-green-600' : s === 'stopped' ? 'text-gray-400' : 'text-red-600' }
function statusText(s: ServiceStatus) { return s === 'running' ? 'Работает' : s === 'stopped' ? 'Остановлен' : 'Ошибка' }
function latencyColor(l: number) { if (l === 0) return 'text-gray-400'; if (l < 200) return 'text-green-600'; if (l < 500) return 'text-yellow-600'; return 'text-red-600' }

watch([searchTerm, statusFilter, projectFilter], () => {
  servicesStore.fetchServices({ search: searchTerm.value, status: statusFilter.value, project: projectFilter.value, page: 1 })
})

const uniqueProjects = computed(() => servicesStore.uniqueProjects)
const statusOptions = [
  { label: 'Все статусы', value: 'all' },
  { label: 'Работает', value: 'running' },
  { label: 'Остановлен', value: 'stopped' },
  { label: 'Ошибка', value: 'error' },
]
const projectOptions = computed(() => [{ label: 'Все проекты', value: 'all' }, ...uniqueProjects.value.map(project => ({ label: project, value: project }))])

function onTableOptionsUpdate(options: DataTableOptions) {
  servicesStore.fetchServices({
    search: searchTerm.value,
    status: statusFilter.value,
    project: projectFilter.value,
    page: options.page,
    perPage: options.itemsPerPage,
  })
}

function goToMonitoring(serviceId: number, serviceName: string) {
  router.push({ name: 'inference-service-metrics', params: { serviceId }, query: { serviceName } })
}
</script>
