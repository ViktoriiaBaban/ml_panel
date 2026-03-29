import type { ApiErrorShape, Json } from '../types/http'

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

export function withCors(req: Request, res: Response) {
  const origin = req.headers.get('origin') ?? '*'
  const headers = new Headers(res.headers)
  headers.set('access-control-allow-origin', origin)
  headers.set('access-control-allow-credentials', 'true')
  headers.set('access-control-allow-methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  headers.set('access-control-allow-headers', req.headers.get('access-control-request-headers') ?? 'content-type')
  headers.set('vary', 'origin')
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
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
