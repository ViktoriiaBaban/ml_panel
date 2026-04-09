import type { UserRole } from '@/types/administration'

export interface SessionMe {
  id: number
  name: string
  email: string
  jobTitle: string
  role: UserRole
}
