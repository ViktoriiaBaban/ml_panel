import type { ApiErrorShape, Json } from '@/types/http'

export function json(data: Json, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init?.headers ?? {}),
    },
  })
}

export function apiError(status: number, payload: ApiErrorShape) {
  return json(payload as unknown as Json, { status })
}

export async function readJson<T>(req: Request): Promise<T | null> {
  const ct = req.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) return null
  try {
    return (await req.json()) as T
  } catch {
    return null
  }
}
