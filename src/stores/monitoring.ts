import { defineStore } from 'pinia'
import { api, ApiError } from '@/api/api'

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

export const useMonitoringStore = defineStore('monitoring', {
  state: () => ({
    keyMetrics: [] as MonitoringMetric[],
    servicesStatus: [] as MonitoringServiceUptime[],
    alerts: [] as Alert[],
    loading: false,
    error: null as string | null,
    alertSearch: '',
  }),
  actions: {
    async fetchOverview() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get<{ keyMetrics: MonitoringMetric[]; servicesStatus: MonitoringServiceUptime[] }>(
          '/monitoring/overview',
        )
        this.keyMetrics = res.keyMetrics
        this.servicesStatus = res.servicesStatus
      } catch (e) {
        this.error = e instanceof ApiError ? e.message : 'Не удалось загрузить мониторинг'
      } finally {
        this.loading = false
      }
    },
    async fetchAlerts(search?: string) {
      const q = search ?? this.alertSearch
      this.alertSearch = q
      try {
        const params = new URLSearchParams()
        params.set('search', q)
        this.alerts = await api.get<Alert[]>(`/monitoring/alerts?${params.toString()}`)
      } catch (e) {
        this.error = e instanceof ApiError ? e.message : 'Не удалось загрузить алерты'
      }
    },
  },
})

