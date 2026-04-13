import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { DataTableHeader } from 'vuetify'
import { api, ApiError } from '@/api/api'
import type {
  AddUserPayload,
  AdminIntegration,
  AdminUser,
  AdministrationTab,
  HealthCheck,
  InvitationLink,
  IntegrationFormState,
  RegisterByInvitationPayload,
  ResetUserPasswordPayload,
  UpdateIntegrationPayload,
  UpdateUserPayload,
  IntegrationStatus,
  SelectOption,
  EditUserFormState,
  UserFormState,
  UserRole,
} from '@/types/administration'

const INTEGRATION_STATUS_LABELS: Record<IntegrationStatus, string> = {
  not_connected: 'Не подключено',
  working: 'Работает',
  warning: 'Проблемы с записью',
  error: 'Не отвечает',
}

const USER_HEADERS: DataTableHeader[] = [
  { title: 'Логин / Email', key: 'email' },
  { title: 'ФИО / Имя', key: 'name' },
  { title: 'Роль', key: 'role' },
  { title: 'Статус', key: 'status' },
  { title: 'Дата регистрации', key: 'registrationDate' },
  { title: 'Последний вход', key: 'lastLogin' },
  { title: 'Действия', key: 'actions', sortable: false },
]

const INTEGRATION_HEADERS: DataTableHeader[] = [
  { title: 'Компонент', key: 'name' },
  { title: 'Статус', key: 'status' },
  { title: 'Последняя проверка', key: 'lastCheck' },
  { title: 'Действия', key: 'actions', sortable: false },
]

const ROLE_OPTIONS: SelectOption<UserRole>[] = [
  { label: 'Обычный пользователь', value: 'user' },
  { label: 'Администратор', value: 'admin' },
]

const TABS: SelectOption<AdministrationTab>[] = [
  { value: 'users', label: 'Пользователи' },
  { value: 'integrations', label: 'Системные интеграции' },
]

const DEFAULT_INTEGRATION_FORM: IntegrationFormState = {
  id: '',
  name: '',
  baseUrl: '',
  healthCheckPath: '',
  version: '',
}

const DEFAULT_USER_FORM: UserFormState = {
  email: '',
  name: '',
  role: 'user',
  password: '',
  showPassword: false,
}

const DEFAULT_EDIT_USER_FORM: EditUserFormState = {
  id: null,
  email: '',
  name: '',
  role: 'user',
  newPassword: '',
  showPassword: false,
}

