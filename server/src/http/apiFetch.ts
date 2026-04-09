import { authStorage } from '@/auth/context'
import { verifyAccessToken } from '@/auth/jwt'
import { apiError } from '@/helpers/http'
import { runMatchedRoute } from '@/http/routesTable'
import type { UserRole } from '@/types/domain'
import { userStore } from '@/services/userStore'

function isPublic(method: string, pathname: string): boolean {
  if (method === 'GET' && pathname === '/api/status') return true
  if (method === 'GET' && pathname === '/api/health') return true
  if (method === 'POST' && pathname === '/api/auth/login') return true
  if (method === 'POST' && pathname === '/api/admin/users/register-by-invitation') return true
  return false
}

function needsAdminRole(pathname: string): boolean {
  if (!pathname.startsWith('/api/admin')) return false
  if (pathname === '/api/admin/users/register-by-invitation') return false
  return true
}

async function authorizeRequest(
  req: Request
): Promise<Response | { userId: number; role: UserRole }> {
  const url = new URL(req.url)
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) {
    return apiError(401, { error: 'unauthorized', message: 'Требуется авторизация' })
  }
  let sub: string
  try {
    const payload = await verifyAccessToken(token)
    sub = String(payload.sub ?? '')
  } catch {
    return apiError(401, { error: 'unauthorized', message: 'Недействительный или просроченный токен' })
  }
  const userId = Number(sub)
  if (!Number.isFinite(userId)) {
    return apiError(401, { error: 'unauthorized', message: 'Недействительный токен' })
  }
  const stored = await userStore.findStoredById(userId)
  if (!stored || stored.status !== 'active') {
    return apiError(401, { error: 'unauthorized', message: 'Учётная запись недоступна' })
  }
  if (needsAdminRole(url.pathname) && stored.role !== 'admin') {
    return apiError(403, { error: 'forbidden', message: 'Недостаточно прав' })
  }
  return { userId: stored.id, role: stored.role }
}

export async function handleApiRequest(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const pathname = url.pathname
  const method = req.method

  if (!pathname.startsWith('/api')) {
    return new Response('Not Found', { status: 404 })
  }

  if (method === 'GET' && pathname === '/api/status') {
    return new Response('OK')
  }

  if (isPublic(method, pathname)) {
    const res = await runMatchedRoute(req, method, pathname)
    return res ?? Response.json({ message: 'Not found' }, { status: 404 })
  }

  const auth = await authorizeRequest(req)
  if (auth instanceof Response) return auth

  return authStorage.run(auth, async () => {
    const res = await runMatchedRoute(req, method, pathname)
    return res ?? Response.json({ message: 'Not found' }, { status: 404 })
  })
}
