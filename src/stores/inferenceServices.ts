import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, ApiError } from '@/api/api'

export type ServiceStatus = 'running' | 'stopped' | 'error'

export type InferenceService = {
  id: number
  name: string
  project: string
  model: string
  endpoint: string
  version: string
  status: ServiceStatus
  rps: number
  latencyP95: number
  errorRate: number
}

export type InferenceServicesQuery = {
  search?: string
  status?: string
  project?: string
}

export const useInferenceServicesStore = defineStore('inferenceServices', () => {
  const items = ref<InferenceService[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastQuery = ref<Required<InferenceServicesQuery>>({ search: '', status: 'all', project: 'all' })

  const uniqueProjects = computed(() => [...new Set(items.value.map((s) => s.project))])

  const fetchServices = async (query?: InferenceServicesQuery) => {
    const q: Required<InferenceServicesQuery> = { ...lastQuery.value, ...(query ?? {}) }
    lastQuery.value = q
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      params.set('search', q.search ?? '')
      params.set('status', q.status ?? 'all')
      params.set('project', q.project ?? 'all')
      items.value = await api.get<InferenceService[]>(`/inference/services?${params.toString()}`)
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не удалось загрузить инференс-сервисы'
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, lastQuery, uniqueProjects, fetchServices }
})
