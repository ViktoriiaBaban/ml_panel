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
}

export type IntegrationStatus = 'working' | 'warning' | 'error'

export interface IntegrationDetails {
  url?: string
  version?: string
  error?: string
  lastSuccessfulCall?: string
}

export interface AdminIntegration {
  id: string
  name: string
  status: IntegrationStatus
  lastCheck: string
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
}

export interface UserFormState {
  email: string
  name: string
  role: UserRole
}

export interface SelectOption<T> {
  label: string
  value: T
}
