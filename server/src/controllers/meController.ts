import { apiError, json } from '@/helpers/http'
import { apiService } from '@/services/apiService'
import type { Json } from '@/types/http'

export const meController = {
  getMe: async () => {
    const me = await apiService.getMe()
    return me ? json(me as unknown as Json) : apiError(404, { error: 'not_found', message: 'User not found' })
  },
}
