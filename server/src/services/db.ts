import { alerts, healthChecks, integrations, keyMetrics, servicesStatus } from './fixtures/adminMonitoring'
import { etlFlows, flowComponents, flowHistory, flowVariables } from './fixtures/etl'
import { experiments } from './fixtures/experiments'
import { experimentDetails } from './fixtures/experimentsDetail'
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
  experiments,
  experimentDetails,
  experimentTagsCatalog: [...new Set(experiments.flatMap((item) => item.tags))],
  files,
  buckets,
  tables,
  inferenceServices,
  inferenceMonitoringByServiceId,
  etlFlows,
  flowVariables,
  flowComponents,
  flowHistory,
  integrations,
  healthChecks,
  monitoring: { keyMetrics, servicesStatus, alerts },
}
