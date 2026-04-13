import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ApiError, api } from '@/api/api'
import { clearToken, setToken } from '@/api/authToken'
import type { LoginResponse } from '@/types/auth'
import { useSessionStore } from '@/stores/session'

export const useAuthStore = defineStore('auth', () => {
  const loginError = ref<string | null>(null)
  const loggingIn = ref(false)

  const login = async (email: string, password: string) => {
    loggingIn.value = true
    loginError.value = null
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
      loginError.value = e instanceof ApiError ? e.message : 'Не удалось войти'
      clearToken()
      return false
    } finally {
      loggingIn.value = false
    }
  }

  const logout = () => {
    clearToken()
    const session = useSessionStore()
    session.me = null
  }

  return { loginError, loggingIn, login, logout }
})
