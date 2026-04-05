import { apiError, json } from '@/helpers/http'
import { apiService } from '@/services/apiService'
import type { Json } from '@/types/http'

type RouteReq = Request & { params: Record<string, string> }

export const storageController = {
  getOverview: (req: Request) => {
    const url = new URL(req.url)
    return json(apiService.getStorageOverview(url.searchParams) as unknown as Json)
  },
  listStorageBuckets: (req: Request) => {
    const url = new URL(req.url)
    return json(apiService.listStorageBuckets(url.searchParams) as unknown as Json)
  },
  listStorageFiles: (req: Request) => {
    const url = new URL(req.url)
    return json(apiService.listFiles(url.searchParams) as unknown as Json)
  },
  listStorageTables: (req: Request) => {
    const url = new URL(req.url)
    return json(apiService.listStorageTables(url.searchParams) as unknown as Json)
  },
  deleteStorageBucket: (req: RouteReq) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id))
      return apiError(400, { error: 'bad_request', message: 'Invalid bucket id' })
    return apiService.deleteStorageBucket(id)
      ? json({ ok: true } as unknown as Json)
      : apiError(404, { error: 'not_found', message: 'Bucket not found' })
  },
  deleteStorageFile: (req: RouteReq) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id))
      return apiError(400, { error: 'bad_request', message: 'Invalid file id' })
    return apiService.deleteStorageFile(id)
      ? json({ ok: true } as unknown as Json)
      : apiError(404, { error: 'not_found', message: 'File not found' })
  },
  deleteStorageTable: (req: RouteReq) => {
    const id = Number(req.params.id)
    if (!Number.isFinite(id))
      return apiError(400, { error: 'bad_request', message: 'Invalid table id' })
    return apiService.deleteStorageTable(id)
      ? json({ ok: true } as unknown as Json)
      : apiError(404, { error: 'not_found', message: 'Table not found' })
  },
}
