import { apiError, json, readJson } from '../helpers/http'
import { apiService } from '../services/apiService'
import type { UserRole } from '../types/domain'
import type { Json } from '../types/http'

type RouteReq = Request & { params: Record<string, string> }

export const adminController = {
  listUsers: () => json(apiService.listUsers() as unknown as Json),
  addUser: async (req: Request) => {
    const body = await readJson<{ email?: string; name?: string; role?: UserRole }>(req)
    if (!body?.email) return apiError(400, { error: 'bad_request', message: 'email is required' })
    const user = apiService.addUser(body as { email: string; name?: string; role?: UserRole })
    return user ? json(user as unknown as Json, { status: 201 }) : apiError(400, { error: 'bad_request', message: 'Invalid email' })
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
