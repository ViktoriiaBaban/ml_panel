import type { UserRole } from '@/types/domain'
import { db } from './db'

function getPaging(q: URLSearchParams) {
  const page = Math.max(1, Number(q.get('page') ?? '1') || 1)
  const perPage = Math.max(1, Math.min(100, Number(q.get('perPage') ?? '10') || 10))
  return { page, perPage }
}

function paginate<T>(items: T[], page: number, perPage: number) {
  const total = items.length
  const out = items.slice((page - 1) * perPage, page * perPage)
  return { items: out, total, page, perPage }
}

export const apiService = {
  listProjects(q: URLSearchParams) {
    const search = (q.get('search') ?? '').trim().toLowerCase()
    const status = q.get('status') ?? 'all'
    return db.projects.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      const matchStatus =
        status === 'all' ||
        (status === 'active' && p.pipelineStatus === 'running') ||
        (status === 'errors' && p.pipelineStatus === 'failed')
      return matchSearch && matchStatus
    })
  },
  listExperiments(q: URLSearchParams) {
    const search = (q.get('search') ?? '').trim().toLowerCase()
    const name = (q.get('name') ?? '').trim().toLowerCase()
    const tag = q.get('tag') ?? 'all'
    const project = q.get('project') ?? 'all'
    const sort = (q.get('sort') ?? 'name') as 'name' | 'updatedAt' | 'createdAt'
    const sortDirection = (q.get('sortDirection') ?? 'asc') as 'asc' | 'desc'
    const { page, perPage } = getPaging(q)

    let out = db.experiments.filter((item) => {
      const bySearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.project.toLowerCase().includes(search) ||
        item.tags.some((x) => x.toLowerCase().includes(search))
      const byName = !name || item.name.toLowerCase().includes(name)
      const byTag = tag === 'all' || item.tags.includes(tag)
      const byProject = project === 'all' || item.project === project
      return bySearch && byName && byTag && byProject
    })

    out = [...out].sort((a, b) => {
      const left = a[sort]
      const right = b[sort]
      if (left === right) return 0
      if (left > right) return sortDirection === 'asc' ? 1 : -1
      return sortDirection === 'asc' ? -1 : 1
    })

    const pageData = paginate(out, page, perPage)

    return {
      ...pageData,
      availableTags: [...new Set(db.experiments.flatMap((item) => item.tags))],
      availableProjects: [...new Set(db.experiments.map((item) => item.project))],
    }
  },

  getExperimentDetail(id: number) {
    const experiment = db.experiments.find((item) => item.id === id)
    if (!experiment) return null

    const fallback = {
      id: experiment.id,
      externalId: `exp-${String(experiment.id).padStart(8, '0')}`,
      description: 'Описание эксперимента',
      tags: [...experiment.tags],
      runs: [
        {
          id: experiment.id * 100 + 1,
          name: 'Название запуска',
          startTime: experiment.updatedAt,
          dataset: '--',
          duration: '2.0 c',
          model: 'Название модели',
          status: 'completed' as const,
        },
      ],
      models: [
        {
          id: experiment.id * 1000 + 1,
          name: 'Название модели',
          updatedAt: experiment.updatedAt,
          version: 'model-name-v1.0',
        },
      ],
    }

    const detail = db.experimentDetails[id] ?? fallback

    return {
      id: experiment.id,
      name: experiment.name,
      externalId: detail.externalId,
      createdAt: experiment.createdAt,
      updatedAt: experiment.updatedAt,
      description: detail.description,
      tags: [...detail.tags],
      runs: detail.runs,
      models: detail.models,
      availableTags: [...new Set(db.experiments.flatMap((item) => item.tags))],
    }
  },
  addExperimentTag(id: number, tag: string) {
    const clean = tag.trim().toLowerCase()
    if (!clean) return null
    const experiment = db.experiments.find((item) => item.id === id)
    if (!experiment) return null

    if (!experiment.tags.includes(clean)) experiment.tags.push(clean)

    if (!db.experimentDetails[id]) {
      db.experimentDetails[id] = {
        id,
        externalId: `exp-${String(id).padStart(8, '0')}`,
        description: 'Описание эксперимента',
        tags: [...experiment.tags],
        runs: [],
        models: [],
      }
    }

    if (!db.experimentDetails[id].tags.includes(clean)) {
      db.experimentDetails[id].tags.push(clean)
    }

    return this.getExperimentDetail(id)
  },

  listPipelines(projectId: number | null, q: URLSearchParams) {
    const branch = q.get('branch') ?? 'all'
    const status = q.get('status') ?? 'all'
    return db.pipelines.filter(
      (p) =>
        (projectId === null || p.projectId === projectId) &&
        (branch === 'all' || p.branch === branch) &&
        (status === 'all' || p.status === status)
    )
  },
  listFiles(q: URLSearchParams) {
    const search = (q.get('search') ?? '').trim().toLowerCase()
    const filterType = q.get('type') ?? 'Все типы'
    const sortField = q.get('sortField')
    const sortDirection = (q.get('sortDirection') ?? 'asc') as 'asc' | 'desc'
    const { page, perPage } = getPaging(q)
    let out = db.files.filter(
      (f) =>
        (!search ||
          f.name.toLowerCase().includes(search) ||
          f.project.toLowerCase().includes(search)) &&
        (filterType === 'Все типы' ||
          f.type === filterType ||
          (filterType === 'Датасеты' && f.type === 'Датасет') ||
          (filterType === 'Артефакты' && f.type === 'Артефакт модели'))
    )
    if (sortField)
      out = [...out].sort((a, b) =>
        (a as any)[sortField] > (b as any)[sortField]
          ? sortDirection === 'asc'
            ? 1
            : -1
          : sortDirection === 'asc'
            ? -1
            : 1
      )
    return paginate(out, page, perPage)
  },
  listStorageBuckets(q: URLSearchParams) {
    const search = (q.get('search') ?? '').trim().toLowerCase()
    const { page, perPage } = getPaging(q)
    const out = db.buckets.filter(
      (x) =>
        !search || x.name.toLowerCase().includes(search) || x.project.toLowerCase().includes(search)
    )
    return paginate(out, page, perPage)
  },
  listStorageTables(q: URLSearchParams) {
    const search = (q.get('search') ?? '').trim().toLowerCase()
    const { page, perPage } = getPaging(q)
    const out = db.tables.filter(
      (x) =>
        !search || x.name.toLowerCase().includes(search) || x.type.toLowerCase().includes(search)
    )
    return paginate(out, page, perPage)
  },
  getStorageOverview(q: URLSearchParams) {
    const bucketsLimit = Math.max(1, Number(q.get('bucketsLimit') ?? '5') || 5)
    const filesLimit = Math.max(1, Number(q.get('filesLimit') ?? '5') || 5)
    const tablesLimit = Math.max(1, Number(q.get('tablesLimit') ?? '10') || 10)
    return {
      buckets: db.buckets.slice(0, bucketsLimit),
      files: db.files.slice(0, filesLimit),
      tables: db.tables.slice(0, tablesLimit),
    }
  },
  deleteStorageBucket(id: number) {
    const index = db.buckets.findIndex((x) => x.id === id)
    if (index < 0) return false
    db.buckets.splice(index, 1)
    db.files = db.files.filter((file) => file.bucketId !== id)
    return true
  },
  deleteStorageFile(id: number) {
    const index = db.files.findIndex((x) => x.id === id)
    if (index < 0) return false
    db.files.splice(index, 1)
    return true
  },
  deleteStorageTable(id: number) {
    const index = db.tables.findIndex((x) => x.id === id)
    if (index < 0) return false
    db.tables.splice(index, 1)
    return true
  },
  listInferenceServices: (q: URLSearchParams) =>
    db.inferenceServices.filter((s) => {
      const search = (q.get('search') ?? '').trim().toLowerCase()
      const status = q.get('status') ?? 'all'
      const project = q.get('project') ?? 'all'
      return (
        (!search ||
          s.name.toLowerCase().includes(search) ||
          s.project.toLowerCase().includes(search) ||
          s.model.toLowerCase().includes(search)) &&
        (status === 'all' || s.status === status) &&
        (project === 'all' || s.project === project)
      )
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
  addUser(input: { email: string; name?: string; role?: UserRole; password?: string }) {
    const email = input.email.trim()
    if (!email) return null
    if (!input.password || input.password.length < 8) return null
    const nextId = Math.max(...db.users.map((u) => u.id), 0) + 1
    const name = (input.name ?? '').trim() || email.split('@')[0] || email
    const role: UserRole = input.role ?? 'user'
    const registrationDate = new Date().toISOString().split('T')[0] ?? '—'
    const u = {
      id: nextId,
      email,
      name,
      role,
      status: 'active' as const,
      registrationDate,
      lastLogin: '—',
    }
    db.users.push(u)
    return u
  },
  createInvitationLink(input: { role?: UserRole }) {
    const role: UserRole = input.role ?? 'user'
    const code = Math.random().toString(36).slice(2, 10)
    const createdAt = new Date().toISOString()
    const expiresAtDate = new Date(Date.now() + 5 * 60 * 60 * 1000)
    const expiresAt = expiresAtDate.toISOString()
    db.invitationLinks.push({ code, role, createdAt, expiresAt })
    return { code, role, url: `https://ml-panel.local/register?code=${code}`, createdAt, expiresAt }
  },
  registerByInvitation(input: { code: string; email: string; name?: string; password: string }) {
    const invite = db.invitationLinks.find((item) => item.code === input.code)
    if (!invite) return { error: 'invalid_code' as const }
    if (new Date(invite.expiresAt).getTime() < Date.now()) return { error: 'expired_code' as const }
    const added = this.addUser({
      email: input.email,
      name: input.name,
      role: invite.role,
      password: input.password,
    })
    if (!added) return { error: 'invalid_payload' as const }
    db.invitationLinks = db.invitationLinks.filter((item) => item.code !== input.code)
    return { user: added }
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
  updateUser(id: number, input: { email?: string; name?: string; role?: UserRole }) {
    const user = db.users.find((item) => item.id === id)
    if (!user) return null
    const email = input.email?.trim()
    if (email) user.email = email
    if (typeof input.name === 'string') user.name = input.name.trim()
    if (input.role) user.role = input.role
    return user
  },
  resetUserPassword(id: number, password: string) {
    const user = db.users.find((item) => item.id === id)
    if (!user) return null
    if (!password || password.length < 8) return null
    return { ok: true as const }
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
  getMonitoringOverview: () => ({
    keyMetrics: db.monitoring.keyMetrics,
    servicesStatus: db.monitoring.servicesStatus,
  }),
  listAlerts: (q: URLSearchParams) =>
    db.monitoring.alerts.filter((a) => {
      const search = (q.get('search') ?? '').trim().toLowerCase()
      return (
        !search ||
        a.name.toLowerCase().includes(search) ||
        a.description.toLowerCase().includes(search)
      )
    }),
}
