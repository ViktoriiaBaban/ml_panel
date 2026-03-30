import { apiError, json } from '../helpers/http'
import { apiService } from '../services/apiService'
import type { Json } from '../types/http'

type RouteReq = Request & { params: Record<string, string> }

export const inferenceController = {
  listServices: (req: Request) => {
    const url = new URL(req.url)
    return json(apiService.listInferenceServices(url.searchParams) as unknown as Json)
  },
  getService: (req: RouteReq) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid service id' })
    const service = apiService.getInferenceService(id)
    return service ? json(service as unknown as Json) : apiError(404, { error: 'not_found', message: 'Service not found' })
  },
  getMonitoring: (req: RouteReq) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid service id' })
    const monitoring = apiService.getInferenceMonitoring(id)
    return monitoring ? json(monitoring as unknown as Json) : apiError(404, { error: 'not_found', message: 'Monitoring not found' })
  },
}
