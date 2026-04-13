import { ref } from 'vue'
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

export const useInferenceMonitoringStore = defineStore('inferenceMonitoring', () => {
  const service = ref<InferenceService | null>(null)
  const monitoring = ref<InferenceServiceMonitoring | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchAll = async (serviceId: number) => {
    loading.value = true
    error.value = null
    try {
      const [serviceData, monitoringData] = await Promise.all([
        api.get<InferenceService>(`/inference/services/${serviceId}`),
        api.get<InferenceServiceMonitoring>(`/inference/services/${serviceId}/monitoring`),
      ])
      service.value = serviceData
      monitoring.value = monitoringData
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не удалось загрузить мониторинг сервиса'
    } finally {
      loading.value = false
    }
  }

  return { service, monitoring, loading, error, fetchAll }
})
