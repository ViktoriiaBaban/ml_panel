<template>
  <div class="flex-1 bg-[#F5F7FA] p-8">
    <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200">
        <button @click="$emit('back')" class="flex items-center gap-2 text-[#409EFF] hover:underline mb-4">
          <ArrowLeft class="w-4 h-4" />Назад к списку сервисов
        </button>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ serviceName }}</h2>
            <div class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><span class="text-gray-500">Статус:</span><span class="ml-2 inline-flex items-center gap-1"><CheckCircle class="w-4 h-4 text-green-500" /><span class="text-gray-900 font-medium">Работает</span></span></div>
              <div><span class="text-gray-500">Endpoint:</span><span class="ml-2 text-gray-900">http://bento-fraud:3000/predict</span></div>
              <div><span class="text-gray-500">Версия образа:</span><span class="ml-2 text-gray-900">fraud-detection:20260114-1430</span></div>
              <div><span class="text-gray-500">Связанная модель:</span><span class="ml-2 text-[#409EFF] hover:underline cursor-pointer">run-abc123</span></div>
              <div><span class="text-gray-500">Проект:</span><span class="ml-2 text-[#409EFF] hover:underline cursor-pointer">ml-team/fraud</span></div>
              <div><span class="text-gray-500">Контейнер ID:</span><span class="ml-2 text-gray-900 font-mono text-xs">a1b2c3d4e5f6</span></div>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"><Play class="w-4 h-4" />Запустить</button>
            <button class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2"><Square class="w-4 h-4" />Остановить</button>
            <button class="px-4 py-2 bg-[#409EFF] text-white rounded hover:bg-[#3a8eef] transition-colors flex items-center gap-2"><RotateCw class="w-4 h-4" />Перезапустить</button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <div class="flex gap-8 px-6">
          <button v-for="tab in ['metrics','logs','model','integrations']" :key="tab" @click="activeTab = tab"
            :class="['py-4 text-sm font-medium transition-colors relative', activeTab === tab ? 'text-[#409EFF]' : 'text-gray-600 hover:text-gray-900']">
            {{ tabLabel(tab) }}
            <div v-if="activeTab === tab" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#409EFF]"></div>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Metrics Tab -->
        <div v-if="activeTab === 'metrics'" class="space-y-8">
          <div v-for="chart in charts" :key="chart.title">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ chart.title }}</h3>
            <div class="border border-gray-200 rounded-lg p-4 h-64 flex items-end gap-1">
              <div v-for="(bar, i) in chart.data" :key="i" class="flex-1 flex flex-col items-center gap-1">
                <div :style="{ height: `${bar.pct}%` }" :class="chart.color" class="w-full rounded-t transition-all"></div>
              </div>
            </div>
          </div>

          <!-- Recent Calls -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Последние 10 вызовов</h3>
            <div class="overflow-x-auto border border-gray-200 rounded-lg">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Время</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latency</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="call in recentCalls" :key="call.id">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ call.time }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span :class="call.latency < 200 ? 'text-green-600' : call.latency < 500 ? 'text-yellow-600' : 'text-red-600'" class="font-medium">{{ call.latency }} ms</span>
                    </td>
                    <td class="px-4 py-3 text-sm">
                      <span :class="call.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 text-xs font-medium rounded">
                        {{ call.status === 'success' ? 'SUCCESS' : 'ERROR' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <Info class="w-4 h-4 flex-shrink-0" />
            <span>Все графики обновляются автоматически каждые 30 секунд</span>
          </div>
        </div>

        <!-- Logs Tab -->
        <div v-if="activeTab === 'logs'" class="space-y-4">
          <div class="flex gap-4">
            <div class="flex-1">
              <input type="text" placeholder="Поиск по ключевым словам (error, timeout)…" v-model="logSearch"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF]" />
            </div>
            <select v-model="logFilter" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF]">
              <option value="all">Все уровни</option>
              <option value="error">ERROR</option>
              <option value="warning">WARNING</option>
              <option value="info">INFO</option>
            </select>
            <button class="px-4 py-2 bg-[#409EFF] text-white rounded-lg hover:bg-[#3a8eef] transition-colors flex items-center gap-2">
              <Download class="w-4 h-4" />Экспортировать
            </button>
          </div>
          <div class="border border-gray-200 rounded-lg bg-gray-50 p-4 max-h-96 overflow-y-auto font-mono text-sm space-y-2">
            <div v-for="log in filteredLogs" :key="log.id" class="flex gap-3 items-start">
              <span class="text-gray-500 text-xs whitespace-nowrap">{{ log.timestamp }}</span>
              <span :class="levelBadgeClass(log.level)" class="px-2 py-1 text-xs font-medium rounded">{{ log.level }}</span>
              <span class="text-gray-900 flex-1">{{ log.message }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <Info class="w-4 h-4 flex-shrink-0" />
            <span>Логи берутся из Docker-контейнера (последние 1000 строк)</span>
          </div>
        </div>

        <!-- Model Tab -->
        <div v-if="activeTab === 'model'" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Информация о модели</h3>
            <div class="space-y-3">
              <div class="flex"><span class="text-gray-500 w-48">Ссылка на MLflow run:</span><span class="text-[#409EFF] hover:underline cursor-pointer">run-abc123</span></div>
              <div class="flex"><span class="text-gray-500 w-48">Дата обучения:</span><span class="text-gray-900">2026-01-10 15:30:00</span></div>
              <div class="flex"><span class="text-gray-500 w-48">Версия модели:</span><span class="text-gray-900">v2.3</span></div>
            </div>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Параметры модели</h3>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm space-y-1">
              <div>learning_rate: <span class="text-[#409EFF]">0.001</span></div>
              <div>batch_size: <span class="text-[#409EFF]">32</span></div>
              <div>epochs: <span class="text-[#409EFF]">100</span></div>
              <div>optimizer: <span class="text-[#409EFF]">"adam"</span></div>
              <div>model_type: <span class="text-[#409EFF]">"gradient_boosting"</span></div>
            </div>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Метрики обучения</h3>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm space-y-1">
              <div>final_accuracy: <span class="text-green-600">0.94</span></div>
              <div>val_loss: <span class="text-green-600">0.12</span></div>
              <div>precision: <span class="text-green-600">0.92</span></div>
              <div>recall: <span class="text-green-600">0.95</span></div>
              <div>f1_score: <span class="text-green-600">0.935</span></div>
            </div>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Артефакты</h3>
            <div class="space-y-2">
              <div v-for="artifact in ['model.pkl','report.pdf','confusion_matrix.png']" :key="artifact"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <span class="text-sm text-gray-900">{{ artifact }}</span>
                <button class="text-[#409EFF] hover:underline text-sm">Скачать</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Integrations Tab -->
        <div v-if="activeTab === 'integrations'" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Используется в NiFi</h3>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-3">
              <div class="flex"><span class="text-gray-500 w-48">Flow:</span><span class="text-[#409EFF] hover:underline cursor-pointer">fraud-inference-pipeline</span></div>
              <div class="flex"><span class="text-gray-500 w-48">Последний вызов:</span><span class="text-gray-900">2026-01-15 10:23:45</span></div>
              <div class="flex"><span class="text-gray-500 w-48">Средний payload size:</span><span class="text-gray-900">1.2 KB</span></div>
              <div class="flex"><span class="text-gray-500 w-48">Всего вызовов (24ч):</span><span class="text-gray-900">2,340</span></div>
            </div>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Связанные системы</h3>
            <div class="space-y-2">
              <div v-for="sys in relatedSystems" :key="sys.name"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <component :is="sys.icon" class="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ sys.name }}</div>
                    <div class="text-xs text-gray-500">{{ sys.desc }}</div>
                  </div>
                </div>
                <button class="text-[#409EFF] hover:underline text-sm">Перейти</button>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <Info class="w-4 h-4 flex-shrink-0" />
            <span>Информация берётся из логов NiFi и тегов в BentoML-сервисе</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, Play, Square, RotateCw, Download, CheckCircle, Info, RefreshCw, Database, FlaskConical } from 'lucide-vue-next'

