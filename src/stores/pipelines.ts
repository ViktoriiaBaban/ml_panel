import { defineStore } from 'pinia'
import { api, ApiError } from '@/lib/api'
import { Pipeline, PipelinesQuery } from '@/types/projects.ts';

export const usePipelinesStore = defineStore('pipelines', {
  state: () => ({
    items: [] as Pipeline[],
    loading: false,
    error: null as string | null,
    lastQuery: { projectId: null, branch: 'all', status: 'all' } as Required<PipelinesQuery>,
  }),
  actions: {
    async fetchPipelines(query?: PipelinesQuery) {
      const q: Required<PipelinesQuery> = { ...this.lastQuery, ...(query ?? {}) }
      this.lastQuery = q
      this.loading = true
      this.error = null
      try {
        const params = new URLSearchParams()
        if (q.projectId != null) params.set('projectId', String(q.projectId))
        params.set('branch', q.branch ?? 'all')
        params.set('status', q.status ?? 'all')
        this.items = await api.get<Pipeline[]>(`/pipelines?${params.toString()}`)
      } catch (e) {
        this.error = e instanceof ApiError ? e.message : 'Не удалось загрузить пайплайны'
      } finally {
        this.loading = false
      }
    },
  },
})

