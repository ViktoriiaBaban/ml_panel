import { defineStore } from 'pinia'
import { ApiError, api } from '@/api/api'
import { clearToken, setToken } from '@/api/authToken'
import type { LoginResponse } from '@/types/auth'
import { useSessionStore } from '@/stores/session'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    loginError: null as string | null,
    loggingIn: false,
  }),
  actions: {
    async login(email: string, password: string) {
      this.loggingIn = true
      this.loginError = null
      try {
        const res = await api.post<LoginResponse, { email: string; password: string }>('/auth/login', {
          email: email.trim(),
          password,
        })
        setToken(res.token)
        const session = useSessionStore()
        session.me = res.user
        session.error = null
        return true
      } catch (e) {
        this.loginError = e instanceof ApiError ? e.message : 'Не удалось войти'
        clearToken()
        return false
      } finally {
        this.loggingIn = false
      }
    },
    logout() {
      clearToken()
      const session = useSessionStore()
      session.me = null
    },
  },
})
