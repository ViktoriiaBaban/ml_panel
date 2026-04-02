import { defineStore } from 'pinia'
import type { DataTableHeader } from 'vuetify'
import { api, ApiError } from '@/lib/api'
import type {
  AddUserPayload,
  AdminIntegration,
  AdminUser,
  AdministrationTab,
  HealthCheck,
  InvitationLink,
  RegisterByInvitationPayload,
  ResetUserPasswordPayload,
  UpdateUserPayload,
  IntegrationStatus,
  SelectOption,
  EditUserFormState,
  UserFormState,
  UserRole,
} from '@/types/administration'

const INTEGRATION_STATUS_LABELS: Record<IntegrationStatus, string> = {
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

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [] as AdminUser[],
    integrations: [] as AdminIntegration[],
    healthChecks: [] as HealthCheck[],
    loadingUsers: false,
    loadingIntegrations: false,
    error: null as string | null,
    activeTab: 'users' as AdministrationTab,
    showAddUserDialog: false,
    expandedIntegrationId: null as string | null,
    checkingIntegrationId: null as string | null,
    userForm: {
      email: '',
      name: '',
      role: 'user',
      password: '',
      showPassword: false,
    } as UserFormState,
    invitationRole: 'user' as UserRole,
    latestInvitation: null as InvitationLink | null,
    invitationCopied: false,
    showEditUserDialog: false,
    editUserForm: {
      id: null,
      email: '',
      name: '',
      role: 'user',
      newPassword: '',
      showPassword: false,
    } as EditUserFormState,
  }),
  getters: {
    tabs: () => TABS,
    userHeaders: () => USER_HEADERS,
    integrationHeaders: () => INTEGRATION_HEADERS,
    roleOptions: () => ROLE_OPTIONS,
    integrationStatusLabels: () => INTEGRATION_STATUS_LABELS,
    usersCount: (state) => state.users.length,
  },
  actions: {
    async initAdministration() {
      await this.fetchUsers()
      if (this.activeTab === 'integrations') {
        await this.fetchIntegrations()
      }
    },
    async setActiveTab(tab: AdministrationTab) {
      this.activeTab = tab
      if (tab === 'integrations' && this.integrations.length === 0 && !this.loadingIntegrations) {
        await this.fetchIntegrations()
      }
    },
    openAddUserDialog() {
      this.showAddUserDialog = true
    },
    closeAddUserDialog() {
      this.showAddUserDialog = false
      this.resetUserForm()
    },
    setUserFormField<K extends keyof UserFormState>(field: K, value: UserFormState[K]) {
      this.userForm[field] = value
    },
    setInvitationRole(role: UserRole) {
      this.invitationRole = role
    },
    resetUserForm() {
      this.userForm = { email: '', name: '', role: 'user', password: '', showPassword: false }
    },
    async submitUserForm() {
      if (!this.userForm.email.trim()) return
      if (!this.userForm.password.trim()) return
      await this.addUser({
        email: this.userForm.email,
        name: this.userForm.name,
        role: this.userForm.role,
        password: this.userForm.password,
      })
      this.closeAddUserDialog()
    },
    async createInvitationLink() {
      const invitation = await api.post<InvitationLink, { role: UserRole }>('/admin/users/invitations', { role: this.invitationRole })
      this.latestInvitation = invitation
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(invitation.url)
        }
      } finally {
        this.invitationCopied = true
      }
      return invitation
    },
    closeInvitationSnackbar() {
      this.invitationCopied = false
    },
    openEditUserDialog(id: number) {
      const user = this.users.find((item) => item.id === id)
      if (!user) return
      this.editUserForm = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        newPassword: '',
        showPassword: false,
      }
      this.showEditUserDialog = true
    },
    closeEditUserDialog() {
      this.showEditUserDialog = false
      this.editUserForm = {
        id: null,
        email: '',
        name: '',
        role: 'user',
        newPassword: '',
        showPassword: false,
      }
    },
    setEditUserField<K extends keyof EditUserFormState>(field: K, value: EditUserFormState[K]) {
      this.editUserForm[field] = value
    },
    async saveEditedUser() {
      if (!this.editUserForm.id) return
      const payload: UpdateUserPayload = {
        email: this.editUserForm.email,
        name: this.editUserForm.name,
        role: this.editUserForm.role,
      }
      const updated = await api.patch<AdminUser, UpdateUserPayload>(`/admin/users/${this.editUserForm.id}`, payload)
      this.users = this.users.map((u) => (u.id === updated.id ? updated : u))
      this.closeEditUserDialog()
      return updated
    },
    async resetEditedUserPassword() {
      if (!this.editUserForm.id || this.editUserForm.newPassword.length < 8) return
      await api.post<{ ok: true }, ResetUserPasswordPayload>(`/admin/users/${this.editUserForm.id}/reset-password`, {
        password: this.editUserForm.newPassword,
      })
      this.editUserForm.newPassword = ''
      this.editUserForm.showPassword = false
    },
    async fetchUsers() {
      this.loadingUsers = true
      this.error = null
      try {
        this.users = await api.get<AdminUser[]>('/admin/users')
      } catch (e) {
        this.error = e instanceof ApiError ? e.message : 'Не удалось загрузить пользователей'
      } finally {
        this.loadingUsers = false
      }
    },
    async addUser(input: AddUserPayload) {
      const created = await api.post<AdminUser, AddUserPayload>('/admin/users', input)
      this.users = [...this.users, created]
      return created
    },
    async registerByInvitation(payload: RegisterByInvitationPayload) {
      const created = await api.post<AdminUser, RegisterByInvitationPayload>('/admin/users/register-by-invitation', payload)
      this.users = [...this.users, created]
      return created
    },
    async toggleUserStatus(id: number) {
      const updated = await api.patch<AdminUser, Record<string, never>>(`/admin/users/${id}/toggle-status`, {})
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
        this.integrations = await api.get<AdminIntegration[]>('/admin/integrations')
        this.healthChecks = await api.get<HealthCheck[]>('/admin/health-checks')
      } catch (e) {
        this.error = e instanceof ApiError ? e.message : 'Не удалось загрузить интеграции'
      } finally {
        this.loadingIntegrations = false
      }
    },
    toggleIntegrationExpanded(id: string) {
      this.expandedIntegrationId = this.expandedIntegrationId === id ? null : id
    },
    async checkIntegration(id: string) {
      this.checkingIntegrationId = id
      try {
        const updated = await api.post<AdminIntegration, Record<string, never>>(`/admin/integrations/${id}/check`, {})
        this.integrations = this.integrations.map((i) => (i.id === id ? updated : i))
        return updated
      } finally {
        this.checkingIntegrationId = null
      }
    },
  },
})
