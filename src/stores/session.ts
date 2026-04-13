import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ApiError, api } from '@/api/api'
import type { SessionMe } from '@/types/session'

export const useSessionStore = defineStore('session', () => {
  const me = ref<SessionMe | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchMe = async () => {
    loading.value = true
    error.value = null
    try {
      me.value = await api.get<SessionMe>('/me')
    } catch (e) {
      me.value = null
      error.value = e instanceof ApiError ? e.message : 'Не удалось загрузить пользователя'
    } finally {
      loading.value = false
    }
  }

  return { me, loading, error, fetchMe }
})
