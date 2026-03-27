<template>
  <div class="flex-1 bg-[#F5F7FA] p-8">
    <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <!-- Tabs + Filters -->
      <div class="border-b border-gray-200">
        <div class="flex items-center justify-between px-6 pt-4">
          <div class="flex gap-8">
            <button v-for="tab in ['dashboard','alerts']" :key="tab" @click="activeTab = tab"
              :class="['pb-4 text-sm font-medium transition-colors relative', activeTab === tab ? 'text-[#409EFF]' : 'text-gray-600 hover:text-gray-900']">
              {{ tab === 'dashboard' ? 'Дашборд' : 'Алерты' }}
              <div v-if="activeTab === tab" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#409EFF]"></div>
            </button>
          </div>
          <div v-if="activeTab === 'dashboard'" class="flex items-center gap-3 pb-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">Обновление:</span>
              <select v-model="refreshInterval" class="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#409EFF]">
                <option value="off">Выкл</option>
                <option value="10s">10 сек</option>
                <option value="30s">30 сек</option>
                <option value="1m">1 мин</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">Период:</span>
              <select v-model="timeRange" class="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#409EFF]">
                <option value="15m">15 мин</option>
                <option value="30m">30 мин</option>
                <option value="1h">1 час</option>
                <option value="3h">3 часа</option>
                <option value="6h">6 часов</option>
                <option value="24h">24 часа</option>
                <option value="7d">7 дней</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6">
        <!-- Dashboard Tab -->
        <div v-if="activeTab === 'dashboard'" class="space-y-6">
          <!-- Key Metrics -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div v-for="metric in keyMetrics" :key="metric.label"
              :class="['rounded-lg p-5 border', metric.bgClass]">
              <div class="flex items-center justify-between mb-3">
                <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', metric.iconBg]">
                  <component :is="metric.icon" class="w-5 h-5 text-white" />
                </div>
                <component :is="metric.trend === 'up' ? TrendingUp : TrendingDown" :class="['w-5 h-5', metric.trendColor]" />
              </div>
              <div class="text-2xl font-bold text-gray-900">{{ metric.value }}</div>
              <div class="text-sm text-gray-600 mt-1">{{ metric.label }}</div>
              <div class="text-xs text-gray-500 mt-2">{{ metric.sub }}</div>
            </div>
          </div>

          <!-- Charts Row 1 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="chart in chartRows[0]" :key="chart.title" class="bg-white border border-gray-200 rounded-lg p-5">
              <h3 class="text-base font-semibold text-gray-900 mb-4">{{ chart.title }}</h3>
              <div class="h-48 flex items-end gap-0.5">
                <div v-for="(bar, i) in chart.data" :key="i" class="flex-1 flex flex-col items-center">
                  <div :style="{ height: `${bar}%` }" :class="chart.color" class="w-full rounded-t"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Row 2 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="chart in chartRows[1]" :key="chart.title" class="bg-white border border-gray-200 rounded-lg p-5">
              <h3 class="text-base font-semibold text-gray-900 mb-4">{{ chart.title }}</h3>
              <div class="h-48 flex items-end gap-0.5">
                <div v-for="(bar, i) in chart.data" :key="i" class="flex-1">
                  <div :style="{ height: `${bar}%` }" :class="chart.color" class="w-full rounded-t"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Services Uptime -->
          <div class="bg-white border border-gray-200 rounded-lg p-5">
            <h3 class="text-base font-semibold text-gray-900 mb-4">Services Uptime (%)</h3>
            <div class="space-y-3">
              <div v-for="svc in servicesStatus" :key="svc.name" class="flex items-center gap-4">
                <span class="text-sm text-gray-700 w-32 flex-shrink-0">{{ svc.name }}</span>
                <div class="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div :style="{ width: `${svc.status}%` }" class="h-full bg-green-500 rounded-full transition-all"></div>
                </div>
                <span class="text-sm font-medium text-gray-900 w-12 text-right">{{ svc.status }}%</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 text-sm text-gray-500">
            <Info class="w-4 h-4 flex-shrink-0" />
            <span>Данные загружаются из Grafana в реальном времени</span>
          </div>
        </div>

        <!-- Alerts Tab -->
        <div v-if="activeTab === 'alerts'" class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="flex-1 relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Поиск по названию или описанию правила..." v-model="searchQuery"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF]" />
            </div>
            <button class="px-4 py-2 bg-[#409EFF] text-white rounded-lg hover:bg-[#3a8eef] transition-colors flex items-center gap-2">
              <Plus class="w-4 h-4" />Добавить правило
            </button>
          </div>

          <div class="overflow-x-auto border border-gray-200 rounded-lg">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th v-for="h in ['Название','Статус','Состояние','Критичность','Последнее изменение','Действия']" :key="h"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ h }}</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="alert in filteredAlerts" :key="alert.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{ alert.name }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ alert.description }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="alert.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'" class="px-2 py-1 text-xs font-medium rounded">
                      {{ alert.status === 'active' ? 'Активно' : 'Приостановлено' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="stateBadgeClass(alert.state)" class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded">
                      <component :is="stateIcon(alert.state)" class="w-3 h-3" />
                      {{ stateLabel(alert.state) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                      <component :is="severityIcon(alert.severity)" :class="severityColor(alert.severity)" class="w-4 h-4" />
                      <span :class="severityColor(alert.severity)" class="text-sm font-medium">
                        {{ { critical: 'Критично', warning: 'Предупреждение', info: 'Информация' }[alert.severity] }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ alert.lastChanged }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="relative">
                      <button @click="openMenuId = openMenuId === alert.id ? null : alert.id"
                        class="p-2 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical class="w-4 h-4 text-gray-600" />
                      </button>
                      <div v-if="openMenuId === alert.id" class="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Редактировать</button>
                        <button class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">{{ alert.status === 'active' ? 'Приостановить' : 'Активировать' }}</button>
                        <button class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">История срабатываний</button>
                        <hr class="my-1 border-gray-200" />
                        <button class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Удалить</button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500">Показано {{ filteredAlerts.length }} из {{ mockAlerts.length }} правил</p>
            <p class="text-sm text-gray-500">{{ filteredAlerts.filter(a => a.state === 'firing').length }} активных алертов</p>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
          <Info class="w-4 h-4 flex-shrink-0" />
          <span>Алерты синхронизируются с Grafana Alerting Manager</span>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Plus, MoreVertical, AlertTriangle, CheckCircle, XCircle, Activity, Cpu, HardDrive, Network, TrendingUp, TrendingDown, Info, AlertCircle } from 'lucide-vue-next'

const activeTab = ref('dashboard')
const refreshInterval = ref('30s')
const timeRange = ref('1h')
const searchQuery = ref('')
const openMenuId = ref<number | null>(null)

const keyMetrics = [
  { icon: Cpu, label: 'CPU Usage', value: '54.3%', sub: 'Avg across 8 nodes', trend: 'up', trendColor: 'text-blue-600', bgClass: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200', iconBg: 'bg-blue-600' },
  { icon: HardDrive, label: 'Memory Usage', value: '67.8%', sub: '42.3 GB / 64 GB', trend: 'down', trendColor: 'text-green-600', bgClass: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200', iconBg: 'bg-green-600' },
  { icon: Network, label: 'Network Traffic', value: '85.4 MB/s', sub: 'In: 52.3 / Out: 33.1', trend: 'up', trendColor: 'text-purple-600', bgClass: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200', iconBg: 'bg-purple-600' },
  { icon: Activity, label: 'Requests/sec', value: '1,247', sub: 'Peak: 1,580 req/s', trend: 'up', trendColor: 'text-orange-600', bgClass: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200', iconBg: 'bg-orange-600' },
]

const chartRows = [
  [
    { title: 'CPU Usage (%)', color: 'bg-blue-400', data: Array.from({ length: 30 }, () => 30 + Math.random() * 50) },
    { title: 'Memory Usage (GB)', color: 'bg-green-400', data: Array.from({ length: 30 }, () => 50 + Math.random() * 40) },
  ],
  [
    { title: 'Network Traffic (MB/s)', color: 'bg-purple-400', data: Array.from({ length: 24 }, () => 30 + Math.random() * 60) },
    { title: 'Requests per Second', color: 'bg-orange-400', data: Array.from({ length: 24 }, () => 40 + Math.random() * 50) },
  ],
]

const servicesStatus = [
  { name: 'PostgreSQL', status: 95 },
  { name: 'NiFi', status: 98 },
  { name: 'Kafka', status: 92 },
  { name: 'BentoML', status: 88 },
  { name: 'MLflow', status: 96 },
]

type AlertState = 'firing' | 'ok' | 'pending'
type AlertSeverity = 'critical' | 'warning' | 'info'
interface Alert { id: number; name: string; status: string; state: AlertState; severity: AlertSeverity; lastChanged: string; description: string }

const mockAlerts: Alert[] = [
  { id: 1, name: 'High CPU Usage', status: 'active', state: 'firing', severity: 'critical', lastChanged: '2026-03-25 14:15:30', description: 'CPU usage > 80% for 5 minutes' },
  { id: 2, name: 'Memory Usage Warning', status: 'active', state: 'ok', severity: 'warning', lastChanged: '2026-03-25 13:45:12', description: 'Memory usage > 75%' },
  { id: 3, name: 'Service Down Alert', status: 'active', state: 'firing', severity: 'critical', lastChanged: '2026-03-25 14:20:45', description: 'Service not responding for 1 minute' },
  { id: 4, name: 'Disk Space Low', status: 'active', state: 'pending', severity: 'warning', lastChanged: '2026-03-25 12:30:00', description: 'Disk usage > 85%' },
  { id: 5, name: 'High Error Rate', status: 'active', state: 'ok', severity: 'warning', lastChanged: '2026-03-25 11:15:23', description: 'Error rate > 5% for 10 minutes' },
  { id: 6, name: 'Database Connection Pool', status: 'paused', state: 'ok', severity: 'info', lastChanged: '2026-03-24 18:20:15', description: 'Connection pool usage > 90%' },
  { id: 7, name: 'Kafka Lag Alert', status: 'active', state: 'firing', severity: 'warning', lastChanged: '2026-03-25 14:18:20', description: 'Consumer lag > 10000 messages' },
  { id: 8, name: 'Model Inference Latency', status: 'active', state: 'ok', severity: 'info', lastChanged: '2026-03-25 10:05:40', description: 'P95 latency > 500ms' },
]

function stateBadgeClass(state: AlertState) {
  return { firing: 'bg-red-100 text-red-800', ok: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800' }[state]
}
function stateIcon(state: AlertState) { return { firing: XCircle, ok: CheckCircle, pending: AlertTriangle }[state] }
function stateLabel(state: AlertState) { return { firing: 'Активен', ok: 'OK', pending: 'Ожидание' }[state] }
function severityColor(s: AlertSeverity) { return { critical: 'text-red-600', warning: 'text-yellow-600', info: 'text-blue-600' }[s] }
function severityIcon(s: AlertSeverity) { return { critical: XCircle, warning: AlertTriangle, info: AlertCircle }[s] }

const filteredAlerts = computed(() => mockAlerts.filter(a =>
  searchQuery.value === '' ||
  a.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
  a.description.toLowerCase().includes(searchQuery.value.toLowerCase())
))
</script>
