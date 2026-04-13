import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ApiError, api } from '@/api/api'
import type { ProfileConnection, ProfileSettings, ProfileSettingsResponse } from '@/types/profile'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<ProfileSettings>({
    id: 1,
    name: '',
    email: '',
    role: '',
  })
  const connections = ref<ProfileConnection[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const showConnectionDialog = ref(false)
  const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const deleteForm = ref({
    password: '',
  })
  const showDeleteDialog = ref(false)
  const connectionForm = ref({
    serviceId: '',
    serviceName: '',
    username: '',
    token: '',
  })

  const fetchSettings = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await api.get<ProfileSettingsResponse>('/profile/settings')
      profile.value = data.profile
      connections.value = data.connections
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не удалось загрузить настройки профиля'
    } finally {
      loading.value = false
    }
  }

  const setProfileField = <K extends keyof Pick<ProfileSettings, 'name' | 'email'>>(field: K, value: ProfileSettings[K]) => {
    profile.value[field] = value
  }

  const saveProfile = async () => {
    error.value = null
    try {
      const data = await api.patch<ProfileSettingsResponse, Pick<ProfileSettings, 'name' | 'email'>>('/profile/settings', {
        name: profile.value.name,
        email: profile.value.email,
      })
      profile.value = data.profile
      connections.value = data.connections
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не удалось сохранить профиль'
    }
  }

  const setPasswordField = (field: 'currentPassword' | 'newPassword' | 'confirmPassword', value: string) => {
    passwordForm.value[field] = value
  }

  const resetPasswordForm = () => {
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  }

  const changePassword = async () => {
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      error.value = 'Новый пароль и подтверждение не совпадают'
      return
    }
    error.value = null
    try {
      await api.patch<{ ok: true }, { currentPassword: string; newPassword: string }>('/profile/password', {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
      })
      resetPasswordForm()
      error.value = null
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не удалось сменить пароль'
    }
  }

  const openDeleteDialog = () => {
    deleteForm.value.password = ''
    showDeleteDialog.value = true
  }

  const closeDeleteDialog = () => {
    showDeleteDialog.value = false
    deleteForm.value.password = ''
  }

  const setDeletePassword = (value: string) => {
    deleteForm.value.password = value
  }

  const deleteAccount = async () => {
    error.value = null
    try {
      await api.post<{ ok: true }, { password: string }>('/profile/delete-account', {
        password: deleteForm.value.password,
      })
      closeDeleteDialog()
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не удалось удалить учётную запись'
    }
  }

  const openConnectionDialog = (serviceId: string) => {
    const item = connections.value.find((conn) => conn.serviceId === serviceId)
    if (!item) return
    connectionForm.value = {
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      username: item.username ?? '',
      token: '',
    }
    showConnectionDialog.value = true
  }

  const closeConnectionDialog = () => {
    showConnectionDialog.value = false
    connectionForm.value = { serviceId: '', serviceName: '', username: '', token: '' }
  }

  const setConnectionField = (field: 'username' | 'token', value: string) => {
    connectionForm.value[field] = value
  }

  const saveConnection = async () => {
    if (!connectionForm.value.serviceId || !connectionForm.value.username.trim() || !connectionForm.value.token.trim()) return
    const data = await api.post<ProfileSettingsResponse, { serviceId: string; username: string; token: string }>(
      '/profile/connections',
      {
        serviceId: connectionForm.value.serviceId,
        username: connectionForm.value.username,
        token: connectionForm.value.token,
      },
    )
    profile.value = data.profile
    connections.value = data.connections
    closeConnectionDialog()
  }

  return {
    profile,
    connections,
    loading,
    error,
    showConnectionDialog,
    passwordForm,
    deleteForm,
    showDeleteDialog,
    connectionForm,
    fetchSettings,
    setProfileField,
    saveProfile,
    setPasswordField,
    resetPasswordForm,
    changePassword,
    openDeleteDialog,
    closeDeleteDialog,
    setDeletePassword,
    deleteAccount,
    openConnectionDialog,
    closeConnectionDialog,
    setConnectionField,
    saveConnection,
  }
})
