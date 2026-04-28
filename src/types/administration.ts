export type AdministrationTab = 'users' | 'integrations'

export type UserRole = 'user' | 'admin'
export type UserStatus = 'active' | 'blocked'

export interface AdminUser {
  id: number
  email: string
  name: string
  role: UserRole
  status: UserStatus
  registrationDate: string
  lastLogin: string
  jobTitle?: string
}

export type IntegrationStatus = 'not_connected' | 'working' | 'warning' | 'error'

export interface IntegrationDetails {
  url?: string
  version?: string
  error?: string
  lastSuccessfulCall?: string
}

export interface AdminIntegration {
  id: string
  name: string
  description?: string
  connected: boolean
  status: IntegrationStatus
  lastCheck: string
  healthCheckPath?: string
  details?: IntegrationDetails
}

export interface HealthCheck {
  name: string
  command: string
}

export interface AddUserPayload {
  email: string
  name?: string
  role?: UserRole
  password: string
}

export interface UpdateUserPayload {
  email: string
  name?: string
  role: UserRole
}

export interface UserFormState {
  email: string
  name: string
  role: UserRole
  password: string
  showPassword: boolean
}

export interface EditUserFormState {
  id: number | null
  email: string
  name: string
  role: UserRole
  newPassword: string
  showPassword: boolean
}

export interface InvitationLink {
  code: string
  role: UserRole
  url: string
  expiresAt: string
  createdAt: string
}

export interface RegisterByInvitationPayload {
  code: string
  email: string
  name?: string
  password: string
}

export interface ResetUserPasswordPayload {
  password: string
}

export interface SelectOption<T> {
  label: string
  value: T
}

export interface IntegrationFormState {
  id: string
  name: string
  baseUrl: string
  healthCheckUrl: string
  apiToken: string
  description: string
}

export interface UpdateIntegrationPayload {
  baseUrl: string
  healthCheckPath?: string
  description?: string
}
