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

export const useStorageFilesStore = defineStore('storageFiles', {
  state: () => ({
    items: [] as StorageFile[],
    total: 0,
    page: 1,
    perPage: 10,
    loading: false,
    error: null as string | null,
    lastQuery: {
      search: '',
      type: 'Все типы',
      sortField: null,
      sortDirection: 'asc',
      page: 1,
      perPage: 10,
    } as Required<StorageFilesQuery>,
  }),
  actions: {
    async fetchFiles(query?: StorageFilesQuery) {
      const q: Required<StorageFilesQuery> = {
        ...this.lastQuery,
        ...(query ?? {}),
      }
      this.lastQuery = q
      this.loading = true
      this.error = null
      try {
        const params = new URLSearchParams()
        params.set('search', q.search ?? '')
        params.set('type', q.type ?? 'Все типы')
        if (q.sortField) params.set('sortField', q.sortField)
        params.set('sortDirection', q.sortDirection ?? 'asc')
        params.set('page', String(q.page ?? 1))
        params.set('perPage', String(q.perPage ?? 10))

        const res = await api.get<StorageFilesResponse>(`/storage/files?${params.toString()}`)
        this.items = res.items
        this.total = res.total
        this.page = res.page
        this.perPage = res.perPage
      } catch (e) {
        const err = e as unknown
        this.error = err instanceof ApiError ? err.message : 'Не удалось загрузить файлы'
      } finally {
        this.loading = false
      }
    },
  },
})

