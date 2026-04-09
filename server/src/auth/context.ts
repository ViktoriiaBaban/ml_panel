import { AsyncLocalStorage } from 'node:async_hooks'
import type { UserRole } from '@/types/domain'

export type AuthContext = {
  userId: number
  role: UserRole
}

export const authStorage = new AsyncLocalStorage<AuthContext>()

export function getAuthContext(): AuthContext | undefined {
  return authStorage.getStore()
}

export function requireAuthContext(): AuthContext {
  const ctx = authStorage.getStore()
  if (!ctx) throw new Error('auth context missing')
  return ctx
}
