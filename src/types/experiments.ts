export type Experiment = {
  id: number
  name: string
  tags: string[]
  updatedAt: string
  createdAt: string
  project: string
}

export type ExperimentRun = {
  id: number
  name: string
  startTime: string
  dataset: string
  duration: string
  model: string
  status: 'completed' | 'running'
}

export type ExperimentModel = {
  id: number
  name: string
  updatedAt: string
  version: string
}

export type ExperimentDetailResponse = {
  id: number
  name: string
  externalId: string
  createdAt: string
  updatedAt: string
  description: string
  tags: string[]
  availableTags: string[]
  runs: ExperimentRun[]
  models: ExperimentModel[]
}

export type ExperimentsResponse = {
  items: Experiment[]
  total: number
  page: number
  perPage: number
  availableTags: string[]
  availableProjects: string[]
}

export type ExperimentsQuery = {
  search?: string
  page?: number
  perPage?: number
  sort?: 'name' | 'updatedAt' | 'createdAt'
  sortDirection?: 'asc' | 'desc'
  name?: string
  tag?: string
  project?: string
}
