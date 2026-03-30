import { routes } from '@/routes/apiRoutes'

const port = Number(process.env.PORT ?? '3001') || 3001

const server = Bun.serve({
  port,
  routes,
  fetch() {
    return new Response('Not Found', { status: 404 })
  },
})

console.log(`Fake API listening on http://localhost:${server.port}`)
