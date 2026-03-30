export type Section =
  | 'storage'
  | 'projects'
  | 'home'
  | 'experiments'
  | 'inference'
  | 'etl'
  | 'monitoring'
  | 'settings'
  | 'administration'

export type ProjectsSubView = 'list' | 'pipelines'
export type InferenceSubView = 'list' | 'monitoring'
export type EtlSubView = 'list' | 'detail'
