<template>
  <v-container fluid class="pa-0">
  <div class="p-8">
    <!-- Breadcrumbs -->
    <div class="flex items-center gap-2 text-sm text-gray-600 mb-6">
      <button @click="$emit('back')" class="hover:text-gray-900">Главная</button>
      <span>→</span>
      <button @click="$emit('back')" class="hover:text-gray-900">Проекты и пайплайны</button>
      <span>→</span>
      <span class="text-gray-900">Пайплайны</span>
      <span>→</span>
      <span class="text-[#409EFF] font-medium">{{ projectName }}</span>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex items-center gap-4">
      <select v-model="branchFilter" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF] bg-white">
        <option v-for="branch in branches" :key="branch" :value="branch">{{ branch === 'all' ? 'Все ветки' : branch }}</option>
      </select>
      <select v-model="statusFilter" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF] bg-white">
        <option value="all">Все статусы</option>
        <option value="success">Успешные</option>
        <option value="failed">Ошибки</option>
        <option value="running">В процессе</option>
        <option value="partial">Частичный успех</option>
      </select>
      <div class="flex-1"></div>
      <div class="text-sm text-gray-600">Последние 30 дней</div>
    </div>

    <!-- Pipelines List -->
    <div class="space-y-4">
      <div v-for="pipeline in filteredPipelines" :key="pipeline.id"
        class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden">
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-4">
              <a href="#" class="text-lg font-semibold text-[#409EFF] hover:underline flex items-center gap-2">
                {{ pipeline.pipelineId }}<ExternalLink class="w-4 h-4" />
              </a>
              <div class="flex items-center gap-2">
                <GitBranch class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-gray-700">{{ pipeline.branch }}</span>
                <template v-if="pipeline.tag">
                  <Tag class="w-4 h-4 text-gray-400 ml-2" />
                  <span class="text-sm text-gray-700">{{ pipeline.tag }}</span>
                </template>
              </div>
            </div>
            <span :class="['text-sm font-medium', pipelineStatusConfig[pipeline.status].color]">
              {{ pipelineStatusConfig[pipeline.status].label }}
            </span>
          </div>

          <div class="flex items-center gap-6 text-sm text-gray-600 mb-4">
            <div class="flex items-center gap-2"><User class="w-4 h-4" /><span>{{ pipeline.author }}</span></div>
            <div class="flex items-center gap-2"><Clock class="w-4 h-4" /><span>{{ pipeline.startTime }}</span></div>
            <div class="flex items-center gap-2"><span class="font-medium">Длительность:</span><span>{{ pipeline.duration }}</span></div>
          </div>

          <!-- Stages Timeline -->
          <div class="flex items-center gap-2 mb-4">
            <template v-for="(stage, index) in pipeline.stages" :key="index">
              <div class="flex flex-col items-center">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-white', stageStatusConfig[stage.status].color]"
                  :title="`${stage.name} - ${stageStatusConfig[stage.status].label}`">
                  <component :is="stageStatusConfig[stage.status].icon" class="w-4 h-4" />
                </div>
                <span class="text-xs text-gray-600 mt-1">{{ stage.name }}</span>
              </div>
              <div v-if="index < pipeline.stages.length - 1" class="w-12 h-0.5 bg-gray-300 mx-1"></div>
            </template>
          </div>

          <button @click="expandedPipeline = expandedPipeline === pipeline.id ? null : pipeline.id"
            class="flex items-center gap-2 text-sm text-[#409EFF] hover:text-[#3a8eef]">
            <component :is="expandedPipeline === pipeline.id ? ChevronUp : ChevronDown" class="w-4 h-4" />
            {{ expandedPipeline === pipeline.id ? 'Скрыть детали' : 'Показать детали' }}
          </button>
        </div>

        <!-- Expanded Details -->
        <div v-if="expandedPipeline === pipeline.id" class="px-6 pb-6 border-t border-gray-200">
          <div class="pt-4 space-y-4">
            <div v-for="(stage, index) in pipeline.stages" :key="index" class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-900">{{ stage.name }}</span>
                  <span :class="['text-xs px-2 py-1 rounded', stageBadgeClass(stage.status)]">
                    {{ stageStatusConfig[stage.status].label }}
                  </span>
                </div>
                <span v-if="stage.duration" class="text-sm text-gray-600">{{ stage.duration }}</span>
              </div>
              <div v-if="stage.mlflowRun || stage.bentoService || stage.nifiFlow" class="space-y-2 mt-3">
                <div v-if="stage.mlflowRun" class="flex items-center gap-2 text-sm">
                  <span class="text-gray-600">MLflow run:</span>
                  <a href="#" class="text-[#409EFF] hover:underline flex items-center gap-1">{{ stage.mlflowRun }}<ExternalLink class="w-3 h-3" /></a>
                </div>
                <div v-if="stage.bentoService" class="flex items-center gap-2 text-sm">
                  <span class="text-gray-600">Bento service:</span>
                  <a href="#" class="text-[#409EFF] hover:underline flex items-center gap-1">{{ stage.bentoService }}<ExternalLink class="w-3 h-3" /></a>
                </div>
                <div v-if="stage.nifiFlow" class="flex items-center gap-2 text-sm">
                  <span class="text-gray-600">NiFi flow:</span>
                  <a href="#" class="text-[#409EFF] hover:underline flex items-center gap-1">{{ stage.nifiFlow }}<ExternalLink class="w-3 h-3" /></a>
                </div>
              </div>
              <div class="mt-3">
                <a href="#" class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  <FileText class="w-3.5 h-3.5" />Просмотреть логи в GitLab<ExternalLink class="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredPipelines.length === 0" class="text-center py-12 bg-white rounded-lg">
      <p class="text-gray-500">Пайплайны не найдены</p>
    </div>
  </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown, ChevronUp, ExternalLink, Clock, User, GitBranch, Tag, Check, X, RefreshCw, Pause, AlertTriangle, FileText } from 'lucide-vue-next'

