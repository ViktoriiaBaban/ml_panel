import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api, ApiError } from '@/api/api'
import { useNotificationsStore } from '@/stores/notifications'

export type MonitoringMetric = {
  label: string
  value: string
  sub: string
  trend: 'up' | 'down'
}

export type MonitoringServiceUptime = { name: string; status: number }

export type AlertState = 'firing' | 'ok' | 'pending'
export type AlertSeverity = 'critical' | 'warning' | 'info'
export type Alert = {
  id: number
  name: string
  status: string
  state: AlertState
  severity: AlertSeverity
  lastChanged: string
  description: string
}

export const useMonitoringStore = defineStore('monitoring', () => {
  const keyMetrics = ref<MonitoringMetric[]>([])
  const servicesStatus = ref<MonitoringServiceUptime[]>([])
  const alerts = ref<Alert[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const alertSearch = ref('')
  const knownAlertStates = ref<Record<number, AlertState>>({})

  const fetchOverview = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await api.get<{ keyMetrics: MonitoringMetric[]; servicesStatus: MonitoringServiceUptime[] }>('/monitoring/overview')
      keyMetrics.value = res.keyMetrics
      servicesStatus.value = res.servicesStatus
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не удалось загрузить мониторинг'
    } finally {
      loading.value = false
    }
  }

  const fetchAlerts = async (search?: string) => {
    const q = search ?? alertSearch.value
    alertSearch.value = q
    try {
      const params = new URLSearchParams()
      params.set('search', q)
      const incoming = await api.get<Alert[]>(`/monitoring/alerts?${params.toString()}`)
      const notificationsStore = useNotificationsStore()
      incoming.forEach((alert) => {
        const prev = knownAlertStates.value[alert.id]
        if (prev !== alert.state) {
          if (alert.state === 'firing') {
            notificationsStore.push({
              source: 'monitoring',
              severity: alert.severity === 'critical' ? 'error' : 'warning',
              title: `Сработал алерт: ${alert.name}`,
              message: alert.description,
              details: `Состояние: ${alert.state}. Последнее изменение: ${alert.lastChanged}`,
            })
          }
          if (prev === 'firing' && alert.state === 'ok') {
            notificationsStore.push({
              source: 'monitoring',
              severity: 'success',
              title: `Алерт восстановлен: ${alert.name}`,
              message: 'Состояние вернулось в OK.',
            })
          }
        }
        knownAlertStates.value[alert.id] = alert.state
      })
      alerts.value = incoming
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не удалось загрузить алерты'
    }
  }

  return { keyMetrics, servicesStatus, alerts, loading, error, alertSearch, fetchOverview, fetchAlerts }
})
