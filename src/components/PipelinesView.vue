<template>
  <v-container fluid class="pa-8">
    <div class="d-flex align-center ga-2 text-body-2 text-medium-emphasis mb-6">
      <v-btn variant="text" density="comfortable" class="text-none px-0" @click="$emit('back')">Главная</v-btn>
      <span>→</span>
      <v-btn variant="text" density="comfortable" class="text-none px-0" @click="$emit('back')">Проекты и пайплайны</v-btn>
      <span>→</span>
      <span class="text-grey-darken-4">Пайплайны</span>
      <span>→</span>
      <span class="text-primary font-weight-medium">{{ projectName }}</span>
    </div>

    <div class="mb-6 d-flex align-center ga-4 filters-row">
      <v-select
        v-model="branchFilter"
         :items="branchItems"
        item-title="label"
        item-value="value"
        variant="outlined"
        density="comfortable"
        hide-details
        rounded="lg"
        bg-color="white"
        class="filter-select"
      />

      <v-select
        v-model="statusFilter"
        :items="statusItems"
        item-title="label"
        item-value="value"
        variant="outlined"
        density="comfortable"
        hide-details
        rounded="lg"
        bg-color="white"
        class="filter-select"
      />
      <div class="flex-1"></div>
      <div class="text-body-2 text-medium-emphasis">Последние 30 дней</div>
    </div>

    <div class="d-flex flex-column ga-4">
      <v-card v-for="pipeline in filteredPipelines" :key="pipeline.id" rounded="lg" elevation="2">
        <v-card-text class="pa-6">
          <div class="d-flex align-start justify-space-between mb-4">
            <div class="d-flex align-center ga-4 flex-wrap">
              <a href="#" class="text-h6 font-weight-semibold text-primary d-flex align-center ga-2 pipeline-link">
                {{ pipeline.pipelineId }}<ExternalLink :size="16" />
              </a>
              <div class="d-flex align-center ga-2 text-body-2 text-medium-emphasis">
                <GitBranch :size="16" />
                <span>{{ pipeline.branch }}</span>
                <template v-if="pipeline.tag">
                  <Tag :size="16" class="ml-2" />
                  <span>{{ pipeline.tag }}</span>
                </template>
              </div>
            </div>
            <v-chip size="small" :color="pipelineStatusConfig[pipeline.status].chipColor" variant="tonal" class="font-weight-medium">
              {{ pipelineStatusConfig[pipeline.status].label }}
            </v-chip>
          </div>

          <div class="d-flex align-center ga-6 text-body-2 text-medium-emphasis mb-4 flex-wrap">
            <div class="d-flex align-center ga-2"><User :size="16" /><span>{{ pipeline.author }}</span></div>
            <div class="d-flex align-center ga-2"><Clock :size="16" /><span>{{ pipeline.startTime }}</span></div>
            <div class="d-flex align-center ga-2"><span class="font-weight-medium">Длительность:</span><span>{{ pipeline.duration }}</span></div>
          </div>

          <div class="d-flex align-center ga-2 mb-4 flex-wrap">
            <template v-for="(stage, index) in pipeline.stages" :key="index">
              <div class="d-flex flex-column align-center">
                <v-avatar :color="stageStatusConfig[stage.status].color" size="32">
                  <component :is="stageStatusConfig[stage.status].icon" :size="14" color="white" />
                </v-avatar>
                <span class="text-caption text-medium-emphasis mt-1">{{ stage.name }}</span>
              </div>
              <div v-if="index < pipeline.stages.length - 1" class="timeline-line"></div>
            </template>
          </div>

          <v-btn variant="text" color="primary" class="text-none px-0" @click="expandedPipeline = expandedPipeline === pipeline.id ? null : pipeline.id">
            <component :is="expandedPipeline === pipeline.id ? ChevronUp : ChevronDown" :size="16" class="mr-2" />
            {{ expandedPipeline === pipeline.id ? 'Скрыть детали' : 'Показать детали' }}
          </v-btn>
        </v-card-text>

        <v-expand-transition>
          <div v-if="expandedPipeline === pipeline.id" class="px-6 pb-6 border-top">
            <div class="pt-4 d-flex flex-column ga-4">
              <v-sheet v-for="(stage, index) in pipeline.stages" :key="index" rounded="lg" color="grey-lighten-4" class="pa-4">
                <div class="d-flex align-start justify-space-between mb-2">
                  <div class="d-flex align-center ga-2">
                    <span class="font-weight-medium text-grey-darken-4">{{ stage.name }}</span>
                    <v-chip size="x-small" :class="stageBadgeClass(stage.status)">{{ stageStatusConfig[stage.status].label }}</v-chip>
                  </div>
                  <span v-if="stage.duration" class="text-body-2 text-medium-emphasis">{{ stage.duration }}</span>
                </div>

                <div v-if="stage.mlflowRun || stage.bentoService || stage.nifiFlow" class="d-flex flex-column ga-2 mt-3 text-body-2">
                  <div v-if="stage.mlflowRun">MLflow run: <a href="#" class="text-primary">{{ stage.mlflowRun }}</a></div>
                  <div v-if="stage.bentoService">Bento service: <a href="#" class="text-primary">{{ stage.bentoService }}</a></div>
                  <div v-if="stage.nifiFlow">NiFi flow: <a href="#" class="text-primary">{{ stage.nifiFlow }}</a></div>
                </div>
              </v-sheet>
            </div>
          </div>
        </v-expand-transition>
      </v-card>
    </div>

    <v-card v-if="filteredPipelines.length === 0" class="text-center py-10 mt-4" variant="tonal">
      <v-card-text class="text-medium-emphasis">Пайплайны не найдены</v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown, ChevronUp, ExternalLink, Clock, User, GitBranch, Tag, Check, X, RefreshCw, Pause, AlertTriangle } from 'lucide-vue-next'

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
  success: { icon: Check, color: 'green', label: 'Успешно' },
  failed: { icon: X, color: 'red', label: 'Ошибка' },
  running: { icon: RefreshCw, color: 'blue', label: 'В процессе' },
  pending: { icon: Pause, color: 'grey', label: 'Ожидание' },
  warning: { icon: AlertTriangle, color: 'amber', label: 'Предупреждение' },
}