defineProps<{ projectName: string }>()
defineEmits<{ back: [] }>()

const expandedPipeline = ref<number | null>(null)
const branchFilter = ref('all')
const statusFilter = ref('all')

type StageStatus = 'success' | 'failed' | 'running' | 'pending' | 'warning'
type PipelineStatus = 'success' | 'failed' | 'running' | 'partial'

interface PipelineStage { name: string; status: StageStatus; duration?: string; mlflowRun?: string; bentoService?: string; nifiFlow?: string }
interface Pipeline { id: number; pipelineId: string; branch: string; tag?: string; author: string; startTime: string; stages: PipelineStage[]; duration: string; status: PipelineStatus }

const mockPipelines: Pipeline[] = [
  { id: 1, pipelineId: '#1428', branch: 'main', tag: 'v1.2.0', author: 'petrov', startTime: '2026-01-14 14:30', duration: '12 мин 34 сек', status: 'partial', stages: [{ name: 'data_prep', status: 'success', duration: '2 мин 15 сек' }, { name: 'train', status: 'success', duration: '8 мин 45 сек', mlflowRun: 'run-abc123' }, { name: 'deploy', status: 'warning', duration: '1 мин 34 сек', bentoService: 'fraud-v3' }] },
  { id: 2, pipelineId: '#1427', branch: 'dev', author: 'ivanov', startTime: '2026-01-14 12:15', duration: '10 мин 20 сек', status: 'success', stages: [{ name: 'data_prep', status: 'success', duration: '2 мин 10 сек' }, { name: 'train', status: 'success', duration: '7 мин 30 сек', mlflowRun: 'run-def456' }, { name: 'test', status: 'success', duration: '40 сек' }] },
  { id: 3, pipelineId: '#1426', branch: 'feature/new-model', author: 'sidorova', startTime: '2026-01-14 10:00', duration: '15 мин 45 сек', status: 'failed', stages: [{ name: 'data_prep', status: 'success', duration: '2 мин 20 сек' }, { name: 'train', status: 'failed', duration: '5 мин 15 сек', mlflowRun: 'run-ghi789' }, { name: 'deploy', status: 'pending' }] },
  { id: 4, pipelineId: '#1425', branch: 'main', tag: 'v1.1.5', author: 'kuznetsov', startTime: '2026-01-13 16:45', duration: '11 мин 10 сек', status: 'success', stages: [{ name: 'etl', status: 'success', duration: '3 мин 30 сек', nifiFlow: 'flow-etl-001' }, { name: 'data_prep', status: 'success', duration: '2 мин 05 сек' }, { name: 'train', status: 'success', duration: '5 мин 35 сек', mlflowRun: 'run-jkl012' }] },
  { id: 5, pipelineId: '#1424', branch: 'main', author: 'volkov', startTime: '2026-01-13 14:20', duration: '9 мин 55 сек', status: 'running', stages: [{ name: 'data_prep', status: 'success', duration: '2 мин 15 сек' }, { name: 'train', status: 'running', mlflowRun: 'run-mno345' }, { name: 'deploy', status: 'pending' }] },
]

const stageStatusConfig: Record<StageStatus, { icon: any; color: string; label: string }> = {
  success: { icon: Check, color: 'bg-green-500', label: 'Успешно' },
  failed: { icon: X, color: 'bg-red-500', label: 'Ошибка' },
  running: { icon: RefreshCw, color: 'bg-blue-500', label: 'В процессе' },
  pending: { icon: Pause, color: 'bg-gray-300', label: 'Ожидание' },
  warning: { icon: AlertTriangle, color: 'bg-yellow-500', label: 'Предупреждение' },
}

const pipelineStatusConfig: Record<PipelineStatus, { label: string; color: string }> = {
  success: { label: 'Успешен', color: 'text-green-600' },
  failed: { label: 'Ошибка', color: 'text-red-600' },
  running: { label: 'В процессе', color: 'text-blue-600' },
  partial: { label: 'Частичный успех', color: 'text-yellow-600' },
}

function stageBadgeClass(status: StageStatus) {
  const map: Record<StageStatus, string> = { success: 'bg-green-100 text-green-800', failed: 'bg-red-100 text-red-800', running: 'bg-blue-100 text-blue-800', warning: 'bg-yellow-100 text-yellow-800', pending: 'bg-gray-100 text-gray-800' }
  return map[status]
}

const branches = computed(() => ['all', ...new Set(mockPipelines.map(p => p.branch))])
const filteredPipelines = computed(() => mockPipelines.filter(p => {
  const matchBranch = branchFilter.value === 'all' || p.branch === branchFilter.value
  const matchStatus = statusFilter.value === 'all' || p.status === statusFilter.value
  return matchBranch && matchStatus
}))
</script>
