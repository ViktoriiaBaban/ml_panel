import { defineStore } from 'pinia'
import { api, ApiError } from '@/lib/api'

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

export const useEtlStore = defineStore('etl', {
  state: () => ({
    flows: [] as EtlFlow[],
    flowsLoading: false,
    flowsError: null as string | null,

    flowById: {} as Record<number, EtlFlow>,
    flowLoading: {} as Record<number, boolean>,
    flowError: {} as Record<number, string | null>,

    variablesByFlowId: {} as Record<number, FlowVariable[]>,
    variablesLoading: {} as Record<number, boolean>,
    variablesError: {} as Record<number, string | null>,

    componentsByFlowId: {} as Record<number, FlowComponent[]>,
    historyByFlowId: {} as Record<number, FlowHistoryItem[]>,
  }),
  actions: {
    async fetchFlows() {
      this.flowsLoading = true
      this.flowsError = null
      try {
        this.flows = await api.get<EtlFlow[]>('/etl/flows')
      } catch (e) {
        this.flowsError = e instanceof ApiError ? e.message : 'Не удалось загрузить потоки'
      } finally {
        this.flowsLoading = false
      }
    },

    async fetchFlow(id: number) {
      this.flowLoading[id] = true
      this.flowError[id] = null
      try {
        const flow = await api.get<EtlFlow>(`/etl/flows/${id}`)
        this.flowById[id] = flow
        return flow
      } catch (e) {
        this.flowError[id] = e instanceof ApiError ? e.message : 'Не удалось загрузить поток'
        return null
      } finally {
        this.flowLoading[id] = false
      }
    },

    async fetchVariables(flowId: number) {
      this.variablesLoading[flowId] = true
      this.variablesError[flowId] = null
      try {
        this.variablesByFlowId[flowId] = await api.get<FlowVariable[]>(`/etl/flows/${flowId}/variables`)
      } catch (e) {
        this.variablesError[flowId] = e instanceof ApiError ? e.message : 'Не удалось загрузить переменные'
      } finally {
        this.variablesLoading[flowId] = false
      }
    },

    async updateVariable(flowId: number, key: string, value: string) {
      const updated = await api.patch<FlowVariable, { value: string }>(
        `/etl/flows/${flowId}/variables/${encodeURIComponent(key)}`,
        { value },
      )
      const list = this.variablesByFlowId[flowId] ?? []
      const idx = list.findIndex((v) => v.key === key)
      if (idx >= 0) list[idx] = updated
      else list.push(updated)
      this.variablesByFlowId[flowId] = [...list]
      return updated
    },

    async fetchComponents(flowId: number) {
      this.componentsByFlowId[flowId] = await api.get<FlowComponent[]>(`/etl/flows/${flowId}/components`)
    },

    async fetchHistory(flowId: number) {
      this.historyByFlowId[flowId] = await api.get<FlowHistoryItem[]>(`/etl/flows/${flowId}/history`)
    },
  },
})