defineProps<{ serviceName: string }>()
defineEmits<{ back: [] }>()

const activeTab = ref('metrics')
const logFilter = ref('all')
const logSearch = ref('')

function tabLabel(t: string) {
  return { metrics: 'Метрики', logs: 'Логи', model: 'Модель', integrations: 'Интеграции' }[t] ?? t
}

const charts = [
  { title: 'Latency (p50, p95)', color: 'bg-[#409EFF]', data: Array.from({ length: 24 }, () => ({ pct: 20 + Math.random() * 60 })) },
  { title: 'Throughput (RPS)', color: 'bg-purple-500', data: Array.from({ length: 24 }, () => ({ pct: 30 + Math.random() * 50 })) },
  { title: 'Error Rate (%)', color: 'bg-red-400', data: Array.from({ length: 24 }, () => ({ pct: Math.random() * 15 })) },
]

const recentCalls = [
  { id: 1, time: '2026-01-15 14:23:45', latency: 124, status: 'success' },
  { id: 2, time: '2026-01-15 14:23:43', latency: 98, status: 'success' },
  { id: 3, time: '2026-01-15 14:23:41', latency: 156, status: 'success' },
  { id: 4, time: '2026-01-15 14:23:39', latency: 203, status: 'success' },
  { id: 5, time: '2026-01-15 14:23:37', latency: 87, status: 'success' },
  { id: 6, time: '2026-01-15 14:23:35', latency: 312, status: 'error' },
  { id: 7, time: '2026-01-15 14:23:33', latency: 142, status: 'success' },
  { id: 8, time: '2026-01-15 14:23:31', latency: 95, status: 'success' },
  { id: 9, time: '2026-01-15 14:23:29', latency: 178, status: 'success' },
  { id: 10, time: '2026-01-15 14:23:27', latency: 134, status: 'success' },
]

