export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type ApiErrorShape = {
  error: string
  message?: string
  details?: unknown
}

export type Handler = (ctx: { req: Request; url: URL; params: Record<string, string> }) => Promise<Response> | Response
