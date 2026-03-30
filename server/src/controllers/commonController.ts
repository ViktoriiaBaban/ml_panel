import { json } from '../helpers/http'
import type { Json } from '../types/http'

export const commonController = {
  health: () => json({ ok: true } as unknown as Json),
}
