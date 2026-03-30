export type PipelineStatus = 'success' | 'failed' | 'running' | 'partial'
export type StageStatus = 'success' | 'failed' | 'running' | 'pending' | 'warning'
export type ProjectType = 'training' | 'inference' | 'etl'
export type ServiceStatus = 'running' | 'stopped' | 'error'
export type FlowStatus = 'running' | 'stopped' | 'error'
export type UserRole = 'user' | 'admin'
export type UserStatus = 'active' | 'blocked'
export type IntegrationStatus = 'working' | 'warning' | 'error'
export type AlertState = 'firing' | 'ok' | 'pending'
export type AlertSeverity = 'critical' | 'warning' | 'info'

export type Project = {
  id: number
  name: string
  description: string
  namespace: string
  lastCommit: { author: string; time: string }
  pipelineStatus: Exclude<PipelineStatus, 'partial'>
  types: ProjectType[]
}

export type PipelineStage = {
  name: string
  status: StageStatus
  duration?: string
  mlflowRun?: string
  bentoService?: string
  nifiFlow?: string
}

export type Pipeline = {
  id: number
  projectId: number
  pipelineId: string
  branch: string
  tag?: string
  author: string
  startTime: string
  stages: PipelineStage[]
  duration: string
  status: PipelineStatus
}

export type StorageFileType = 'Разметка' | 'Датасет' | 'Артефакт модели'
export type StorageFile = { id: number; name: string; type: StorageFileType; size: string; date: string; project: string }

export type InferenceService = {
  id: number
  name: string
  project: string
  model: string
  endpoint: string
  version: string
  status: ServiceStatus
  rps: number
  latencyP95: number
  errorRate: number
}

export type InferenceRecentCall = { id: number; time: string; latency: number; status: 'success' | 'error' }
export type InferenceLogItem = { id: number; timestamp: string; level: 'ERROR' | 'WARNING' | 'INFO'; message: string }
export type InferenceChart = { title: string; color: string; data: Array<{ pct: number }> }
export type InferenceRelatedSystem = { icon: 'RefreshCw' | 'Database' | 'FlaskConical'; name: string; desc: string }
export type InferenceServiceMonitoring = {
  recentCalls: InferenceRecentCall[]
  logs: InferenceLogItem[]
  charts: InferenceChart[]
  modelArtifacts: string[]
  relatedSystems: InferenceRelatedSystem[]
}

export type EtlFlow = {
  id: number
  name: string
  status: FlowStatus
  processGroups: number
  activeThreads: number
  queuedItems: number
  throughput: number
  lastUpdated: string
  source: string
  destination: string
  owner: string
  schedule: string
  description: string
}

export type FlowVariable = { key: string; value: string; description: string }
export type FlowComponent = { id: number; name: string; type: string; status: string; threadsActive: number; tasksCompleted: number }
export type FlowHistoryItem = { id: number; timestamp: string; action: string; user: string; status: 'success' | 'error' }

export type User = { id: number; email: string; name: string; role: UserRole; status: UserStatus; registrationDate: string; lastLogin: string }
export type Integration = {
  id: string
  name: string
  status: IntegrationStatus
  lastCheck: string
  details?: { url?: string; version?: string; error?: string; lastSuccessfulCall?: string }
}

export type HealthCheck = { name: string; command: string }

export type MonitoringMetric = { label: string; value: string; sub: string; trend: 'up' | 'down' }
export type MonitoringServiceUptime = { name: string; status: number }
export type Alert = { id: number; name: string; status: string; state: AlertState; severity: AlertSeverity; lastChanged: string; description: string }
