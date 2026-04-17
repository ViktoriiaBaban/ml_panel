import { adminController } from '@/controllers/adminController'
import { authController } from '@/controllers/authController'
import { commonController } from '@/controllers/commonController'
import { etlController } from '@/controllers/etlController'
import { experimentsController } from '@/controllers/experimentsController'
import { inferenceController } from '@/controllers/inferenceController'
import { integrationsController } from '@/controllers/integrationsController'
import { monitoringController } from '@/controllers/monitoringController'
import { projectsController } from '@/controllers/projectsController'
import { meController } from '@/controllers/meController'
import { profileController } from '@/controllers/profileController'
import { storageController } from '@/controllers/storageController'
import { withParams, type RouteReq } from '@/helpers/routeReq'

type Handler = (req: RouteReq) => Response | Promise<Response>

export type RouteDef = {
  pattern: string
  methods: Partial<Record<string, Handler>>
}

function r(pattern: string, methods: RouteDef['methods']): RouteDef {
  return { pattern, methods }
}

/** Более специфичные пути выше. */
export const ROUTES: RouteDef[] = [
  r('/api/admin/users/register-by-invitation', { POST: (req) => adminController.registerByInvitation(req) }),
  r('/api/admin/users/invitations', { POST: (req) => adminController.createInvitationLink(req) }),
  r('/api/admin/users/:id/reset-password', { POST: (req) => adminController.resetUserPassword(req) }),
  r('/api/admin/users/:id/toggle-status', { PATCH: (req) => adminController.toggleUserStatus(req) }),
  r('/api/admin/users/:id', {
    PATCH: (req) => adminController.updateUser(req),
    DELETE: (req) => adminController.deleteUser(req),
  }),
  r('/api/admin/users', {
    GET: (_req) => adminController.listUsers(),
    POST: (req) => adminController.addUser(req),
  }),
  r('/api/admin/integrations/:id/check', { POST: (req) => adminController.checkIntegration(req) }),
  r('/api/admin/integrations/:id', { PATCH: (req) => adminController.updateIntegration(req) }),
  r('/api/admin/integrations', { GET: (_req) => adminController.listIntegrations() }),
  r('/api/admin/health-checks', { GET: (_req) => adminController.listHealthChecks() }),

  r('/api/experiments/:id/tags/:tag', { DELETE: (req) => experimentsController.removeTag(req) }),
  r('/api/experiments/:id/tags', { POST: (req) => experimentsController.addTag(req) }),
  r('/api/experiments/:id', { GET: (req) => experimentsController.getExperiment(req) }),
  r('/api/experiments', { GET: (req) => experimentsController.listExperiments(req) }),

  r('/api/projects/:id/pipelines', { GET: (req) => projectsController.listProjectPipelines(req) }),
  r('/api/projects', { GET: (req) => projectsController.listProjects(req) }),
  r('/api/pipelines', { GET: (req) => projectsController.listPipelines(req) }),

  r('/api/storage/overview', { GET: (req) => storageController.getOverview(req) }),
  r('/api/storage/buckets/:id', { DELETE: (req) => storageController.deleteStorageBucket(req) }),
  r('/api/storage/buckets', { GET: (req) => storageController.listStorageBuckets(req) }),
  r('/api/storage/files/:id', { DELETE: (req) => storageController.deleteStorageFile(req) }),
  r('/api/storage/files', { GET: (req) => storageController.listStorageFiles(req) }),
  r('/api/storage/tables/:id', { DELETE: (req) => storageController.deleteStorageTable(req) }),
  r('/api/storage/tables', { GET: (req) => storageController.listStorageTables(req) }),

  r('/api/inference/services/:id/monitoring', { GET: (req) => inferenceController.getMonitoring(req) }),
  r('/api/inference/services/:id', { GET: (req) => inferenceController.getService(req) }),
  r('/api/inference/services', { GET: (req) => inferenceController.listServices(req) }),

  r('/api/etl/flows/:id/variables/:key', { PATCH: (req) => etlController.updateVariable(req) }),
  r('/api/etl/flows/:id/variables', { GET: (req) => etlController.getVariables(req) }),
  r('/api/etl/flows/:id/components', { GET: (req) => etlController.getComponents(req) }),
  r('/api/etl/flows/:id/history', { GET: (req) => etlController.getHistory(req) }),
  r('/api/etl/flows/:id', { GET: (req) => etlController.getFlow(req) }),
  r('/api/etl/flows', { GET: (req) => etlController.listFlows(req) }),

  r('/api/monitoring/overview', { GET: (_req) => monitoringController.overview() }),
  r('/api/monitoring/alerts', { GET: (req) => monitoringController.listAlerts(req) }),

  r('/api/auth/login', { POST: (req) => authController.login(req) }),

  r('/api/me', { GET: (_req) => meController.getMe() }),

  r('/api/profile/settings', {
    GET: (_req) => profileController.getSettings(),
    PATCH: (req) => profileController.updateSettings(req),
  }),
  r('/api/profile/password', { PATCH: (req) => profileController.changePassword(req) }),
  r('/api/profile/delete-account', { POST: (req) => profileController.deleteAccount(req) }),
  r('/api/profile/connections', { POST: (req) => profileController.upsertConnection(req) }),
  r('/api/integrations/section-requirements', { GET: (_req) => integrationsController.getSectionRequirements() }),

  r('/api/health', { GET: (_req) => commonController.health() }),
]

export function matchPattern(pattern: string, pathname: string): Record<string, string> | null {
  const a = pattern.split('/').filter(Boolean)
  const b = pathname.split('/').filter(Boolean)
  if (a.length !== b.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < a.length; i++) {
    const seg = a[i]!
    const val = b[i]!
    if (seg.startsWith(':')) params[seg.slice(1)] = decodeURIComponent(val)
    else if (seg !== val) return null
  }
  return params
}

export async function runMatchedRoute(req: Request, method: string, pathname: string): Promise<Response | null> {
  for (const route of ROUTES) {
    const params = matchPattern(route.pattern, pathname)
    if (!params) continue
    const handler = route.methods[method]
    if (!handler) continue
    return await Promise.resolve(handler(withParams(req, params)))
  }
  return null
}
