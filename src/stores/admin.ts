import { defineStore } from 'pinia'
import { api, ApiError } from '@/lib/api'

export type UserRole = 'user' | 'admin'
export type UserStatus = 'active' | 'blocked'

export type User = {
  id: number
  email: string
  name: string
  role: UserRole
  status: UserStatus
  registrationDate: string
  lastLogin: string
}

export type IntegrationStatus = 'working' | 'warning' | 'error'
export type Integration = {
  id: string
  name: string
  status: IntegrationStatus
  lastCheck: string
  details?: { url?: string; version?: string; error?: string; lastSuccessfulCall?: string }
}

export type HealthCheck = { name: string; command: string }

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [] as User[],
    integrations: [] as Integration[],
    healthChecks: [] as HealthCheck[],
    loadingUsers: false,
    loadingIntegrations: false,
    error: null as string | null,
  }),
  actions: {
    async fetchUsers() {
      this.loadingUsers = true
      this.error = null
      try {
        this.users = await api.get<User[]>('/admin/users')
      } catch (e) {
        this.error = e instanceof ApiError ? e.message : 'Не удалось загрузить пользователей'
      } finally {
        this.loadingUsers = false
      }
    },
    async addUser(input: { email: string; name?: string; role?: UserRole }) {
      const created = await api.post<User, typeof input>('/admin/users', input)
      this.users = [...this.users, created]
      return created
    },
    async toggleUserStatus(id: number) {
      const updated = await api.patch<User, Record<string, never>>(`/admin/users/${id}/toggle-status`, {})
      this.users = this.users.map((u) => (u.id === id ? updated : u))
      return updated
    },
    async deleteUser(id: number) {
      await api.del<{ ok: true }>(`/admin/users/${id}`)
      this.users = this.users.filter((u) => u.id !== id)
    },
    async fetchIntegrations() {
      this.loadingIntegrations = true
      this.error = null
      try {
        this.integrations = await api.get<Integration[]>('/admin/integrations')
        this.healthChecks = await api.get<HealthCheck[]>('/admin/health-checks')
      } catch (e) {
        this.error = e instanceof ApiError ? e.message : 'Не удалось загрузить интеграции'
      } finally {
        this.loadingIntegrations = false
      }
    },
    async checkIntegration(id: string) {
      const updated = await api.post<Integration, Record<string, never>>(`/admin/integrations/${id}/check`, {})
      this.integrations = this.integrations.map((i) => (i.id === id ? updated : i))
      return updated
    },
  },
})

