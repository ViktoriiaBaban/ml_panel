import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, ApiError } from '@/api/api'
import type { Pipeline, PipelineFilterItem, PipelinesQuery } from '@/types/pipelines'
import { pipelineStatusItems } from '@/types/pipelines'

export const usePipelinesStore = defineStore('pipelines', () => {
  const items = ref<Pipeline[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const projectId = ref<number | null>(null)
  const branchFilter = ref('all')
  const statusFilter = ref('all')
  const expandedPipelineId = ref<number | null>(null)
  const pipelineDialogId = ref<number | null>(null)
  const lastQuery = ref<Required<PipelinesQuery>>({ projectId: null, branch: 'all', status: 'all' })

  const branchItems = computed<PipelineFilterItem[]>(() => {
    const branches = ['all', ...new Set(items.value.map((p) => p.branch))]
    return branches.map((branch) => ({ label: branch === 'all' ? 'Все ветки' : branch, value: branch }))
  })

  const statusItems = computed<PipelineFilterItem[]>(() => pipelineStatusItems)

  const selectedPipeline = computed<Pipeline | null>(() => items.value.find((p) => p.id === pipelineDialogId.value) ?? null)

  const init = async (nextProjectId: number) => {
    projectId.value = nextProjectId
    branchFilter.value = 'all'
    statusFilter.value = 'all'
    expandedPipelineId.value = null
    await fetchPipelines({ projectId: nextProjectId, branch: 'all', status: 'all' })
  }

  const setFilters = async (branch: string, status: string) => {
    if (projectId.value == null) return
    branchFilter.value = branch
    statusFilter.value = status
    await fetchPipelines({
      projectId: projectId.value,
      branch: branchFilter.value,
      status: statusFilter.value,
    })
  }

  const togglePipelineDetails = (id: number) => {
    expandedPipelineId.value = expandedPipelineId.value === id ? null : id
  }

  const openPipelineDialog = (id: number) => {
    pipelineDialogId.value = id
  }

  const closePipelineDialog = () => {
    pipelineDialogId.value = null
  }

  const fetchPipelines = async (query?: PipelinesQuery) => {
    const q: Required<PipelinesQuery> = { ...lastQuery.value, ...(query ?? {}) }
    lastQuery.value = q
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (q.projectId != null) params.set('projectId', String(q.projectId))
      params.set('branch', q.branch ?? 'all')
      params.set('status', q.status ?? 'all')
      items.value = await api.get<Pipeline[]>(`/pipelines?${params.toString()}`)
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не удалось загрузить пайплайны'
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    error,
    projectId,
    branchFilter,
    statusFilter,
    expandedPipelineId,
    pipelineDialogId,
    lastQuery,
    branchItems,
    statusItems,
    selectedPipeline,
    init,
    setFilters,
    togglePipelineDetails,
    openPipelineDialog,
    closePipelineDialog,
    fetchPipelines,
  }
})
