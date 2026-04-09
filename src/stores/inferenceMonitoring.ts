import { defineStore } from 'pinia'
import { api, ApiError } from '@/api/api'

export type InferenceRecentCall = {
  id: number
  time: string
  latency: number
  status: 'success' | 'error'
}

export type InferenceLogItem = {
  id: number
  timestamp: string
  level: 'ERROR' | 'WARNING' | 'INFO'
  message: string
}

export type InferenceChart = {
  title: string
  color: string
  data: Array<{ pct: number }>
}

export type InferenceRelatedSystem = {
  icon: 'RefreshCw' | 'Database' | 'FlaskConical'
  name: string
  desc: string
}

export type InferenceServiceMonitoring = {
  recentCalls: InferenceRecentCall[]
  logs: InferenceLogItem[]
  charts: InferenceChart[]
  modelArtifacts: string[]
  relatedSystems: InferenceRelatedSystem[]
}

export type InferenceService = {
  id: number
  name: string
  project: string
  model: string
  endpoint: string
  version: string
  status: 'running' | 'stopped' | 'error'
  rps: number
  latencyP95: number
  errorRate: number
}

export const useInferenceMonitoringStore = defineStore('inferenceMonitoring', {
  state: () => ({
    service: null as InferenceService | null,
    monitoring: null as InferenceServiceMonitoring | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchAll(serviceId: number) {
      this.loading = true
      this.error = null
      try {
        const [service, monitoring] = await Promise.all([
          api.get<InferenceService>(`/inference/services/${serviceId}`),
          api.get<InferenceServiceMonitoring>(`/inference/services/${serviceId}/monitoring`),
        ])
        this.service = service
        this.monitoring = monitoring
      } catch (e) {
        this.error = e instanceof ApiError ? e.message : 'Не удалось загрузить мониторинг сервиса'
      } finally {
        this.loading = false
      }
    },
  },
})

