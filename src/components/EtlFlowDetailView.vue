<template>
  <div class="flex-1 bg-[#F5F7FA] p-8">
    <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200">
        <button @click="$emit('back')" class="flex items-center gap-2 text-[#409EFF] hover:underline mb-4">
          <ArrowLeft class="w-4 h-4" />Назад к списку потоков
        </button>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ flowName }}</h2>
            <div class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><span class="text-gray-500">Статус:</span><span class="ml-2 inline-flex items-center gap-1"><CheckCircle class="w-4 h-4 text-green-500" /><span class="text-gray-900 font-medium">Работает</span></span></div>
              <div><span class="text-gray-500">Группы процессов:</span><span class="ml-2 text-gray-900">12</span></div>
              <div><span class="text-gray-500">Активные потоки:</span><span class="ml-2 text-gray-900">8 / 10</span></div>
              <div><span class="text-gray-500">В очереди:</span><span class="ml-2 text-gray-900 font-medium">234 items</span></div>
              <div><span class="text-gray-500">Throughput:</span><span class="ml-2 text-green-600 font-medium">1,240 items/s</span></div>
              <div><span class="text-gray-500">Последнее обновление:</span><span class="ml-2 text-gray-900">2026-03-25 14:23:45</span></div>
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
          <button v-for="tab in ['metrics','variables','components','history']" :key="tab" @click="activeTab = tab"
            :class="['py-4 text-sm font-medium transition-colors relative', activeTab === tab ? 'text-[#409EFF]' : 'text-gray-600 hover:text-gray-900']">
            {{ { metrics: 'Метрики', variables: 'Переменные', components: 'Компоненты', history: 'История' }[tab] }}
            <div v-if="activeTab === tab" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#409EFF]"></div>
          </button>
        </div>
      </div>

      <div class="p-6">
        <!-- Metrics Tab -->
        <div v-if="activeTab === 'metrics'" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div v-for="stat in summaryStats" :key="stat.label" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <component :is="stat.icon" :class="['w-8 h-8', stat.color]" />
                <div>
                  <div class="text-gray-500 text-xs">{{ stat.label }}</div>
                  <div class="text-xl font-semibold text-gray-900">{{ stat.value }}</div>
                  <div class="text-gray-500 text-xs">{{ stat.unit }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-for="chart in charts" :key="chart.title">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ chart.title }}</h3>
            <div class="border border-gray-200 rounded-lg p-4 h-48 flex items-end gap-0.5">
              <div v-for="(bar, i) in chart.data" :key="i" class="flex-1 flex flex-col items-center">
                <div :style="{ height: `${bar}%` }" :class="chart.color" class="w-full rounded-t"></div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <Info class="w-4 h-4 flex-shrink-0" />
            <span>Все графики обновляются автоматически каждые 10 секунд</span>
          </div>
        </div>

        <!-- Variables Tab -->
        <div v-if="activeTab === 'variables'" class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Переменные потока</h3>
              <p class="text-sm text-gray-500">Настройки и параметры для {{ flowName }}</p>
            </div>
          </div>
          <div class="space-y-3">
            <div v-for="variable in mockVariables" :key="variable.key"
              class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div class="font-medium text-gray-900 mb-1">{{ variable.key }}</div>
              <div class="text-xs text-gray-500 mb-2">{{ variable.description }}</div>
              <div v-if="editingVariable !== variable.key" class="flex items-center gap-2">
                <code class="px-3 py-2 bg-gray-100 rounded font-mono text-sm text-gray-900 flex-1">{{ variableValues[variable.key] }}</code>
                <button @click="editingVariable = variable.key" class="px-3 py-2 text-[#409EFF] hover:bg-blue-50 rounded transition-colors text-sm font-medium">Изменить</button>
              </div>
              <div v-else class="flex items-center gap-2">
                <input type="text" v-model="variableValues[variable.key]"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#409EFF]" />
                <button @click="editingVariable = null" class="px-3 py-2 bg-[#409EFF] text-white rounded hover:bg-[#3a8eef] transition-colors flex items-center gap-1">
                  <Save class="w-4 h-4" />Сохранить
                </button>
                <button @click="variableValues[variable.key] = variable.value; editingVariable = null"
                  class="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center gap-1">
                  <X class="w-4 h-4" />Отмена
                </button>
              </div>
            </div>
          </div>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div class="text-sm text-yellow-800"><strong>Важно:</strong> Изменение переменных может потребовать перезапуска потока.</div>
          </div>
        </div>

        <!-- Components Tab -->
        <div v-if="activeTab === 'components'">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Компоненты потока</h3>
            <p class="text-sm text-gray-500">Процессоры и группы процессов в {{ flowName }}</p>
          </div>
          <div class="overflow-x-auto border border-gray-200 rounded-lg">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th v-for="h in ['Название','Тип','Статус','Активные потоки','Выполнено задач']" :key="h" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ h }}</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="c in mockComponents" :key="c.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ c.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">{{ c.type }}</td>
                  <td class="px-4 py-3 text-sm">
                    <span class="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                      <CheckCircle class="w-3 h-3" />{{ c.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ c.threadsActive }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ c.tasksCompleted.toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500 mt-4">
            <Info class="w-4 h-4 flex-shrink-0" />
            <span>Кликните на компонент для просмотра детальной информации</span>
          </div>
        </div>

        <!-- History Tab -->
        <div v-if="activeTab === 'history'">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-900">История действий</h3>
            <p class="text-sm text-gray-500">Последние изменения и события потока {{ flowName }}</p>
          </div>
          <div class="space-y-3">
            <div v-for="item in mockHistory" :key="item.id" class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-sm text-gray-500">{{ item.timestamp }}</span>
                <span :class="item.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-0.5 text-xs font-medium rounded">
                  {{ item.status === 'success' ? 'SUCCESS' : 'ERROR' }}
                </span>
              </div>
              <div class="text-sm text-gray-900 font-medium mb-1">{{ item.action }}</div>
              <div class="text-xs text-gray-500">Пользователь: {{ item.user }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500 mt-4">
            <Info class="w-4 h-4 flex-shrink-0" />
            <span>История хранится за последние 30 дней</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ArrowLeft, Play, Square, RotateCw, Save, X, AlertCircle, Activity, Database, Clock, Settings, CheckCircle, Info } from 'lucide-vue-next'

