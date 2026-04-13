import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api, ApiError } from '@/api/api'

export type FlowStatus = 'running' | 'stopped' | 'error'

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
export type FlowComponent = {
  id: number
  name: string
  type: string
  status: string
  threadsActive: number
  tasksCompleted: number
}
export type FlowHistoryItem = {
  id: number
  timestamp: string
  action: string
  user: string
  status: 'success' | 'error'
}

export const useEtlStore = defineStore('etl', () => {
  const flows = ref<EtlFlow[]>([])
  const flowsLoading = ref(false)
  const flowsError = ref<string | null>(null)

  const flowById = ref<Record<number, EtlFlow>>({})
  const flowLoading = ref<Record<number, boolean>>({})
  const flowError = ref<Record<number, string | null>>({})

  const variablesByFlowId = ref<Record<number, FlowVariable[]>>({})
  const variablesLoading = ref<Record<number, boolean>>({})
  const variablesError = ref<Record<number, string | null>>({})

  const componentsByFlowId = ref<Record<number, FlowComponent[]>>({})
  const historyByFlowId = ref<Record<number, FlowHistoryItem[]>>({})

  const fetchFlows = async () => {
    flowsLoading.value = true
    flowsError.value = null
    try {
      flows.value = await api.get<EtlFlow[]>('/etl/flows')
    } catch (e) {
      flowsError.value = e instanceof ApiError ? e.message : 'Не удалось загрузить потоки'
    } finally {
      flowsLoading.value = false
    }
  }

  const fetchFlow = async (id: number) => {
    flowLoading.value[id] = true
    flowError.value[id] = null
    try {
      const flow = await api.get<EtlFlow>(`/etl/flows/${id}`)
      flowById.value[id] = flow
      return flow
    } catch (e) {
      flowError.value[id] = e instanceof ApiError ? e.message : 'Не удалось загрузить поток'
      return null
    } finally {
      flowLoading.value[id] = false
    }
  }

  const fetchVariables = async (flowId: number) => {
    variablesLoading.value[flowId] = true
    variablesError.value[flowId] = null
    try {
      variablesByFlowId.value[flowId] = await api.get<FlowVariable[]>(`/etl/flows/${flowId}/variables`)
    } catch (e) {
      variablesError.value[flowId] = e instanceof ApiError ? e.message : 'Не удалось загрузить переменные'
    } finally {
      variablesLoading.value[flowId] = false
    }
  }

  const updateVariable = async (flowId: number, key: string, value: string) => {
    const updated = await api.patch<FlowVariable, { value: string }>(
      `/etl/flows/${flowId}/variables/${encodeURIComponent(key)}`,
      { value },
    )
    const list = variablesByFlowId.value[flowId] ?? []
    const idx = list.findIndex((v) => v.key === key)
    if (idx >= 0) list[idx] = updated
    else list.push(updated)
    variablesByFlowId.value[flowId] = [...list]
    return updated
  }

  const fetchComponents = async (flowId: number) => {
    componentsByFlowId.value[flowId] = await api.get<FlowComponent[]>(`/etl/flows/${flowId}/components`)
  }

  const fetchHistory = async (flowId: number) => {
    historyByFlowId.value[flowId] = await api.get<FlowHistoryItem[]>(`/etl/flows/${flowId}/history`)
  }

  return {
    flows,
    flowsLoading,
    flowsError,
    flowById,
    flowLoading,
    flowError,
    variablesByFlowId,
    variablesLoading,
    variablesError,
    componentsByFlowId,
    historyByFlowId,
    fetchFlows,
    fetchFlow,
    fetchVariables,
    updateVariable,
    fetchComponents,
    fetchHistory,
  }
})
