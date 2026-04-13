import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, ApiError } from '@/api/api'
import type {
  Project,
  ProjectType,
  PipelineStatus,
  ProjectsQuery,
  ProjectTypeConfig,
  PipelineStatusConfig,
  StatusOption,
} from '@/types/projects'

const STATUS_OPTIONS: StatusOption[] = [
  { label: 'Все', value: 'all' },
  { label: 'С активными пайплайнами', value: 'active' },
  { label: 'С недавними ошибками', value: 'errors' },
]

const STATUS_CONFIG: Record<PipelineStatus, PipelineStatusConfig> = {
  success: { label: 'Успешен', chipColor: 'green', icon: 'mdi-check-circle' },
  failed: { label: 'Ошибка', chipColor: 'red', icon: 'mdi-close-circle' },
  running: { label: 'В процессе', chipColor: 'blue', icon: 'mdi-refresh' },
}

const TYPE_CONFIG: Record<ProjectType, ProjectTypeConfig> = {
  training: { icon: 'mdi-flask', label: 'Обучение', iconColor: 'primary' },
  inference: { icon: 'mdi-robot', label: 'Инференс', iconColor: 'purple' },
  etl: { icon: 'mdi-swap-horizontal', label: 'ETL', iconColor: 'green' },
}

export const useProjectsStore = defineStore('projects', () => {
  const items = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchTerm = ref('')
  const statusFilter = ref<Required<ProjectsQuery>['status']>('all')
  const lastQuery = ref<Required<ProjectsQuery>>({ search: '', status: 'all' })
  const selectedProject = ref<Project | null>(null)
  const dialogs = ref({
    gitlab: false,
    pipelines: false,
  })

  const statusOptions = computed(() => STATUS_OPTIONS)
  const statusConfig = computed(() => STATUS_CONFIG)
  const typeConfig = computed(() => TYPE_CONFIG)

  const fetchProjects = async (query?: ProjectsQuery) => {
    const q: Required<ProjectsQuery> = { ...lastQuery.value, ...(query ?? {}) }
    lastQuery.value = q
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      params.set('search', q.search ?? '')
      params.set('status', q.status ?? 'all')
      items.value = await api.get<Project[]>(`/projects?${params.toString()}`)
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не удалось загрузить проекты'
    } finally {
      loading.value = false
    }
  }

  const applyFilters = async () => {
    await fetchProjects({ search: searchTerm.value, status: statusFilter.value })
  }

  const setSearchTerm = async (value: string) => {
    searchTerm.value = value
    await applyFilters()
  }

  const setStatusFilter = async (value: Required<ProjectsQuery>['status']) => {
    statusFilter.value = value
    await applyFilters()
  }

  const openGitlabDialog = (project: Project) => {
    selectedProject.value = project
    dialogs.value.gitlab = true
  }

  const closeGitlabDialog = () => {
    dialogs.value.gitlab = false
    selectedProject.value = null
  }

  return {
    items,
    loading,
    error,
    searchTerm,
    statusFilter,
    lastQuery,
    selectedProject,
    dialogs,
    statusOptions,
    statusConfig,
    typeConfig,
    fetchProjects,
    applyFilters,
    setSearchTerm,
    setStatusFilter,
    openGitlabDialog,
    closeGitlabDialog,
  }
})
