export type StageStatus = 'success' | 'failed' | 'running' | 'pending' | 'warning'
export type PipelineStatus = 'success' | 'failed' | 'running' | 'partial'

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

export type PipelineFilterItem = {
  label: string
  value: string
}

export const pipelineStatusConfig: Record<PipelineStatus, { label: string; chipColor: string }> = {
  success: { label: 'Успешен', chipColor: 'success' },
  failed: { label: 'Ошибка', chipColor: 'error' },
  running: { label: 'В процессе', chipColor: 'info' },
  partial: { label: 'Частичный успех', chipColor: 'warning' },
}

export const stageStatusConfig: Record<StageStatus, { icon: string; color: string; label: string }> = {
  success: { icon: 'mdi-check', color: 'success', label: 'Успешно' },
  failed: { icon: 'mdi-close', color: 'error', label: 'Ошибка' },
  running: { icon: 'mdi-refresh', color: 'info', label: 'В процессе' },
  pending: { icon: 'mdi-pause', color: 'grey', label: 'Ожидание' },
  warning: { icon: 'mdi-alert', color: 'warning', label: 'Предупреждение' },
}

export const stageBadgeClassMap: Record<StageStatus, string> = {
  success: 'stage-chip--success',
  failed: 'stage-chip--failed',
  running: 'stage-chip--running',
  warning: 'stage-chip--warning',
  pending: 'stage-chip--pending',
}

export const pipelineStatusItems: PipelineFilterItem[] = [
  { label: 'Все статусы', value: 'all' },
  { label: 'Успешные', value: 'success' },
  { label: 'Ошибки', value: 'failed' },
  { label: 'В процессе', value: 'running' },
  { label: 'Частичный успех', value: 'partial' },
]
