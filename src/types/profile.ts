export interface ProfileSettings {
  id: number
  name: string
  email: string
  /** Назначается системой, пользователь не может менять это поле. */
  role: string
}

export interface ProfileConnection {
  serviceId: string
  serviceName: string
  connected: boolean
  username?: string
  token?: string
  updatedAt: string
}

export interface ProfileSettingsResponse {
  profile: ProfileSettings
  connections: ProfileConnection[]
}
