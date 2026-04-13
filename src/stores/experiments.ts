import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ApiError, api } from '@/api/api'
import type { Experiment, ExperimentsQuery, ExperimentsResponse } from '@/types/experiments'

const DEFAULT_PER_PAGE = 10

export const useExperimentsStore = defineStore('experiments', () => {
  const items = ref<Experiment[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(1)
  const perPage = ref(DEFAULT_PER_PAGE)
  const search = ref('')
  const sort = ref<Required<ExperimentsQuery>['sort']>('name')
  const sortDirection = ref<Required<ExperimentsQuery>['sortDirection']>('asc')
  const nameFilter = ref('')
  const tagFilter = ref('all')
  const projectFilter = ref('all')
  const selected = ref<number[]>([])
  const availableTags = ref<string[]>([])
  const availableProjects = ref<string[]>([])

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))
  const allVisibleSelected = computed(() => items.value.length > 0 && items.value.every((item) => selected.value.includes(item.id)))

  const fetchExperiments = async () => {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      params.set('page', String(page.value))
      params.set('perPage', String(perPage.value))
      params.set('search', search.value)
      params.set('sort', sort.value)
      params.set('sortDirection', sortDirection.value)
      params.set('name', nameFilter.value)
      params.set('tag', tagFilter.value)
      params.set('project', projectFilter.value)

      const data = await api.get<ExperimentsResponse>(`/experiments?${params.toString()}`)
      items.value = data.items
      total.value = data.total
      availableTags.value = data.availableTags
      availableProjects.value = data.availableProjects

      if (page.value > data.page && data.page > 0) {
        page.value = data.page
      }

      selected.value = selected.value.filter((id) => items.value.some((item) => item.id === id))
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не удалось загрузить эксперименты'
    } finally {
      loading.value = false
    }
  }

  const setSearch = async (value: string) => {
    search.value = value
    page.value = 1
    await fetchExperiments()
  }

  const setSort = async (field: Required<ExperimentsQuery>['sort']) => {
    if (sort.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sort.value = field
      sortDirection.value = 'asc'
    }
    page.value = 1
    await fetchExperiments()
  }

  const setSortFromTable = async (
    field: Required<ExperimentsQuery>['sort'],
    direction: Required<ExperimentsQuery>['sortDirection'],
  ) => {
    sort.value = field
    sortDirection.value = direction
    page.value = 1
    await fetchExperiments()
  }

  const setNameFilter = async (value: string) => {
    nameFilter.value = value
    page.value = 1
    await fetchExperiments()
  }

  const setTagFilter = async (value: string) => {
    tagFilter.value = value
    page.value = 1
    await fetchExperiments()
  }

  const setProjectFilter = async (value: string) => {
    projectFilter.value = value
    page.value = 1
    await fetchExperiments()
  }

  const setPage = async (nextPage: number) => {
    page.value = Math.min(totalPages.value, Math.max(1, nextPage))
    await fetchExperiments()
  }

  const toggleRowSelection = (id: number) => {
    if (selected.value.includes(id)) {
      selected.value = selected.value.filter((value) => value !== id)
    } else {
      selected.value.push(id)
    }
  }

  const toggleVisibleSelection = () => {
    if (allVisibleSelected.value) {
      selected.value = selected.value.filter((selectedId) => !items.value.some((i) => i.id === selectedId))
    } else {
      const ids = new Set(selected.value)
      items.value.forEach((item) => ids.add(item.id))
      selected.value = [...ids]
    }
  }

  return {
    items,
    total,
    loading,
    error,
    page,
    perPage,
    search,
    sort,
    sortDirection,
    nameFilter,
    tagFilter,
    projectFilter,
    selected,
    availableTags,
    availableProjects,
    totalPages,
    allVisibleSelected,
    fetchExperiments,
    setSearch,
    setSort,
    setSortFromTable,
    setNameFilter,
    setTagFilter,
    setProjectFilter,
    setPage,
    toggleRowSelection,
    toggleVisibleSelection,
  }
})
