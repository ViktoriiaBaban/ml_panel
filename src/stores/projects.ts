import { defineStore } from 'pinia'
import { api, ApiError } from '@/lib/api'

export type ProjectType = 'training' | 'inference' | 'etl'
export type PipelineStatus = 'success' | 'failed' | 'running'

export type Project = {
  id: number
  name: string
  description: string
  namespace: string
  lastCommit: { author: string; time: string }
  pipelineStatus: PipelineStatus
  types: ProjectType[]
}

export type ProjectsQuery = {
  search?: string
  status?: 'all' | 'active' | 'errors'
}

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    items: [] as Project[],
    loading: false,
    error: null as string | null,
    lastQuery: { search: '', status: 'all' } as Required<ProjectsQuery>,
  }),
  actions: {
    async fetchProjects(query?: ProjectsQuery) {
      const q: Required<ProjectsQuery> = { ...this.lastQuery, ...(query ?? {}) }
      this.lastQuery = q
      this.loading = true
      this.error = null
      try {
        const params = new URLSearchParams()
        params.set('search', q.search ?? '')
        params.set('status', q.status ?? 'all')
        this.items = await api.get<Project[]>(`/projects?${params.toString()}`)
      } catch (e) {
        this.error = e instanceof ApiError ? e.message : 'Не удалось загрузить проекты'
      } finally {
        this.loading = false
      }
    },
  },
})

