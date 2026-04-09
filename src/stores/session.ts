import { defineStore } from 'pinia'
import { ApiError, api } from '@/api/api'
import type { SessionMe } from '@/types/session'

export const useSessionStore = defineStore('session', {
  state: () => ({
    me: null as SessionMe | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchMe() {
      this.loading = true
      this.error = null
      try {
        this.me = await api.get<SessionMe>('/me')
      } catch (e) {
        this.me = null
        this.error = e instanceof ApiError ? e.message : 'Не удалось загрузить пользователя'
      } finally {
        this.loading = false
      }
    },
  },
})
