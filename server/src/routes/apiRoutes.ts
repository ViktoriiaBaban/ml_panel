import { adminController } from '@/controllers/adminController'
import { commonController } from '@/controllers/commonController'
import { etlController } from '@/controllers/etlController'
import { inferenceController } from '@/controllers/inferenceController'
import { monitoringController } from '@/controllers/monitoringController'
import { projectsController } from '@/controllers/projectsController'
import { storageController } from '@/controllers/storageController'

const projectRoutes = {
  '/api/projects': { GET: projectsController.listProjects },
  '/api/projects/:id/pipelines': { GET: projectsController.listProjectPipelines },
  '/api/pipelines': { GET: projectsController.listPipelines },
}

const storageRoutes = {
  '/api/storage/files': { GET: storageController.listStorageFiles },
}

const inferenceRoutes = {
  '/api/inference/services': { GET: inferenceController.listServices },
  '/api/inference/services/:id': { GET: inferenceController.getService },
  '/api/inference/services/:id/monitoring': { GET: inferenceController.getMonitoring },
}

const etlRoutes = {
  '/api/etl/flows': { GET: etlController.listFlows },
  '/api/etl/flows/:id': { GET: etlController.getFlow },
  '/api/etl/flows/:id/variables': { GET: etlController.getVariables },
  '/api/etl/flows/:id/variables/:key': { PATCH: etlController.updateVariable },
  '/api/etl/flows/:id/components': { GET: etlController.getComponents },
  '/api/etl/flows/:id/history': { GET: etlController.getHistory },
}

const adminRoutes = {
  '/api/admin/users': { GET: adminController.listUsers, POST: adminController.addUser },
  '/api/admin/users/:id/toggle-status': { PATCH: adminController.toggleUserStatus },
  '/api/admin/users/:id': { DELETE: adminController.deleteUser },
  '/api/admin/integrations': { GET: adminController.listIntegrations },
  '/api/admin/integrations/:id/check': { POST: adminController.checkIntegration },
  '/api/admin/health-checks': { GET: adminController.listHealthChecks },
}

const monitoringRoutes = {
  '/api/monitoring/overview': { GET: monitoringController.overview },
  '/api/monitoring/alerts': { GET: monitoringController.listAlerts },
}

export const routes = {
  '/api/status': new Response('OK'),
  '/api/health': { GET: commonController.health },
  ...projectRoutes,
  ...storageRoutes,
  ...inferenceRoutes,
  ...etlRoutes,
  ...adminRoutes,
  ...monitoringRoutes,
  '/api/*': Response.json({ message: 'Not found' }, { status: 404 }),
}
