import { json } from '../helpers/http'
import { apiService } from '../services/apiService'
import type { Json } from '../types/http'

export const storageController = {
  listStorageFiles: (req: Request) => {
    const url = new URL(req.url)
    return json(apiService.listFiles(url.searchParams) as unknown as Json)
  },
}
