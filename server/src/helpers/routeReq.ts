export type RouteReq = Request & { params: Record<string, string> }

export function withParams(req: Request, params: Record<string, string>): RouteReq {
  return Object.assign(req, { params }) as RouteReq
}
