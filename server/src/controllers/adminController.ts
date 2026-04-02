import { apiError, json, readJson } from '@/helpers/http'
import { apiService } from '@/services/apiService'
import type { UserRole } from '@/types/domain'
import type { Json } from '@/types/http'

type RouteReq = Request & { params: Record<string, string> }

export const adminController = {
  listUsers: () => json(apiService.listUsers() as unknown as Json),
  addUser: async (req: Request) => {
    const body = await readJson<{ email?: string; name?: string; role?: UserRole; password?: string }>(req)
    if (!body?.email) return apiError(400, { error: 'bad_request', message: 'email is required' })
    if (!body?.password) return apiError(400, { error: 'bad_request', message: 'password is required' })
    const user = apiService.addUser(body as { email: string; name?: string; role?: UserRole; password: string })
    return user ? json(user as unknown as Json, { status: 201 }) : apiError(400, { error: 'bad_request', message: 'Invalid email' })
  },
  createInvitationLink: async (req: Request) => {
    const body = await readJson<{ role?: UserRole }>(req)
    const invite = apiService.createInvitationLink({ role: body?.role })
    return json(invite as unknown as Json, { status: 201 })
  },
  registerByInvitation: async (req: Request) => {
    const body = await readJson<{ code?: string; email?: string; name?: string; password?: string }>(req)
    if (!body?.code || !body?.email || !body?.password) {
      return apiError(400, { error: 'bad_request', message: 'code, email and password are required' })
    }
    const result = apiService.registerByInvitation({
      code: body.code,
      email: body.email,
      name: body.name,
      password: body.password,
    })
    if ('error' in result) {
      const message = result.error === 'expired_code' ? 'Invitation link expired' : 'Invitation code is invalid'
      return apiError(400, { error: result.error, message })
    }
    return json(result.user as unknown as Json, { status: 201 })
  },
  updateUser: async (req: RouteReq) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid user id' })
    const body = await readJson<{ email?: string; name?: string; role?: UserRole }>(req)
    const user = apiService.updateUser(id, body ?? {})
    return user ? json(user as unknown as Json) : apiError(404, { error: 'not_found', message: 'User not found' })
  },
  resetUserPassword: async (req: RouteReq) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid user id' })
    const body = await readJson<{ password?: string }>(req)
    if (!body?.password) return apiError(400, { error: 'bad_request', message: 'password is required' })
    const result = apiService.resetUserPassword(id, body.password)
    return result ? json(result as unknown as Json) : apiError(400, { error: 'bad_request', message: 'Password must be at least 8 chars' })
  },
  toggleUserStatus: (req: RouteReq) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid user id' })
    const user = apiService.toggleUserStatus(id)
    return user ? json(user as unknown as Json) : apiError(404, { error: 'not_found', message: 'User not found' })
  },
  deleteUser: (req: RouteReq) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid user id' })
    return apiService.deleteUser(id) ? json({ ok: true } as unknown as Json) : apiError(404, { error: 'not_found', message: 'User not found' })
  },
  listIntegrations: () => json(apiService.listIntegrations() as unknown as Json),
  checkIntegration: (req: RouteReq) => {
    const integration = apiService.checkIntegration(req.params.id ?? '')
    return integration ? json(integration as unknown as Json) : apiError(404, { error: 'not_found', message: 'Integration not found' })
  },
  listHealthChecks: () => json(apiService.listHealthChecks() as unknown as Json),
}