export const useAdminStore = defineStore('admin', () => {
  const users = ref<AdminUser[]>([])
  const integrations = ref<AdminIntegration[]>([])
  const healthChecks = ref<HealthCheck[]>([])
  const loadingUsers = ref(false)
  const loadingIntegrations = ref(false)
  const error = ref<string | null>(null)
  const activeTab = ref<AdministrationTab>('users')
  const showAddUserDialog = ref(false)
  const expandedIntegrationId = ref<string | null>(null)
  const checkingIntegrationId = ref<string | null>(null)
  const showIntegrationDialog = ref(false)
  const integrationForm = ref<IntegrationFormState>({ ...DEFAULT_INTEGRATION_FORM })
  const userForm = ref<UserFormState>({ ...DEFAULT_USER_FORM })
  const invitationRole = ref<UserRole>('user')
  const latestInvitation = ref<InvitationLink | null>(null)
  const invitationCopied = ref(false)
  const showEditUserDialog = ref(false)
  const editUserForm = ref<EditUserFormState>({ ...DEFAULT_EDIT_USER_FORM })

  const tabs = computed(() => TABS)
  const userHeaders = computed(() => USER_HEADERS)
  const integrationHeaders = computed(() => INTEGRATION_HEADERS)
  const roleOptions = computed(() => ROLE_OPTIONS)
  const integrationStatusLabels = computed(() => INTEGRATION_STATUS_LABELS)
  const usersCount = computed(() => users.value.length)

  const initAdministration = async () => {
    await fetchUsers()
    if (activeTab.value === 'integrations') {
      await fetchIntegrations()
    }
  }

  const setActiveTab = async (tab: AdministrationTab) => {
    activeTab.value = tab
    if (tab === 'integrations' && integrations.value.length === 0 && !loadingIntegrations.value) {
      await fetchIntegrations()
    }
  }

  const openAddUserDialog = () => {
    showAddUserDialog.value = true
  }

  const closeAddUserDialog = () => {
    showAddUserDialog.value = false
    resetUserForm()
  }

  const setUserFormField = <K extends keyof UserFormState>(field: K, value: UserFormState[K]) => {
    userForm.value[field] = value
  }

  const setInvitationRole = (role: UserRole) => {
    invitationRole.value = role
  }

  const resetUserForm = () => {
    userForm.value = { ...DEFAULT_USER_FORM }
  }

  const submitUserForm = async () => {
    if (!userForm.value.email.trim()) return
    if (!userForm.value.password.trim()) return
    await addUser({
      email: userForm.value.email,
      name: userForm.value.name,
      role: userForm.value.role,
      password: userForm.value.password,
    })
    closeAddUserDialog()
  }

  const createInvitationLink = async () => {
    const invitation = await api.post<InvitationLink, { role: UserRole }>('/admin/users/invitations', { role: invitationRole.value })
    latestInvitation.value = invitation
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(invitation.url)
      }
    } finally {
      invitationCopied.value = true
    }
    return invitation
  }

  const closeInvitationSnackbar = () => {
    invitationCopied.value = false
  }

  const openEditUserDialog = (id: number) => {
    const user = users.value.find((item) => item.id === id)
    if (!user) return
    editUserForm.value = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      newPassword: '',
      showPassword: false,
    }
    showEditUserDialog.value = true
  }

  const closeEditUserDialog = () => {
    showEditUserDialog.value = false
    editUserForm.value = { ...DEFAULT_EDIT_USER_FORM }
  }

  const setEditUserField = <K extends keyof EditUserFormState>(field: K, value: EditUserFormState[K]) => {
    editUserForm.value[field] = value
  }

  const saveEditedUser = async () => {
    if (!editUserForm.value.id) return
    const payload: UpdateUserPayload = {
      email: editUserForm.value.email,
      name: editUserForm.value.name,
      role: editUserForm.value.role,
    }
    const updated = await api.patch<AdminUser, UpdateUserPayload>(`/admin/users/${editUserForm.value.id}`, payload)
    users.value = users.value.map((u) => (u.id === updated.id ? updated : u))
    closeEditUserDialog()
    return updated
  }

  const resetEditedUserPassword = async () => {
    if (!editUserForm.value.id || editUserForm.value.newPassword.length < 8) return
    await api.post<{ ok: true }, ResetUserPasswordPayload>(`/admin/users/${editUserForm.value.id}/reset-password`, {
      password: editUserForm.value.newPassword,
    })
    editUserForm.value.newPassword = ''
    editUserForm.value.showPassword = false
  }

  const fetchUsers = async () => {
    loadingUsers.value = true
    error.value = null
    try {
      users.value = await api.get<AdminUser[]>('/admin/users')
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не удалось загрузить пользователей'
    } finally {
      loadingUsers.value = false
    }
  }

  const addUser = async (input: AddUserPayload) => {
    const created = await api.post<AdminUser, AddUserPayload>('/admin/users', input)
    users.value = [...users.value, created]
    return created
  }

  const registerByInvitation = async (payload: RegisterByInvitationPayload) => {
    const created = await api.post<AdminUser, RegisterByInvitationPayload>('/admin/users/register-by-invitation', payload)
    users.value = [...users.value, created]
    return created
  }

  const toggleUserStatus = async (id: number) => {
    const updated = await api.patch<AdminUser, Record<string, never>>(`/admin/users/${id}/toggle-status`, {})
    users.value = users.value.map((u) => (u.id === id ? updated : u))
    return updated
  }

  const deleteUser = async (id: number) => {
    await api.del<{ ok: true }>(`/admin/users/${id}`)
    users.value = users.value.filter((u) => u.id !== id)
  }

  const fetchIntegrations = async () => {
    loadingIntegrations.value = true
    error.value = null
    try {
      integrations.value = await api.get<AdminIntegration[]>('/admin/integrations')
      healthChecks.value = await api.get<HealthCheck[]>('/admin/health-checks')
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не удалось загрузить интеграции'
    } finally {
      loadingIntegrations.value = false
    }
  }

  const toggleIntegrationExpanded = (id: string) => {
    expandedIntegrationId.value = expandedIntegrationId.value === id ? null : id
  }

  const checkIntegration = async (id: string) => {
    checkingIntegrationId.value = id
    try {
      const updated = await api.post<AdminIntegration, Record<string, never>>(`/admin/integrations/${id}/check`, {})
      integrations.value = integrations.value.map((i) => (i.id === id ? updated : i))
      return updated
    } finally {
      checkingIntegrationId.value = null
    }
  }

  const openIntegrationDialog = (id: string) => {
    const integration = integrations.value.find((item) => item.id === id)
    if (!integration) return
    integrationForm.value = {
      id: integration.id,
      name: integration.name,
      baseUrl: integration.details?.url ?? '',
      healthCheckPath: integration.healthCheckPath ?? '',
      version: integration.details?.version ?? '',
    }
    showIntegrationDialog.value = true
  }

  const closeIntegrationDialog = () => {
    showIntegrationDialog.value = false
    integrationForm.value = { ...DEFAULT_INTEGRATION_FORM }
  }

  const setIntegrationFormField = <K extends keyof IntegrationFormState>(field: K, value: IntegrationFormState[K]) => {
    integrationForm.value[field] = value
  }

  const saveIntegration = async () => {
    const id = integrationForm.value.id
    const baseUrl = integrationForm.value.baseUrl.trim()
    if (!id || !baseUrl) return
    const payload: UpdateIntegrationPayload = {
      baseUrl,
      healthCheckPath: integrationForm.value.healthCheckPath.trim() || undefined,
      version: integrationForm.value.version.trim() || undefined,
    }
    const updated = await api.patch<AdminIntegration, UpdateIntegrationPayload>(`/admin/integrations/${id}`, payload)
    integrations.value = integrations.value.map((item) => (item.id === id ? updated : item))
    closeIntegrationDialog()
    return updated
  }

  return {
    users,
    integrations,
    healthChecks,
    loadingUsers,
    loadingIntegrations,
    error,
    activeTab,
    showAddUserDialog,
    expandedIntegrationId,
    checkingIntegrationId,
    showIntegrationDialog,
    integrationForm,
    userForm,
    invitationRole,
    latestInvitation,
    invitationCopied,
    showEditUserDialog,
    editUserForm,
    tabs,
    userHeaders,
    integrationHeaders,
    roleOptions,
    integrationStatusLabels,
    usersCount,
    initAdministration,
    setActiveTab,
    openAddUserDialog,
    closeAddUserDialog,
    setUserFormField,
    setInvitationRole,
    resetUserForm,
    submitUserForm,
    createInvitationLink,
    closeInvitationSnackbar,
    openEditUserDialog,
    closeEditUserDialog,
    setEditUserField,
    saveEditedUser,
    resetEditedUserPassword,
    fetchUsers,
    addUser,
    registerByInvitation,
    toggleUserStatus,
    deleteUser,
    fetchIntegrations,
    toggleIntegrationExpanded,
    checkIntegration,
    openIntegrationDialog,
    closeIntegrationDialog,
    setIntegrationFormField,
    saveIntegration,
  }
})
