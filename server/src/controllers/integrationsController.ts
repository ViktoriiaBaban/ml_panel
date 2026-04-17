import { apiError, json } from '@/helpers/http'
import { apiService } from '@/services/apiService'
import type { Json } from '@/types/http'

export const integrationsController = {
  getSectionRequirements: async () => {
    const sections = await apiService.getSectionRequirements()
    if (!sections) return apiError(404, { error: 'not_found', message: 'User not found' })
    return json({ sections } as unknown as Json)
  },
}
