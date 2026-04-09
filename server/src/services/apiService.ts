import { requireAuthContext } from '@/auth/context'
import type { UserRole } from '@/types/domain'
import { db } from './db'
import { integrationStore } from './integrationStore'
import { userStore } from './userStore'

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
      availableTags: [...db.experimentTagsCatalog],
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
      availableTags: [...db.experimentTagsCatalog],
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

    if (!db.experimentTagsCatalog.includes(clean)) db.experimentTagsCatalog.push(clean)

    return this.getExperimentDetail(id)
  },


  removeExperimentTag(id: number, tag: string) {
    const clean = decodeURIComponent(tag).trim().toLowerCase()
    if (!clean) return null
    const experiment = db.experiments.find((item) => item.id === id)
    if (!experiment) return null

    experiment.tags = experiment.tags.filter((value) => value !== clean)

    if (db.experimentDetails[id]) {
      db.experimentDetails[id].tags = db.experimentDetails[id].tags.filter((value) => value !== clean)
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
  async authenticate(email: string, password: string) {
    const u = await userStore.authenticate(email, password)
    if (!u) return null
    const user = await userStore.getMeById(u.id)
    return user ? { user } : null
  },

  getMe() {
    const { userId } = requireAuthContext()
    return userStore.getMeById(userId)
  },
  async listUsers() {
    return userStore.listPublicUsers()
  },
  async addUser(input: { email: string; name?: string; role?: UserRole; password: string }) {
    return userStore.addUser(input)
  },
  async createInvitationLink(input: { role?: UserRole }) {
    return userStore.createInvitationLink(input)
  },
  async registerByInvitation(input: { code: string; email: string; name?: string; password: string }) {
    return userStore.registerByInvitation(input)
  },
  async toggleUserStatus(id: number) {
    return userStore.toggleUserStatus(id)
  },
  async deleteUser(id: number) {
    return userStore.deleteUser(id)
  },
  async updateUser(id: number, input: { email?: string; name?: string; role?: UserRole; jobTitle?: string }) {
    return userStore.updateUser(id, input)
  },
  async resetUserPassword(id: number, password: string) {
    return userStore.resetUserPassword(id, password)
  },
  async listIntegrations() {
    return integrationStore.listIntegrations()
  },
  async updateIntegration(id: string, payload: { baseUrl?: string; healthCheckPath?: string; version?: string }) {
    if (!payload.baseUrl?.trim()) return null
    const updated = await integrationStore.saveIntegrationConfig({
      id,
      baseUrl: payload.baseUrl,
      healthCheckPath: payload.healthCheckPath,
      version: payload.version,
    })
    return updated.find((item) => item.id === id) ?? null
  },
  async listHealthChecks() {
    const integrations = await integrationStore.listIntegrations()
    return integrations.map((item) => ({
      name: item.name,
      command: item.connected
        ? `GET ${item.details?.url}${item.healthCheckPath ?? ''}`
        : 'Не настроено. Сначала подключите сервис.',
    }))
  },
  async checkIntegration(id: string) {
    const updated = await integrationStore.checkIntegration(id)
    return updated?.find((item) => item.id === id) ?? null
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
  getProfileSettings() {
    const { userId } = requireAuthContext()
    return userStore.getProfileByUserId(userId)
  },
  updateProfileSettings(payload: { name?: string; email?: string }) {
    const { userId } = requireAuthContext()
    return userStore.updateProfileByUserId(userId, payload)
  },
  changeProfilePassword(payload: { currentPassword: string; newPassword: string }) {
    const { userId } = requireAuthContext()
    return userStore.changePasswordByUserId(userId, payload)
  },
  deleteProfileAccount(password: string) {
    const { userId } = requireAuthContext()
    return userStore.deleteAccountByUserId(userId, password)
  },
  upsertProfileConnection(payload: { serviceId: string; username?: string; token?: string }) {
    if (!payload.serviceId || !payload.username?.trim() || !payload.token?.trim()) return null
    const { userId } = requireAuthContext()
    return userStore.upsertConnectionByUserId(userId, {
      serviceId: payload.serviceId,
      username: payload.username!,
      token: payload.token!,
    })
  },
}
