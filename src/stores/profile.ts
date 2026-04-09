import { defineStore } from 'pinia'
import { ApiError, api } from '@/lib/api'
import type { ProfileConnection, ProfileSettings, ProfileSettingsResponse } from '@/types/profile'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: {
      id: 1,
      name: '',
      email: '',
      role: '',
    } as ProfileSettings,
    connections: [] as ProfileConnection[],
    loading: false,
    error: null as string | null,
    showConnectionDialog: false,
    passwordForm: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    deleteForm: {
      password: '',
    },
    showDeleteDialog: false,
    connectionForm: {
      serviceId: '',
      serviceName: '',
      username: '',
      token: '',
    },
  }),
  actions: {
    async fetchSettings() {
      this.loading = true
      this.error = null
      try {
        const data = await api.get<ProfileSettingsResponse>('/profile/settings')
        this.profile = data.profile
        this.connections = data.connections
      } catch (e) {
        this.error = e instanceof ApiError ? e.message : 'Не удалось загрузить настройки профиля'
      } finally {
        this.loading = false
      }
    },
    setProfileField<K extends keyof Pick<ProfileSettings, 'name' | 'email'>>(field: K, value: ProfileSettings[K]) {
      this.profile[field] = value
    },
    async saveProfile() {
      this.error = null
      try {
        const data = await api.patch<ProfileSettingsResponse, Pick<ProfileSettings, 'name' | 'email'>>('/profile/settings', {
          name: this.profile.name,
          email: this.profile.email,
        })
        this.profile = data.profile
        this.connections = data.connections
      } catch (e) {
        this.error = e instanceof ApiError ? e.message : 'Не удалось сохранить профиль'
      }
    },
    setPasswordField(field: 'currentPassword' | 'newPassword' | 'confirmPassword', value: string) {
      this.passwordForm[field] = value
    },
    resetPasswordForm() {
      this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' }
    },
    async changePassword() {
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.error = 'Новый пароль и подтверждение не совпадают'
        return
      }
      this.error = null
      try {
        await api.patch<{ ok: true }, { currentPassword: string; newPassword: string }>('/profile/password', {
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword,
        })
        this.resetPasswordForm()
        this.error = null
      } catch (e) {
        this.error = e instanceof ApiError ? e.message : 'Не удалось сменить пароль'
      }
    },
    openDeleteDialog() {
      this.deleteForm.password = ''
      this.showDeleteDialog = true
    },
    closeDeleteDialog() {
      this.showDeleteDialog = false
      this.deleteForm.password = ''
    },
    setDeletePassword(value: string) {
      this.deleteForm.password = value
    },
    async deleteAccount() {
      this.error = null
      try {
        await api.post<{ ok: true }, { password: string }>('/profile/delete-account', {
          password: this.deleteForm.password,
        })
        this.closeDeleteDialog()
      } catch (e) {
        this.error = e instanceof ApiError ? e.message : 'Не удалось удалить учётную запись'
      }
    },
    openConnectionDialog(serviceId: string) {
      const item = this.connections.find((conn) => conn.serviceId === serviceId)
      if (!item) return
      this.connectionForm = {
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        username: item.username ?? '',
        token: '',
      }
      this.showConnectionDialog = true
    },
    closeConnectionDialog() {
      this.showConnectionDialog = false
      this.connectionForm = { serviceId: '', serviceName: '', username: '', token: '' }
    },
    setConnectionField(field: 'username' | 'token', value: string) {
      this.connectionForm[field] = value
    },
    async saveConnection() {
      if (!this.connectionForm.serviceId || !this.connectionForm.username.trim() || !this.connectionForm.token.trim()) return
      const data = await api.post<ProfileSettingsResponse, { serviceId: string; username: string; token: string }>(
        '/profile/connections',
        {
          serviceId: this.connectionForm.serviceId,
          username: this.connectionForm.username,
          token: this.connectionForm.token,
        },
      )
      this.profile = data.profile
      this.connections = data.connections
      this.closeConnectionDialog()
    },
  },
})
