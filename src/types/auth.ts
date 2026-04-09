import type { SessionMe } from '@/types/session'

export interface LoginResponse {
  token: string
  user: SessionMe
}
