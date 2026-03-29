import { apiError, withCors } from './helpers/http'
import { Router } from './helpers/router'
import { registerRoutes } from './routes/registerRoutes'

const router = new Router()
registerRoutes(router)

const port = Number(process.env.PORT ?? '3001') || 3001
const server = Bun.serve({
  port,
  fetch: async (req) => {
    const url = new URL(req.url)
    if (req.method === 'OPTIONS') return withCors(req, new Response(null, { status: 204 }))
    const match = router.match(req.method, url.pathname)
    const res = match
      ? await match.handler({ req, url, params: match.match.params })
      : apiError(404, { error: 'not_found', message: 'Route not found', details: { path: url.pathname } })
    return withCors(req, res)
  },
})

console.log(`Fake API listening on http://localhost:${server.port}`)
