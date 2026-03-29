<template>
  <v-container fluid class="pa-0">
  <div class="flex-1 bg-[#F5F7FA] p-8">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><Activity class="w-6 h-6 text-green-600" /></div>
          <div><div class="text-gray-500 text-sm">Активные потоки</div><div class="text-2xl font-semibold text-gray-900">{{ stats.running }}</div></div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><Square class="w-6 h-6 text-gray-600" /></div>
          <div><div class="text-gray-500 text-sm">Остановленные</div><div class="text-2xl font-semibold text-gray-900">{{ stats.stopped }}</div></div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"><AlertTriangle class="w-6 h-6 text-red-600" /></div>
          <div><div class="text-gray-500 text-sm">С ошибками</div><div class="text-2xl font-semibold text-gray-900">{{ stats.error }}</div></div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Потоки данных (NiFi Flows)</h2>
        <div class="flex items-center gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <v-text-field type="text" placeholder="Поиск по названию потока..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF]"  variant="outlined" density="comfortable" hide-details />
          </div>
          <v-btn class="px-4 py-2 bg-[#409EFF] text-white rounded-lg hover:bg-[#3a8eef] transition-colors flex items-center gap-2">
            <RotateCw class="w-4 h-4" />Обновить
          </v-btn>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th v-for="h in ['Название потока','Статус','Группы процессов','Активные потоки','В очереди','Throughput','Обновлено','Действия']" :key="h"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ h }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="flow in mockFlows" :key="flow.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <v-btn @click="$emit('navigate-to-detail', flow.id, flow.name)"
                  class="text-[#409EFF] hover:underline font-medium">{{ flow.name }}</v-btn>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded', statusBadgeClass(flow.status)]">
                  <component :is="statusIcon(flow.status)" class="w-3 h-3" />
                  {{ statusText(flow.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.processGroups }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.activeThreads }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['text-sm font-medium', flow.queuedItems > 800 ? 'text-red-600' : flow.queuedItems > 500 ? 'text-yellow-600' : 'text-gray-900']">
                  {{ flow.queuedItems.toLocaleString() }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-1">
                  <TrendingUp class="w-4 h-4 text-green-600" />
                  <span class="text-sm font-medium text-gray-900">{{ flow.throughput.toLocaleString() }} items/s</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ flow.lastUpdated }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <v-btn v-if="flow.status === 'running'" class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Остановить">
                    <Square class="w-4 h-4" />
                  </v-btn>
                  <v-btn v-else class="p-2 text-green-600 hover:bg-green-50 rounded transition-colors" title="Запустить">
                    <Play class="w-4 h-4" />
                  </v-btn>
                  <v-btn class="p-2 text-[#409EFF] hover:bg-blue-50 rounded transition-colors" title="Перезапустить">
                    <RotateCw class="w-4 h-4" />
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <p class="text-sm text-gray-500">Показано {{ mockFlows.length }} потоков данных</p>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw class="w-3.5 h-3.5" />
          <span>Данные обновляются каждые 10 секунд</span>
        </div>
      </div>
    </div>
  </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Search, Play, Square, RotateCw, Activity, TrendingUp, AlertTriangle, CheckCircle, XCircle, MinusCircle, RefreshCw } from 'lucide-vue-next'

defineEmits<{ 'navigate-to-detail': [id: number, name: string] }>()

type FlowStatus = 'running' | 'stopped' | 'error'

interface Flow {
  id: number; name: string; status: FlowStatus; processGroups: number
  activeThreads: number; queuedItems: number; throughput: number; lastUpdated: string
}

const mockFlows: Flow[] = [
  { id: 1, name: 'fraud-inference-pipeline', status: 'running', processGroups: 12, activeThreads: 8, queuedItems: 234, throughput: 1240, lastUpdated: '2026-03-25 14:23:45' },
  { id: 2, name: 'data-ingestion-kafka', status: 'running', processGroups: 8, activeThreads: 5, queuedItems: 567, throughput: 2340, lastUpdated: '2026-03-25 14:23:40' },
  { id: 3, name: 'model-training-etl', status: 'stopped', processGroups: 15, activeThreads: 0, queuedItems: 0, throughput: 0, lastUpdated: '2026-03-25 12:10:23' },
  { id: 4, name: 'feature-extraction-pipeline', status: 'running', processGroups: 10, activeThreads: 6, queuedItems: 128, throughput: 890, lastUpdated: '2026-03-25 14:23:38' },
  { id: 5, name: 'data-validation-flow', status: 'error', processGroups: 6, activeThreads: 2, queuedItems: 1024, throughput: 45, lastUpdated: '2026-03-25 14:20:12' },
  { id: 6, name: 'realtime-aggregation', status: 'running', processGroups: 9, activeThreads: 7, queuedItems: 345, throughput: 1560, lastUpdated: '2026-03-25 14:23:42' },
]

function statusBadgeClass(s: FlowStatus) {
  return { running: 'bg-green-100 text-green-800', stopped: 'bg-gray-100 text-gray-800', error: 'bg-red-100 text-red-800' }[s]
}
function statusIcon(s: FlowStatus) { return { running: CheckCircle, stopped: MinusCircle, error: XCircle }[s] }
function statusText(s: FlowStatus) { return { running: 'Работает', stopped: 'Остановлен', error: 'Ошибка' }[s] }

const stats = computed(() => ({
  running: mockFlows.filter(f => f.status === 'running').length,
  stopped: mockFlows.filter(f => f.status === 'stopped').length,
  error: mockFlows.filter(f => f.status === 'error').length,
}))
</script>
