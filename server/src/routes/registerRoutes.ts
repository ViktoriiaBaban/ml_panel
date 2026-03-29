import { controllers } from '../controllers/apiControllers'
import { Router } from '../helpers/router'

export function registerRoutes(router: Router) {
  router.on('GET', '/api/health', controllers.health)
  router.on('GET', '/api/projects', controllers.listProjects)
  router.on('GET', '/api/projects/:id/pipelines', controllers.listProjectPipelines)
  router.on('GET', '/api/pipelines', controllers.listPipelines)
  router.on('GET', '/api/storage/files', controllers.listStorageFiles)
  router.on('GET', '/api/inference/services', controllers.listInferenceServices)
  router.on('GET', '/api/inference/services/:id', controllers.getInferenceService)
  router.on('GET', '/api/inference/services/:id/monitoring', controllers.getInferenceMonitoring)
  router.on('GET', '/api/etl/flows', controllers.listEtlFlows)
  router.on('GET', '/api/etl/flows/:id', controllers.getEtlFlow)
  router.on('GET', '/api/etl/flows/:id/variables', controllers.getFlowVariables)
  router.on('PATCH', '/api/etl/flows/:id/variables/:key', controllers.updateFlowVariable)
  router.on('GET', '/api/etl/flows/:id/components', controllers.getFlowComponents)
  router.on('GET', '/api/etl/flows/:id/history', controllers.getFlowHistory)
  router.on('GET', '/api/admin/users', controllers.listUsers)
  router.on('POST', '/api/admin/users', controllers.addUser)
  router.on('PATCH', '/api/admin/users/:id/toggle-status', controllers.toggleUserStatus)
  router.on('DELETE', '/api/admin/users/:id', controllers.deleteUser)
  router.on('GET', '/api/admin/integrations', controllers.listIntegrations)
  router.on('POST', '/api/admin/integrations/:id/check', controllers.checkIntegration)
  router.on('GET', '/api/admin/health-checks', controllers.listHealthChecks)
  router.on('GET', '/api/monitoring/overview', controllers.getMonitoringOverview)
  router.on('GET', '/api/monitoring/alerts', controllers.listAlerts)
}
