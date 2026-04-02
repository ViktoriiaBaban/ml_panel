<template>
  <v-container fluid class="pa-8">
    <div class="d-flex align-center ga-2 text-body-2 text-medium-emphasis mb-6">
      <v-btn variant="text" density="comfortable" class="text-none px-0" @click="goBack">Главная</v-btn>
      <span>→</span>
      <v-btn variant="text" density="comfortable" class="text-none px-0" @click="goBack">Проекты и пайплайны</v-btn>
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
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, ChevronUp, ExternalLink, Clock, User, GitBranch, Tag, Check, X, RefreshCw, Pause, AlertTriangle } from 'lucide-vue-next'
import { usePipelinesStore } from '@/stores/pipelines'
import { Pipeline, PipelineStatus, StageStatus } from '@/types/projects.ts';

const props = defineProps<{ projectId: number; projectName: string }>()

const router = useRouter()

const expandedPipeline = ref<number | null>(null)
const branchFilter = ref('all')
const statusFilter = ref('all')

const pipelinesStore = usePipelinesStore()
pipelinesStore.fetchPipelines({ projectId: props.projectId, branch: 'all', status: 'all' })

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

watch([branchFilter, statusFilter], () => {
  pipelinesStore.fetchPipelines({
    projectId: props.projectId,
    branch: branchFilter.value,
    status: statusFilter.value,
  })
})

const branches = computed(() => ['all', ...new Set(pipelinesStore.items.map(p => p.branch))])
const branchItems = computed(() => branches.value.map(branch => ({ label: branch === 'all' ? 'Все ветки' : branch, value: branch })))
const statusItems = [
  { label: 'Все статусы', value: 'all' },
  { label: 'Успешные', value: 'success' },
  { label: 'Ошибки', value: 'failed' },
  { label: 'В процессе', value: 'running' },
  { label: 'Частичный успех', value: 'partial' },
]

const filteredPipelines = computed<Pipeline[]>(() => pipelinesStore.items)

function goBack() {
  router.push('/projects')
}
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
