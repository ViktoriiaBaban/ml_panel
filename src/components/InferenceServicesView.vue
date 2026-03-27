<template>
  <v-container fluid class="pa-0">
  <div class="flex-1 bg-[#F5F7FA] p-8">
    <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <!-- Filters -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <v-text-field type="text" placeholder="Поиск по названию, проекту или модели…" v-model="searchTerm"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF] focus:border-transparent"  variant="outlined" density="comfortable" hide-details />
          </div>
          <v-select v-model="statusFilter" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF]">
            <option value="all">Все статусы</option>
            <option value="running">Работает</option>
            <option value="stopped">Остановлен</option>
            <option value="error">Ошибка</option>
          </v-select>
          <v-select v-model="projectFilter" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF]">
            <option value="all">Все проекты</option>
            <option v-for="project in uniqueProjects" :key="project" :value="project">{{ project }}</option>
          </v-select>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th v-for="h in ['Название','Проект','Модель','Endpoint','Версия','Статус','RPS','Latency (p95)','Ошибки (%)','Действия']" :key="h"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ h }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="service in filteredServices" :key="service.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <v-btn @click="$emit('navigate-to-monitoring', service.id, service.name)"
                  class="flex items-center gap-2 text-[#409EFF] hover:underline">
                  <Bot class="w-4 h-4 flex-shrink-0" />
                  <span class="text-sm font-medium">{{ service.name }}</span>
                </v-btn>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ service.project }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-[#409EFF] hover:underline cursor-pointer">{{ service.model }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">{{ service.endpoint }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">{{ service.version }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <component :is="statusIcon(service.status)" :class="statusIconColor(service.status)" class="w-4 h-4" />
                  <span class="text-sm text-gray-900">{{ statusText(service.status) }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ service.rps > 0 ? service.rps.toFixed(1) : '—' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['text-sm font-medium', latencyColor(service.latencyP95)]">
                  {{ service.latencyP95 > 0 ? `${service.latencyP95} ms` : '—' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ service.status === 'running' ? `${service.errorRate.toFixed(1)}%` : '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <v-btn :disabled="service.status === 'running'" class="p-1.5 hover:bg-green-50 rounded transition-colors disabled:opacity-50" title="Запустить">
                    <Play class="w-4 h-4 text-green-600" />
                  </v-btn>
                  <v-btn :disabled="service.status === 'stopped'" class="p-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-50" title="Остановить">
                    <Square class="w-4 h-4 text-red-600" />
                  </v-btn>
                  <v-btn :disabled="service.status === 'stopped'" class="p-1.5 hover:bg-blue-50 rounded transition-colors disabled:opacity-50" title="Перезапустить">
                    <RotateCw class="w-4 h-4 text-[#409EFF]" />
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-6 py-4 border-t border-gray-200">
        <div class="text-sm text-gray-600">Показано {{ filteredServices.length }} из {{ mockServices.length }} сервисов</div>
      </div>
    </div>
  </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Play, Square, RotateCw, Bot, CheckCircle, XCircle, MinusCircle } from 'lucide-vue-next'

defineEmits<{ 'navigate-to-monitoring': [id: number, name: string] }>()

type ServiceStatus = 'running' | 'stopped' | 'error'

interface InferenceService {
  id: number; name: string; project: string; model: string; endpoint: string; version: string
  status: ServiceStatus; rps: number; latencyP95: number; errorRate: number
}

const searchTerm = ref('')
const statusFilter = ref('all')
const projectFilter = ref('all')

const mockServices: InferenceService[] = [
  { id: 1, name: 'fraud-detection-v3', project: 'ml-team/fraud', model: 'run-abc123', endpoint: 'http://bento-fraud:3000/predict', version: 'fraud-detection:20260114-1430', status: 'running', rps: 24.3, latencyP95: 127, errorRate: 0.2 },
  { id: 2, name: 'recommendation-engine', project: 'ml-team/recommendations', model: 'run-xyz789', endpoint: 'http://bento-rec:3000/recommend', version: 'recommendation-engine:20260113-0920', status: 'running', rps: 45.7, latencyP95: 89, errorRate: 0.1 },
  { id: 3, name: 'sentiment-analyzer', project: 'nlp-team/sentiment', model: 'run-def456', endpoint: 'http://bento-sentiment:3000/analyze', version: 'sentiment-analyzer:20260112-1615', status: 'stopped', rps: 0, latencyP95: 0, errorRate: 0 },
  { id: 4, name: 'image-classifier-v2', project: 'cv-team/classification', model: 'run-ghi321', endpoint: 'http://bento-img:3000/classify', version: 'image-classifier:20260111-1045', status: 'error', rps: 0, latencyP95: 0, errorRate: 100 },
  { id: 5, name: 'churn-predictor', project: 'ml-team/churn', model: 'run-jkl654', endpoint: 'http://bento-churn:3000/predict', version: 'churn-predictor:20260110-1330', status: 'running', rps: 12.5, latencyP95: 156, errorRate: 0.3 },
  { id: 6, name: 'price-optimizer', project: 'ml-team/pricing', model: 'run-mno987', endpoint: 'http://bento-price:3000/optimize', version: 'price-optimizer:20260109-1720', status: 'running', rps: 8.9, latencyP95: 203, errorRate: 0.5 },
]

function statusIcon(s: ServiceStatus) { return s === 'running' ? CheckCircle : s === 'stopped' ? MinusCircle : XCircle }
function statusIconColor(s: ServiceStatus) { return s === 'running' ? 'text-green-600' : s === 'stopped' ? 'text-gray-400' : 'text-red-600' }
function statusText(s: ServiceStatus) { return s === 'running' ? 'Работает' : s === 'stopped' ? 'Остановлен' : 'Ошибка' }
function latencyColor(l: number) { if (l === 0) return 'text-gray-400'; if (l < 200) return 'text-green-600'; if (l < 500) return 'text-yellow-600'; return 'text-red-600' }

const uniqueProjects = computed(() => [...new Set(mockServices.map(s => s.project))])
const filteredServices = computed(() => mockServices.filter(s => {
  const matchSearch = s.name.toLowerCase().includes(searchTerm.value.toLowerCase()) || s.project.toLowerCase().includes(searchTerm.value.toLowerCase()) || s.model.toLowerCase().includes(searchTerm.value.toLowerCase())
  const matchStatus = statusFilter.value === 'all' || s.status === statusFilter.value
  const matchProject = projectFilter.value === 'all' || s.project === projectFilter.value
  return matchSearch && matchStatus && matchProject
}))
</script>
