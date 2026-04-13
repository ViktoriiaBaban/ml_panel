<template>
  <v-container fluid class="pa-0">
  <div class="flex-1 bg-[#F5F7FA] p-6">
    <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] max-w-[1360px] mx-auto">
      <!-- Filters -->
      <div class="p-4 border-b border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-[minmax(280px,1fr)_180px_220px] gap-3 items-center">
          <div class="relative min-w-0">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <v-text-field type="text" placeholder="Поиск по названию, проекту или модели…" v-model="searchTerm"
              class="w-full pl-10" variant="outlined" density="compact" hide-details />
          </div>
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
            class="min-w-0"
          />
          <v-select
            v-model="projectFilter"
            :items="projectOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
            class="min-w-0"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full table-fixed">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th v-for="h in serviceHeaders" :key="h"
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ h }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="service in filteredServices" :key="service.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 whitespace-nowrap">
                <button @click="goToMonitoring(service.id, service.name)"
                  class="flex items-center gap-2 text-sm text-gray-700 hover:text-[#409EFF] transition-colors">
                  <Bot class="w-4 h-4 flex-shrink-0" />
                  <span class="font-medium truncate">{{ service.name }}</span>
                </button>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 truncate">{{ service.project }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700 truncate">
                <span>{{ service.model }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 truncate">{{ service.endpoint }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ service.version }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <component :is="statusIcon(service.status)" :class="statusIconColor(service.status)" class="w-4 h-4" />
                  <span class="text-sm text-gray-900">{{ statusText(service.status) }}</span>
                </div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{{ service.rps > 0 ? service.rps.toFixed(1) : '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="['text-sm font-medium', latencyColor(service.latencyP95)]">
                  {{ service.latencyP95 > 0 ? `${service.latencyP95} ms` : '—' }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {{ service.status === 'running' ? `${service.errorRate.toFixed(1)}%` : '—' }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-right">
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
                    <v-list-item :disabled="service.status === 'running'" title="Запустить">
                      <template #prepend>
                        <Play class="w-4 h-4 text-green-600" />
                      </template>
                    </v-list-item>
                    <v-list-item :disabled="service.status === 'stopped'" title="Остановить">
                      <template #prepend>
                        <Square class="w-4 h-4 text-red-600" />
                      </template>
                    </v-list-item>
                    <v-list-item :disabled="service.status === 'stopped'" title="Перезапустить">
                      <template #prepend>
                        <RotateCw class="w-4 h-4 text-[#409EFF]" />
                      </template>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-4 py-3 border-t border-gray-200">
        <div class="text-sm text-gray-600">Показано {{ filteredServices.length }} сервисов</div>
      </div>
    </div>
  </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Play, Square, RotateCw, Bot, CheckCircle, XCircle, MinusCircle, MoreHorizontal } from 'lucide-vue-next'
import { useInferenceServicesStore, type ServiceStatus } from '@/stores/inferenceServices'

const router = useRouter()

const searchTerm = ref('')
const statusFilter = ref('all')
const projectFilter = ref('all')

const servicesStore = useInferenceServicesStore()
servicesStore.fetchServices({ search: '', status: 'all', project: 'all' })
const serviceHeaders = ['Название', 'Проект', 'Модель', 'Endpoint', 'Версия', 'Статус', 'RPS', 'P95', 'Ошибки', '']

function statusIcon(s: ServiceStatus) { return s === 'running' ? CheckCircle : s === 'stopped' ? MinusCircle : XCircle }
function statusIconColor(s: ServiceStatus) { return s === 'running' ? 'text-green-600' : s === 'stopped' ? 'text-gray-400' : 'text-red-600' }
function statusText(s: ServiceStatus) { return s === 'running' ? 'Работает' : s === 'stopped' ? 'Остановлен' : 'Ошибка' }
function latencyColor(l: number) { if (l === 0) return 'text-gray-400'; if (l < 200) return 'text-green-600'; if (l < 500) return 'text-yellow-600'; return 'text-red-600' }

watch([searchTerm, statusFilter, projectFilter], () => {
  servicesStore.fetchServices({ search: searchTerm.value, status: statusFilter.value, project: projectFilter.value })
})

const uniqueProjects = computed(() => servicesStore.uniqueProjects)
const statusOptions = [
  { label: 'Все статусы', value: 'all' },
  { label: 'Работает', value: 'running' },
  { label: 'Остановлен', value: 'stopped' },
  { label: 'Ошибка', value: 'error' },
]
const projectOptions = computed(() => [{ label: 'Все проекты', value: 'all' }, ...uniqueProjects.value.map(project => ({ label: project, value: project }))])
const filteredServices = computed(() => servicesStore.items)

function goToMonitoring(serviceId: number, serviceName: string) {
  router.push({ name: 'inference-service-metrics', params: { serviceId }, query: { serviceName } })
}
</script>