const mockLogs = [
  { id: 1, timestamp: '2026-01-15 14:23:45', level: 'INFO', message: 'Prediction request processed successfully' },
  { id: 2, timestamp: '2026-01-15 14:23:40', level: 'INFO', message: 'Model inference completed in 124ms' },
  { id: 3, timestamp: '2026-01-15 14:23:35', level: 'ERROR', message: 'Timeout while processing request: connection pool exhausted' },
  { id: 4, timestamp: '2026-01-15 14:23:30', level: 'WARNING', message: 'High memory usage detected: 85%' },
  { id: 5, timestamp: '2026-01-15 14:23:25', level: 'INFO', message: 'Batch prediction started for 128 items' },
  { id: 6, timestamp: '2026-01-15 14:23:20', level: 'INFO', message: 'Health check passed' },
  { id: 7, timestamp: '2026-01-15 14:23:15', level: 'ERROR', message: 'Failed to deserialize input payload' },
  { id: 8, timestamp: '2026-01-15 14:23:10', level: 'INFO', message: 'Prediction request processed successfully' },
]

const relatedSystems = [
  { icon: RefreshCw, name: 'NiFi Flow: fraud-inference-pipeline', desc: 'Вызывает сервис для real-time инференса' },
  { icon: Database, name: 'Octopus: fraud_labels', desc: 'Сохранение результатов инференса' },
  { icon: FlaskConical, name: 'MLflow: run-abc123', desc: 'Исходная модель из эксперимента' },
]

function levelBadgeClass(level: string) {
  return { ERROR: 'bg-red-100 text-red-800', WARNING: 'bg-yellow-100 text-yellow-800', INFO: 'bg-blue-100 text-blue-800' }[level] ?? 'bg-gray-100 text-gray-800'
}

const filteredLogs = computed(() => mockLogs.filter(log => {
  const matchFilter = logFilter.value === 'all' || log.level.toLowerCase() === logFilter.value.toLowerCase()
  const matchSearch = logSearch.value === '' || log.message.toLowerCase().includes(logSearch.value.toLowerCase()) || log.level.toLowerCase().includes(logSearch.value.toLowerCase())
  return matchFilter && matchSearch
}))
</script>
