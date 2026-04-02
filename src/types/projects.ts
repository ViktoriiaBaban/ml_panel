export type ProjectType = 'training' | 'inference' | 'etl'
export type PipelineStatus = 'success' | 'failed' | 'running'

export type Project = {
  id: number
  name: string
  description: string
  namespace: string
  lastCommit: { author: string; time: string }
  pipelineStatus: PipelineStatus
  types: ProjectType[]
}

export type ProjectsQuery = {
  search?: string
  status?: 'all' | 'active' | 'errors'
}

export type StatusOption = {
  label: string
  value: Required<ProjectsQuery>['status']
}

export type PipelineStatusConfig = {
  label: string
  chipColor: string
  icon: string
}

export type ProjectTypeConfig = {
  icon: string
  label: string
  iconColor: string
}

export type StageStatus = 'success' | 'failed' | 'running' | 'pending' | 'warning'

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

export type PipelinesQuery = {
  projectId?: number | null
  branch?: string
  status?: string
}