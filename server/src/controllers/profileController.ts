import { apiError, json, readJson } from '@/helpers/http'
import { apiService } from '@/services/apiService'
import type { Json } from '@/types/http'

export const profileController = {
  getSettings: async () => {
    const data = await apiService.getProfileSettings()
    return data ? json(data as unknown as Json) : apiError(404, { error: 'not_found', message: 'Profile not found' })
  },
  updateSettings: async (req: Request) => {
    const body = await readJson<{ name?: string; email?: string }>(req)
    const updated = await apiService.updateProfileSettings(body ?? {})
    return updated ? json(updated as unknown as Json) : apiError(404, { error: 'not_found', message: 'Profile not found' })
  },
  changePassword: async (req: Request) => {
    const body = await readJson<{ currentPassword?: string; newPassword?: string }>(req)
    const result = await apiService.changeProfilePassword({
      currentPassword: body?.currentPassword ?? '',
      newPassword: body?.newPassword ?? '',
    })
    if (result.error === 'not_found') return apiError(404, { error: 'not_found', message: 'Profile not found' })
    if (result.error === 'wrong_password')
      return apiError(400, { error: 'bad_request', message: 'Неверный текущий пароль' })
    if (result.error === 'weak_password')
      return apiError(400, { error: 'bad_request', message: 'Новый пароль должен быть не короче 8 символов' })
    return json({ ok: true } as unknown as Json)
  },
  deleteAccount: async (req: Request) => {
    const body = await readJson<{ password?: string }>(req)
    const result = await apiService.deleteProfileAccount(body?.password ?? '')
    if (result.error === 'not_found') return apiError(404, { error: 'not_found', message: 'Profile not found' })
    if (result.error === 'wrong_password')
      return apiError(400, { error: 'bad_request', message: 'Неверный пароль' })
    return json({ ok: true } as unknown as Json)
  },
  upsertConnection: async (req: Request) => {
    const body = await readJson<{ serviceId?: string; username?: string; token?: string }>(req)
    const updated = await apiService.upsertProfileConnection({
      serviceId: body?.serviceId ?? '',
      username: body?.username,
      token: body?.token,
    })
    return updated
      ? json(updated as unknown as Json)
      : apiError(400, { error: 'bad_request', message: 'serviceId, username and token are required' })
  },
}