const pipelineStatusConfig: Record<PipelineStatus, { label: string; chipColor: string }> = {
  success: { label: 'Успешен', chipColor: 'green' },
  failed: { label: 'Ошибка', chipColor: 'red' },
  running: { label: 'В процессе', chipColor: 'blue' },
  partial: { label: 'Частичный успех', chipColor: 'amber' },
}

function stageBadgeClass(status: StageStatus) {
  const map: Record<StageStatus, string> = {
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    running: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-gray-100 text-gray-800',
  }
  return map[status]
}

const branches = computed(() => ['all', ...new Set(mockPipelines.map(p => p.branch))])
const branchItems = computed(() => branches.value.map(branch => ({ label: branch === 'all' ? 'Все ветки' : branch, value: branch })))
const statusItems = [
  { label: 'Все статусы', value: 'all' },
  { label: 'Успешные', value: 'success' },
  { label: 'Ошибки', value: 'failed' },
  { label: 'В процессе', value: 'running' },
  { label: 'Частичный успех', value: 'partial' },
]

const filteredPipelines = computed(() => mockPipelines.filter(p => {
  const matchBranch = branchFilter.value === 'all' || p.branch === branchFilter.value
  const matchStatus = statusFilter.value === 'all' || p.status === statusFilter.value
  return matchBranch && matchStatus
}))
</script>

<style scoped>
.pipeline-link {
  text-decoration: none;
}

.filters-row {
  align-items: center;
}

.filter-select {
  max-width: 220px;
}

.timeline-line {
  width: 48px;
  height: 2px;
  background: #d1d5db;
  margin: 0 4px;
}

.border-top {
  border-top: 1px solid #e5e7eb;
}
</style>
