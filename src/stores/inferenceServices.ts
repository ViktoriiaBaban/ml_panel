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

export const useInferenceServicesStore = defineStore('inferenceServices', {
  state: () => ({
    items: [] as InferenceService[],
    loading: false,
    error: null as string | null,
    lastQuery: { search: '', status: 'all', project: 'all' } as Required<InferenceServicesQuery>,
  }),
  getters: {
    uniqueProjects(state) {
      return [...new Set(state.items.map((s) => s.project))]
    },
  },
  actions: {
    async fetchServices(query?: InferenceServicesQuery) {
      const q: Required<InferenceServicesQuery> = { ...this.lastQuery, ...(query ?? {}) }
      this.lastQuery = q
      this.loading = true
      this.error = null
      try {
        const params = new URLSearchParams()
        params.set('search', q.search ?? '')
        params.set('status', q.status ?? 'all')
        params.set('project', q.project ?? 'all')
        this.items = await api.get<InferenceService[]>(`/inference/services?${params.toString()}`)
      } catch (e) {
        this.error = e instanceof ApiError ? e.message : 'Не удалось загрузить инференс-сервисы'
      } finally {
        this.loading = false
      }
    },
  },
})

