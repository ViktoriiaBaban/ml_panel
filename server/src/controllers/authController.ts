import { apiError, json, readJson } from '@/helpers/http'
import { signAccessToken } from '@/auth/jwt'
import { apiService } from '@/services/apiService'
import type { Json } from '@/types/http'

export const authController = {
  login: async (req: Request) => {
    const body = await readJson<{ email?: string; password?: string }>(req)
    if (!body?.email?.trim() || !body?.password) {
      return apiError(400, { error: 'bad_request', message: 'Укажите email и пароль' })
    }
    const result = await apiService.authenticate(body.email, body.password)
    if (!result) {
      return apiError(401, { error: 'unauthorized', message: 'Неверный email или пароль' })
    }
    const token = await signAccessToken(result.user.id)
    return json({ token, user: result.user } as unknown as Json, { status: 200 })
  },
}
