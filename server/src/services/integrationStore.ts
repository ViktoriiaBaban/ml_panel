import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import type { Integration } from '@/types/domain'

type StoredIntegration = {
  id: string
  baseUrl: string
  healthCheckPath?: string
  version?: string
  description?: string
  status: Integration['status']
  lastCheck: string
  lastSuccessfulCall?: string
  error?: string
}

const FILE_PATH = resolve(process.cwd(), 'data', 'integrations.json')

const DEFAULT_INTEGRATIONS: Integration[] = [
  {
    id: 'gitlab',
    name: 'GitLab CE',
    description: 'Хранилище кода и CI/CD',
    connected: false,
    status: 'not_connected',
    lastCheck: '—',
  },
  {
    id: 'mlflow',
    name: 'MLflow Tracking Server',
    description: 'Трекинг экспериментов и метрик',
    connected: false,
    status: 'not_connected',
    lastCheck: '—',
  },
  {
    id: 'minio',
    name: 'Minio (Object Storage)',
    description: 'Хранилище артефактов и датасетов',
    connected: false,
    status: 'not_connected',
    lastCheck: '—',
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description: 'Мониторинг и дашборды',
    connected: false,
    status: 'not_connected',
    lastCheck: '—',
  },
  {
    id: 'nifi',
    name: 'Apache NiFi',
    description: 'Оркестрация и маршрутизация ETL-потоков',
    connected: false,
    status: 'not_connected',
    lastCheck: '—',
  },
  {
    id: 'clickhouse',
    name: 'ClickHouse',
    description: 'Аналитическое хранилище',
    connected: false,
    status: 'not_connected',
    lastCheck: '—',
  },
]

let initialized = false

async function ensureFile() {
  if (initialized) return
  await mkdir(dirname(FILE_PATH), { recursive: true })
  const file = Bun.file(FILE_PATH)
  if (!(await file.exists())) {
    await Bun.write(FILE_PATH, JSON.stringify([], null, 2))
  }
  initialized = true
}

async function readStoredIntegrations(): Promise<StoredIntegration[]> {
  await ensureFile()
  try {
    const raw = await Bun.file(FILE_PATH).text()
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as StoredIntegration[]) : []
  } catch {
    return []
  }
}

async function writeStoredIntegrations(items: StoredIntegration[]) {
  await ensureFile()
  await Bun.write(FILE_PATH, JSON.stringify(items, null, 2))
}

function mapToPublic(entry: StoredIntegration, fallback: Integration): Integration {
  return {
    ...fallback,
    description: entry.description ?? fallback.description,
    connected: true,
    status: entry.status,
    lastCheck: entry.lastCheck || '—',
    healthCheckPath: entry.healthCheckPath,
    details: {
      url: entry.baseUrl,
      version: entry.version,
      error: entry.error,
      lastSuccessfulCall: entry.lastSuccessfulCall,
    },
  }
}

function nowRu() {
  return new Date().toLocaleString('ru-RU').replace(',', '')
}

function normalizePath(path?: string) {
  if (!path) return undefined
  const clean = path.trim()
  if (!clean) return undefined
  return clean.startsWith('/') ? clean : `/${clean}`
}

export const integrationStore = {
  async listIntegrations(): Promise<Integration[]> {
    const stored = await readStoredIntegrations()
    return DEFAULT_INTEGRATIONS.map((item) => {
      const match = stored.find((storedItem) => storedItem.id === item.id)
      if (!match) return item
      return mapToPublic(match, item)
    })
  },
  async saveIntegrationConfig(input: { id: string; baseUrl: string; healthCheckPath?: string; version?: string; description?: string }) {
    const stored = await readStoredIntegrations()
    const idx = stored.findIndex((item) => item.id === input.id)
    const baseUrl = input.baseUrl.trim().replace(/\/+$/, '')
    const next: StoredIntegration = {
      id: input.id,
      baseUrl,
      healthCheckPath: normalizePath(input.healthCheckPath),
      version: input.version?.trim() || undefined,
      description: input.description?.trim() || undefined,
      status: 'warning',
      lastCheck: '—',
    }
    if (idx >= 0) {
      const prev = stored[idx]
      stored[idx] = {
        ...prev,
        ...next,
        status: prev.status === 'not_connected' ? 'warning' : prev.status,
      }
    } else {
      stored.push(next)
    }
    await writeStoredIntegrations(stored)
    return this.listIntegrations()
  },
  async removeIntegrationConfig(id: string) {
    const stored = await readStoredIntegrations()
    const next = stored.filter((item) => item.id !== id)
    if (next.length === stored.length) return false
    await writeStoredIntegrations(next)
    return true
  },
  async checkIntegration(id: string) {
    const stored = await readStoredIntegrations()
    const target = stored.find((item) => item.id === id)
    if (!target) return null
    const endpoint = `${target.baseUrl}${target.healthCheckPath ?? ''}`
    const now = nowRu()
    try {
      const response = await fetch(endpoint, { method: 'GET' })
      target.lastCheck = now
      if (response.ok) {
        target.status = 'working'
        target.error = undefined
        target.lastSuccessfulCall = now
      } else {
        target.status = 'error'
        target.error = `HTTP ${response.status}`
      }
    } catch (error) {
      target.lastCheck = now
      target.status = 'error'
      target.error = error instanceof Error ? error.message : 'Сервис недоступен'
    }
    await writeStoredIntegrations(stored)
    return this.listIntegrations()
  },
}
