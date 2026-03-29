import { apiError, json, readJson } from '../helpers/http'
import { apiService } from '../services/apiService'
import type { Json } from '../types/http'
import type { UserRole } from '../types/domain'

const parseId = (raw: string, label: string) => {
  const id = Number(raw)
  return Number.isFinite(id) ? id : apiError(400, { error: 'bad_request', message: `Invalid ${label}` })
}

export const controllers = {
  health: () => json({ ok: true } as unknown as Json),
  listProjects: ({ url }: { url: URL }) => json(apiService.listProjects(url.searchParams) as unknown as Json),
  listProjectPipelines: ({ params, url }: { params: Record<string, string>; url: URL }) => {
    const id = parseId(params.id ?? '', 'project id')
    return id instanceof Response ? id : json(apiService.listPipelines(id, url.searchParams) as unknown as Json)
  },
  listPipelines: ({ url }: { url: URL }) => {
    const projectIdRaw = url.searchParams.get('projectId')
    const projectId = projectIdRaw ? Number(projectIdRaw) : null
    if (projectIdRaw && !Number.isFinite(projectId)) return apiError(400, { error: 'bad_request', message: 'Invalid projectId' })
    return json(apiService.listPipelines(projectId, url.searchParams) as unknown as Json)
  },
  listStorageFiles: ({ url }: { url: URL }) => json(apiService.listFiles(url.searchParams) as unknown as Json),
  listInferenceServices: ({ url }: { url: URL }) => json(apiService.listInferenceServices(url.searchParams) as unknown as Json),
  getInferenceService: ({ params }: { params: Record<string, string> }) => {
    const id = parseId(params.id ?? '', 'service id'); if (id instanceof Response) return id
    const svc = apiService.getInferenceService(id); return svc ? json(svc as unknown as Json) : apiError(404, { error: 'not_found', message: 'Service not found' })
  },
  getInferenceMonitoring: ({ params }: { params: Record<string, string> }) => {
    const id = parseId(params.id ?? '', 'service id'); if (id instanceof Response) return id
    const mon = apiService.getInferenceMonitoring(id); return mon ? json(mon as unknown as Json) : apiError(404, { error: 'not_found', message: 'Monitoring not found' })
  },
  listEtlFlows: () => json(apiService.listEtlFlows() as unknown as Json),
  getEtlFlow: ({ params }: { params: Record<string, string> }) => {
    const id = parseId(params.id ?? '', 'flow id'); if (id instanceof Response) return id
    const flow = apiService.getEtlFlow(id); return flow ? json(flow as unknown as Json) : apiError(404, { error: 'not_found', message: 'Flow not found' })
  },
  getFlowVariables: ({ params }: { params: Record<string, string> }) => {
    const id = parseId(params.id ?? '', 'flow id'); return id instanceof Response ? id : json(apiService.getFlowVariables(id) as unknown as Json)
  },
  updateFlowVariable: async ({ req, params }: { req: Request; params: Record<string, string> }) => {
    const id = parseId(params.id ?? '', 'flow id'); if (id instanceof Response) return id
    const body = await readJson<{ value?: string }>(req)
    if (!body || typeof body.value !== 'string') return apiError(400, { error: 'bad_request', message: 'Body must be { value: string }' })
    const updated = apiService.updateFlowVariable(id, params.key ?? '', body.value)
    return updated ? json(updated as unknown as Json) : apiError(404, { error: 'not_found', message: 'Variable not found' })
  },
  getFlowComponents: ({ params }: { params: Record<string, string> }) => {
    const id = parseId(params.id ?? '', 'flow id'); return id instanceof Response ? id : json(apiService.getFlowComponents(id) as unknown as Json)
  },
  getFlowHistory: ({ params }: { params: Record<string, string> }) => {
    const id = parseId(params.id ?? '', 'flow id'); return id instanceof Response ? id : json(apiService.getFlowHistory(id) as unknown as Json)
  },
  listUsers: () => json(apiService.listUsers() as unknown as Json),
  addUser: async ({ req }: { req: Request }) => {
    const body = await readJson<{ email?: string; name?: string; role?: UserRole }>(req)
    if (!body?.email) return apiError(400, { error: 'bad_request', message: 'email is required' })
    const user = apiService.addUser(body as { email: string; name?: string; role?: UserRole })
    return user ? json(user as unknown as Json, { status: 201 }) : apiError(400, { error: 'bad_request', message: 'Invalid email' })
  },
  toggleUserStatus: ({ params }: { params: Record<string, string> }) => {
    const id = parseId(params.id ?? '', 'user id'); if (id instanceof Response) return id
    const user = apiService.toggleUserStatus(id); return user ? json(user as unknown as Json) : apiError(404, { error: 'not_found', message: 'User not found' })
  },
  deleteUser: ({ params }: { params: Record<string, string> }) => {
    const id = parseId(params.id ?? '', 'user id'); if (id instanceof Response) return id
    return apiService.deleteUser(id) ? json({ ok: true } as unknown as Json) : apiError(404, { error: 'not_found', message: 'User not found' })
  },
  listIntegrations: () => json(apiService.listIntegrations() as unknown as Json),
  checkIntegration: ({ params }: { params: Record<string, string> }) => {
    const i = apiService.checkIntegration(params.id ?? '')
    return i ? json(i as unknown as Json) : apiError(404, { error: 'not_found', message: 'Integration not found' })
  },
  listHealthChecks: () => json(apiService.listHealthChecks() as unknown as Json),
  getMonitoringOverview: () => json(apiService.getMonitoringOverview() as unknown as Json),
  listAlerts: ({ url }: { url: URL }) => json(apiService.listAlerts(url.searchParams) as unknown as Json),
}
