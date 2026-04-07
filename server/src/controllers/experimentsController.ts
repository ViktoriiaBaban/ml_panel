import { apiError, json, readJson } from '@/helpers/http'
import { apiService } from '@/services/apiService'
import type { Json } from '@/types/http'

type RouteReq = Request & { params: Record<string, string> }

export const experimentsController = {
  listExperiments: (req: Request) => {
    const url = new URL(req.url)
    return json(apiService.listExperiments(url.searchParams) as unknown as Json)
  },
  getExperiment: (req: RouteReq) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid experiment id' })
    const out = apiService.getExperimentDetail(id)
    if (!out) return apiError(404, { error: 'not_found', message: 'Experiment not found' })
    return json(out as unknown as Json)
  },
  addTag: async (req: RouteReq) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid experiment id' })
    const payload = await readJson<{ tag?: string }>(req)
    const tag = (payload?.tag ?? '').trim()
    if (!tag) return apiError(400, { error: 'bad_request', message: 'Tag is required' })
    const out = apiService.addExperimentTag(id, tag)
    if (!out) return apiError(404, { error: 'not_found', message: 'Experiment not found' })
    return json(out as unknown as Json)
  },
  removeTag: (req: RouteReq) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid experiment id' })
    const tag = String(req.params.tag ?? '')
    const out = apiService.removeExperimentTag(id, tag)
    if (!out) return apiError(404, { error: 'not_found', message: 'Experiment not found' })
    return json(out as unknown as Json)
  },
}
