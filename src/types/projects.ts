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
