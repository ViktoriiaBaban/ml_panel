import { json } from '@/helpers/http'
import { apiService } from '@/services/apiService'
import type { Json } from '@/types/http'

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
}
