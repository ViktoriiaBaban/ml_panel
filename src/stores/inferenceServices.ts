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
  page?: number
  perPage?: number
}

type InferenceServicesResponse = {
  items: InferenceService[]
  total: number
  page: number
  perPage: number
  availableProjects: string[]
}

export const useInferenceServicesStore = defineStore('inferenceServices', () => {
  const items = ref<InferenceService[]>([])
  const total = ref(0)
  const page = ref(1)
  const perPage = ref(10)
  const availableProjects = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastQuery = ref<Required<InferenceServicesQuery>>({ search: '', status: 'all', project: 'all', page: 1, perPage: 10 })

  const uniqueProjects = computed(() => availableProjects.value)

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
      params.set('page', String(q.page ?? 1))
      params.set('perPage', String(q.perPage ?? 10))
      const response = await api.get<InferenceServicesResponse>(`/inference/services?${params.toString()}`)
      items.value = response.items
      total.value = response.total
      page.value = response.page
      perPage.value = response.perPage
      availableProjects.value = response.availableProjects
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не удалось загрузить инференс-сервисы'
    } finally {
      loading.value = false
    }
  }

  return { items, total, page, perPage, loading, error, lastQuery, uniqueProjects, fetchServices }
})
