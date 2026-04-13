import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api, ApiError } from '@/api/api'

export type StorageFileType = 'Разметка' | 'Датасет' | 'Артефакт модели'

export type StorageFile = {
  id: number
  name: string
  type: StorageFileType
  size: string
  date: string
  project: string
}

export type StorageFilesQuery = {
  search?: string
  type?: string
  sortField?: string | null
  sortDirection?: 'asc' | 'desc'
  page?: number
  perPage?: number
}

type StorageFilesResponse = {
  items: StorageFile[]
  total: number
  page: number
  perPage: number
}

export const useStorageFilesStore = defineStore('storageFiles', () => {
  const items = ref<StorageFile[]>([])
  const total = ref(0)
  const page = ref(1)
  const perPage = ref(10)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastQuery = ref<Required<StorageFilesQuery>>({
    search: '',
    type: 'Все типы',
    sortField: null,
    sortDirection: 'asc',
    page: 1,
    perPage: 10,
  })

  const fetchFiles = async (query?: StorageFilesQuery) => {
    const q: Required<StorageFilesQuery> = {
      ...lastQuery.value,
      ...(query ?? {}),
    }
    lastQuery.value = q
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      params.set('search', q.search ?? '')
      params.set('type', q.type ?? 'Все типы')
      if (q.sortField) params.set('sortField', q.sortField)
      params.set('sortDirection', q.sortDirection ?? 'asc')
      params.set('page', String(q.page ?? 1))
      params.set('perPage', String(q.perPage ?? 10))

      const res = await api.get<StorageFilesResponse>(`/storage/files?${params.toString()}`)
      items.value = res.items
      total.value = res.total
      page.value = res.page
      perPage.value = res.perPage
    } catch (e) {
      const err = e as unknown
      error.value = err instanceof ApiError ? err.message : 'Не удалось загрузить файлы'
    } finally {
      loading.value = false
    }
  }

  return { items, total, page, perPage, loading, error, lastQuery, fetchFiles }
})
