import type { Handler } from '../types/http'

type RouteMatch = { params: Record<string, string> }

export class Router {
  private routes: Array<{ method: string; pattern: RegExp; keys: string[]; handler: Handler }> = []

  on(method: string, pathPattern: string, handler: Handler) {
    const { regex, keys } = this.compile(pathPattern)
    this.routes.push({ method: method.toUpperCase(), pattern: regex, keys, handler })
    return this
  }

  match(method: string, pathname: string): { handler: Handler; match: RouteMatch } | null {
    const m = method.toUpperCase()
    for (const r of this.routes) {
      if (r.method !== m) continue
      const hit = r.pattern.exec(pathname)
      if (!hit) continue
      const params: Record<string, string> = {}
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(hit[i + 1] ?? '')))
      return { handler: r.handler, match: { params } }
    }
    return null
  }

  private compile(pathPattern: string) {
    const keys: string[] = []
    const escaped = pathPattern
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\:([A-Za-z0-9_]+)/g, (_m, key: string) => {
        keys.push(key)
        return '([^/]+)'
      })
    const regex = new RegExp('^' + escaped + '$')
    return { regex, keys }
  }
}
