import { handleApiRequest } from '@/http/apiFetch'

const port = Number(process.env.PORT ?? '3001') || 3001

const server = Bun.serve({
  port,
  async fetch(req) {
    return handleApiRequest(req)
  },
})

console.log(`Fake API listening on http://localhost:${server.port}`)