defineProps<{ flowName: string }>()
defineEmits<{ back: [] }>()

const activeTab = ref('metrics')
const editingVariable = ref<string | null>(null)

const mockVariables = [
  { key: 'kafka.topic', value: 'transactions', description: 'Топик Kafka для чтения данных' },
  { key: 'kafka.group.id', value: 'fraud-pipeline-consumer', description: 'Consumer group ID' },
  { key: 'api.endpoint', value: 'http://bento-fraud:3000/predict', description: 'Endpoint для инференса модели' },
  { key: 'api.timeout', value: '5000', description: 'Таймаут API в миллисекундах' },
  { key: 'batch.size', value: '100', description: 'Размер батча для обработки' },
  { key: 'octopus.table', value: 'fraud_labels', description: 'Таблица для сохранения результатов' },
  { key: 'octopus.connection', value: 'jdbc:postgresql://octopus:5432/ml_data', description: 'Connection string для Octopus' },
  { key: 'error.retry.count', value: '3', description: 'Количество повторных попыток при ошибке' },
]

const variableValues = reactive<Record<string, string>>(Object.fromEntries(mockVariables.map(v => [v.key, v.value])))

const summaryStats = [
  { icon: Activity, color: 'text-[#409EFF]', label: 'Throughput', value: '1,240', unit: 'items/sec' },
  { icon: Database, color: 'text-green-600', label: 'Data In/Out', value: '65.2 MB/s', unit: 'bytes/sec' },
  { icon: Clock, color: 'text-yellow-600', label: 'В очереди', value: '234', unit: 'items' },
  { icon: Settings, color: 'text-purple-600', label: 'Активные потоки', value: '8 / 10', unit: 'threads' },
]

const charts = [
  { title: 'Throughput (за последние 24 часа)', color: 'bg-[#409EFF]', data: Array.from({ length: 48 }, () => 30 + Math.random() * 60) },
  { title: 'Размер очереди', color: 'bg-yellow-400', data: Array.from({ length: 48 }, () => 20 + Math.random() * 50) },
  { title: 'Использование потоков', color: 'bg-purple-500', data: Array.from({ length: 48 }, () => 40 + Math.random() * 40) },
]

const mockComponents = [
  { id: 1, name: 'FetchKafka', type: 'Processor', status: 'running', threadsActive: 2, tasksCompleted: 12340 },
  { id: 2, name: 'ValidateJSON', type: 'Processor', status: 'running', threadsActive: 1, tasksCompleted: 12340 },
  { id: 3, name: 'RouteOnAttribute', type: 'Processor', status: 'running', threadsActive: 1, tasksCompleted: 12340 },
  { id: 4, name: 'InvokeHTTP', type: 'Processor', status: 'running', threadsActive: 3, tasksCompleted: 11280 },
  { id: 5, name: 'PutOctopus', type: 'Processor', status: 'running', threadsActive: 2, tasksCompleted: 11280 },
  { id: 6, name: 'ErrorHandling', type: 'Process Group', status: 'running', threadsActive: 1, tasksCompleted: 1060 },
]

const mockHistory = [
  { id: 1, timestamp: '2026-03-25 14:23:45', action: 'Flow started', user: 'Виктория', status: 'success' },
  { id: 2, timestamp: '2026-03-25 12:10:20', action: 'Flow stopped', user: 'Виктория', status: 'success' },
  { id: 3, timestamp: '2026-03-25 09:45:12', action: 'Variable updated: kafka.topic = "transactions"', user: 'Игорь', status: 'success' },
  { id: 4, timestamp: '2026-03-24 16:30:05', action: 'Flow configuration changed', user: 'Виктория', status: 'success' },
  { id: 5, timestamp: '2026-03-24 14:15:33', action: 'Flow error: Connection timeout', user: 'System', status: 'error' },
  { id: 6, timestamp: '2026-03-24 10:20:18', action: 'Flow started', user: 'Виктория', status: 'success' },
]
</script>
