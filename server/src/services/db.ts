import {
  alerts,
  healthChecks,
  integrations,
  keyMetrics,
  servicesStatus,
  users,
} from './fixtures/adminMonitoring'
import { etlFlows, flowComponents, flowHistory, flowVariables } from './fixtures/etl'
import { pipelines, projects } from './fixtures/projectsPipelines'
import {
  buckets,
  files,
  inferenceMonitoringByServiceId,
  inferenceServices,
  tables,
} from './fixtures/storageInference'

export const db = {
  projects,
  pipelines,
  files,
  buckets,
  tables,
  inferenceServices,
  inferenceMonitoringByServiceId,
  etlFlows,
  flowVariables,
  flowComponents,
  flowHistory,
  users,
  integrations,
  healthChecks,
  invitationLinks: [] as Array<{
    code: string
    role: 'user' | 'admin'
    expiresAt: string
    createdAt: string
  }>,
  monitoring: { keyMetrics, servicesStatus, alerts },
}
