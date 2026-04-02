import { defineStore } from 'pinia'
import { api, ApiError } from '@/lib/api'
import type { Pipeline, PipelineFilterItem, PipelinesQuery } from '@/types/pipelines'
import { pipelineStatusItems } from '@/types/pipelines'

export const usePipelinesStore = defineStore('pipelines', {
  state: () => ({
    items: [] as Pipeline[],
    loading: false,
    error: null as string | null,
    projectId: null as number | null,
    branchFilter: 'all',
    statusFilter: 'all',
    expandedPipelineId: null as number | null,
    pipelineDialogId: null as number | null,
    lastQuery: { projectId: null, branch: 'all', status: 'all' } as Required<PipelinesQuery>,
  }),
  getters: {
    branchItems(state): PipelineFilterItem[] {
      const branches = ['all', ...new Set(state.items.map(p => p.branch))]
      return branches.map(branch => ({ label: branch === 'all' ? 'Все ветки' : branch, value: branch }))
    },
    statusItems(): PipelineFilterItem[] {
      return pipelineStatusItems
    },
    selectedPipeline(state): Pipeline | null {
      return state.items.find(p => p.id === state.pipelineDialogId) ?? null
    },
  },
  actions: {
    async init(projectId: number) {
      this.projectId = projectId
      this.branchFilter = 'all'
      this.statusFilter = 'all'
      this.expandedPipelineId = null
      await this.fetchPipelines({ projectId, branch: 'all', status: 'all' })
    },
    async setFilters(branch: string, status: string) {
      if (this.projectId == null) return
      this.branchFilter = branch
      this.statusFilter = status
      await this.fetchPipelines({
        projectId: this.projectId,
        branch: this.branchFilter,
        status: this.statusFilter,
      })
    },
    togglePipelineDetails(pipelineId: number) {
      this.expandedPipelineId = this.expandedPipelineId === pipelineId ? null : pipelineId
    },
    openPipelineDialog(pipelineId: number) {
      this.pipelineDialogId = pipelineId
    },
    closePipelineDialog() {
      this.pipelineDialogId = null
    },
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
