import { apiError, json, readJson } from '@/helpers/http'
import { apiService } from '@/services/apiService'
import type { Json } from '@/types/http'

type RouteReq = Request & { params: Record<string, string> }

const parseFlowId = (req: RouteReq) => {
  const id = Number(req.params.id)
  return Number.isFinite(id) ? id : null
}

export const etlController = {
  listFlows: () => json(apiService.listEtlFlows() as unknown as Json),
  getFlow: (req: RouteReq) => {
    const id = parseFlowId(req)
    if (id === null) return apiError(400, { error: 'bad_request', message: 'Invalid flow id' })
    const flow = apiService.getEtlFlow(id)
    return flow ? json(flow as unknown as Json) : apiError(404, { error: 'not_found', message: 'Flow not found' })
  },
  getVariables: (req: RouteReq) => {
    const id = parseFlowId(req)
    return id === null ? apiError(400, { error: 'bad_request', message: 'Invalid flow id' }) : json(apiService.getFlowVariables(id) as unknown as Json)
  },
  updateVariable: async (req: RouteReq) => {
    const id = parseFlowId(req)
    if (id === null) return apiError(400, { error: 'bad_request', message: 'Invalid flow id' })
    const body = await readJson<{ value?: string }>(req)
    if (!body || typeof body.value !== 'string') return apiError(400, { error: 'bad_request', message: 'Body must be { value: string }' })
    const updated = apiService.updateFlowVariable(id, req.params.key ?? '', body.value)
    return updated ? json(updated as unknown as Json) : apiError(404, { error: 'not_found', message: 'Variable not found' })
  },
  getComponents: (req: RouteReq) => {
    const id = parseFlowId(req)
    return id === null ? apiError(400, { error: 'bad_request', message: 'Invalid flow id' }) : json(apiService.getFlowComponents(id) as unknown as Json)
  },
  getHistory: (req: RouteReq) => {
    const id = parseFlowId(req)
    return id === null ? apiError(400, { error: 'bad_request', message: 'Invalid flow id' }) : json(apiService.getFlowHistory(id) as unknown as Json)
  },
}
