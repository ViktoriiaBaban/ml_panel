import { defineStore } from 'pinia'
import { ApiError, api } from '@/lib/api'
import type { Experiment, ExperimentsQuery, ExperimentsResponse } from '@/types/experiments'

const DEFAULT_PER_PAGE = 10

export const useExperimentsStore = defineStore('experiments', {
  state: () => ({
    items: [] as Experiment[],
    total: 0,
    loading: false,
    error: null as string | null,
    page: 1,
    perPage: DEFAULT_PER_PAGE,
    search: '',
    sort: 'name' as Required<ExperimentsQuery>['sort'],
    sortDirection: 'asc' as Required<ExperimentsQuery>['sortDirection'],
    nameFilter: '',
    tagFilter: 'all',
    projectFilter: 'all',
    selected: [] as number[],
    availableTags: [] as string[],
    availableProjects: [] as string[],
  }),
  getters: {
    totalPages: (state) => Math.max(1, Math.ceil(state.total / state.perPage)),
    allVisibleSelected(state) {
      return state.items.length > 0 && state.items.every((item) => state.selected.includes(item.id))
    },
  },
  actions: {
    async fetchExperiments() {
      this.loading = true
      this.error = null
      try {
        const params = new URLSearchParams()
        params.set('page', String(this.page))
        params.set('perPage', String(this.perPage))
        params.set('search', this.search)
        params.set('sort', this.sort)
        params.set('sortDirection', this.sortDirection)
        params.set('name', this.nameFilter)
        params.set('tag', this.tagFilter)
        params.set('project', this.projectFilter)

        const data = await api.get<ExperimentsResponse>(`/experiments?${params.toString()}`)
        this.items = data.items
        this.total = data.total
        this.availableTags = data.availableTags
        this.availableProjects = data.availableProjects

        if (this.page > data.page && data.page > 0) {
          this.page = data.page
        }

        this.selected = this.selected.filter((id) => this.items.some((item) => item.id === id))
      } catch (e) {
        this.error = e instanceof ApiError ? e.message : 'Не удалось загрузить эксперименты'
      } finally {
        this.loading = false
      }
    },
    async setSearch(value: string) {
      this.search = value
      this.page = 1
      await this.fetchExperiments()
    },
    async setSort(field: Required<ExperimentsQuery>['sort']) {
      if (this.sort === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sort = field
        this.sortDirection = 'asc'
      }
      this.page = 1
      await this.fetchExperiments()
    },
    async setSortFromTable(field: Required<ExperimentsQuery>['sort'], direction: Required<ExperimentsQuery>['sortDirection']) {
      this.sort = field
      this.sortDirection = direction
      this.page = 1
      await this.fetchExperiments()
    },
    async setNameFilter(value: string) {
      this.nameFilter = value
      this.page = 1
      await this.fetchExperiments()
    },
    async setTagFilter(value: string) {
      this.tagFilter = value
      this.page = 1
      await this.fetchExperiments()
    },
    async setProjectFilter(value: string) {
      this.projectFilter = value
      this.page = 1
      await this.fetchExperiments()
    },
    async setPage(page: number) {
      this.page = Math.min(this.totalPages, Math.max(1, page))
      await this.fetchExperiments()
    },
    toggleRowSelection(id: number) {
      if (this.selected.includes(id)) {
        this.selected = this.selected.filter((value) => value !== id)
      } else {
        this.selected.push(id)
      }
    },
    toggleVisibleSelection() {
      if (this.allVisibleSelected) {
        this.selected = this.selected.filter((selectedId) => !this.items.some((i) => i.id === selectedId))
      } else {
        const ids = new Set(this.selected)
        this.items.forEach((item) => ids.add(item.id))
        this.selected = [...ids]
      }
    },
  },
})
