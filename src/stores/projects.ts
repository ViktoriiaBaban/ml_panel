import { defineStore } from 'pinia'
import { api, ApiError } from '@/lib/api'
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

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    items: [] as Project[],
    loading: false,
    error: null as string | null,
    searchTerm: '',
    statusFilter: 'all' as Required<ProjectsQuery>['status'],
    lastQuery: { search: '', status: 'all' } as Required<ProjectsQuery>,
    selectedProject: null as Project | null,
    dialogs: {
      gitlab: false,
      pipelines: false,
    },
  }),
  getters: {
    statusOptions: () => STATUS_OPTIONS,
    statusConfig: () => STATUS_CONFIG,
    typeConfig: () => TYPE_CONFIG,
  },
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
    async applyFilters() {
      await this.fetchProjects({ search: this.searchTerm, status: this.statusFilter })
    },
    async setSearchTerm(value: string) {
      this.searchTerm = value
      await this.applyFilters()
    },
    async setStatusFilter(value: Required<ProjectsQuery>['status']) {
      this.statusFilter = value
      await this.applyFilters()
    },
    openGitlabDialog(project: Project) {
      this.selectedProject = project
      this.dialogs.gitlab = true
    },
    closeGitlabDialog() {
      this.dialogs.gitlab = false
      this.selectedProject = null
    }
  },
})
