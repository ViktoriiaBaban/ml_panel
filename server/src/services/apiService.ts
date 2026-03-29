import type { UserRole } from '../types/domain'
import { db } from './db'

export const apiService = {
  listProjects(q: URLSearchParams) {
    const search = (q.get('search') ?? '').trim().toLowerCase()
    const status = q.get('status') ?? 'all'
    return db.projects.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)
      const matchStatus = status === 'all' || (status === 'active' && p.pipelineStatus === 'running') || (status === 'errors' && p.pipelineStatus === 'failed')
      return matchSearch && matchStatus
    })
  },
  listPipelines(projectId: number | null, q: URLSearchParams) {
    const branch = q.get('branch') ?? 'all'
    const status = q.get('status') ?? 'all'
    return db.pipelines.filter((p) => (projectId === null || p.projectId === projectId) && (branch === 'all' || p.branch === branch) && (status === 'all' || p.status === status))
  },
  listFiles(q: URLSearchParams) {
    const search = (q.get('search') ?? '').trim().toLowerCase()
    const filterType = q.get('type') ?? 'Все типы'
    const sortField = q.get('sortField')
    const sortDirection = (q.get('sortDirection') ?? 'asc') as 'asc' | 'desc'
    const page = Math.max(1, Number(q.get('page') ?? '1') || 1)
    const perPage = Math.max(1, Math.min(100, Number(q.get('perPage') ?? '10') || 10))
    let out = db.files.filter((f) => (!search || f.name.toLowerCase().includes(search) || f.project.toLowerCase().includes(search)) && (filterType === 'Все типы' || f.type === filterType || (filterType === 'Датасеты' && f.type === 'Датасет') || (filterType === 'Артефакты' && f.type === 'Артефакт модели')))
    if (sortField) out = [...out].sort((a, b) => ((a as any)[sortField] > (b as any)[sortField] ? (sortDirection === 'asc' ? 1 : -1) : sortDirection === 'asc' ? -1 : 1))
    const total = out.length
    const items = out.slice((page - 1) * perPage, page * perPage)
    return { items, total, page, perPage }
  },
  listInferenceServices: (q: URLSearchParams) => db.inferenceServices.filter((s) => {
    const search = (q.get('search') ?? '').trim().toLowerCase()
    const status = q.get('status') ?? 'all'
    const project = q.get('project') ?? 'all'
    return (!search || s.name.toLowerCase().includes(search) || s.project.toLowerCase().includes(search) || s.model.toLowerCase().includes(search)) && (status === 'all' || s.status === status) && (project === 'all' || s.project === project)
  }),
  getInferenceService: (id: number) => db.inferenceServices.find((s) => s.id === id) ?? null,
  getInferenceMonitoring: (id: number) => db.inferenceMonitoringByServiceId[id] ?? null,
  listEtlFlows: () => db.etlFlows,
  getEtlFlow: (id: number) => db.etlFlows.find((f) => f.id === id) ?? null,
  getFlowVariables: (id: number) => db.flowVariables[id] ?? [],
  updateFlowVariable(flowId: number, key: string, value: string) {
    const v = (db.flowVariables[flowId] ?? []).find((x) => x.key === key)
    if (!v) return null
    v.value = value
    return v
  },
  getFlowComponents: (id: number) => db.flowComponents[id] ?? [],
  getFlowHistory: (id: number) => db.flowHistory[id] ?? [],
  listUsers: () => db.users,
  addUser(input: { email: string; name?: string; role?: UserRole }) {
    const email = input.email.trim()
    if (!email) return null
    const nextId = Math.max(...db.users.map((u) => u.id), 0) + 1
    const name = (input.name ?? '').trim() || email.split('@')[0] || email
    const role: UserRole = input.role ?? 'user'
    const registrationDate = new Date().toISOString().split('T')[0] ?? '—'
    const u = { id: nextId, email, name, role, status: 'active' as const, registrationDate, lastLogin: '—' }
    db.users.push(u)
    return u
  },
  toggleUserStatus(id: number) {
    const u = db.users.find((x) => x.id === id)
    if (!u) return null
    u.status = u.status === 'active' ? 'blocked' : 'active'
    return u
  },
  deleteUser(id: number) {
    const idx = db.users.findIndex((u) => u.id === id)
    if (idx < 0) return false
    db.users.splice(idx, 1)
    return true
  },
  listIntegrations: () => db.integrations,
  listHealthChecks: () => db.healthChecks,
  checkIntegration(id: string) {
    const i = db.integrations.find((x) => x.id === id)
    if (!i) return null
    i.status = Math.random() > 0.3 ? 'working' : 'warning'
    i.lastCheck = new Date().toLocaleString('ru-RU').replace(',', '')
    return i
  },
  getMonitoringOverview: () => ({ keyMetrics: db.monitoring.keyMetrics, servicesStatus: db.monitoring.servicesStatus }),
  listAlerts: (q: URLSearchParams) => db.monitoring.alerts.filter((a) => {
    const search = (q.get('search') ?? '').trim().toLowerCase()
    return !search || a.name.toLowerCase().includes(search) || a.description.toLowerCase().includes(search)
  }),
}
