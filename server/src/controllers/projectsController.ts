import { apiError, json } from '@/helpers/http'
import { apiService } from '@/services/apiService'
import type { Json } from '@/types/http'

type RouteReq = Request & { params: Record<string, string> }

export const projectsController = {
  listProjects: (req: Request) => {
    const url = new URL(req.url)
    return json(apiService.listProjects(url.searchParams) as unknown as Json)
  },
  listProjectPipelines: (req: RouteReq) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid project id' })
    const url = new URL(req.url)
    return json(apiService.listPipelines(id, url.searchParams) as unknown as Json)
  },
  listPipelines: (req: Request) => {
    const url = new URL(req.url)
    const projectIdRaw = url.searchParams.get('projectId')
    const projectId = projectIdRaw ? Number(projectIdRaw) : null
    if (projectIdRaw && !Number.isFinite(projectId)) return apiError(400, { error: 'bad_request', message: 'Invalid projectId' })
    return json(apiService.listPipelines(projectId, url.searchParams) as unknown as Json)
  },
}
