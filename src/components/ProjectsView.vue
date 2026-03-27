<template>
  <v-container fluid class="pa-8">
    <div class="mb-6 d-flex align-center ga-4">
      <v-text-field
        v-model="searchTerm"
        placeholder="Поиск по названию проекта..."
        variant="outlined"
        density="comfortable"
        hide-details
        rounded="lg"
        bg-color="white"
        class="flex-1"
      >
        <template #prepend-inner>
          <Search :size="18" class="text-medium-emphasis" />
        </template>
      </v-text-field>

      <v-select
        v-model="statusFilter"
        :items="statusOptions"
        item-title="label"
        item-value="value"
        variant="outlined"
        density="comfortable"
        hide-details
        rounded="lg"
        bg-color="white"
        class="status-select"
      />
    </div>

    <v-row>
      <v-col v-for="project in filteredProjects" :key="project.id" cols="12" md="6" lg="4">
        <v-card rounded="lg" class="project-card" elevation="2">
          <v-card-text class="pa-6">
            <div class="d-flex align-start justify-space-between mb-3">
              <div class="d-flex align-center ga-2">
                <GitBranch :size="20" color="#409EFF" />
                <h3 class="font-weight-semibold text-grey-darken-4">{{ project.name }}</h3>
              </div>

              <v-chip size="small" :color="statusConfig[project.pipelineStatus].chipColor" variant="tonal" class="font-weight-medium">
                <component :is="statusConfig[project.pipelineStatus].icon" :size="12" class="mr-1" />
                {{ statusConfig[project.pipelineStatus].label }}
              </v-chip>
            </div>

            <p class="text-body-2 text-medium-emphasis mb-4">{{ project.description }}</p>

            <div class="mb-4 text-body-2 text-medium-emphasis">
              <div><span class="font-weight-medium">Группа:</span> {{ project.namespace }}</div>
              <div><span class="font-weight-medium">Последний коммит:</span> {{ project.lastCommit.author }}, {{ project.lastCommit.time }}</div>
            </div>

            <div class="d-flex flex-wrap ga-2 mb-4">
              <v-chip v-for="type in project.types" :key="type" size="small" variant="outlined" class="type-chip">
                <component :is="typeIcons[type].icon" :size="14" :class="typeIcons[type].colorClass" class="mr-1" />
                {{ typeIcons[type].label }}
              </v-chip>
            </div>

            <div class="d-flex ga-2 pt-4 border-top">
              <v-btn variant="outlined" class="flex-1 text-none" rounded="lg">
                <ExternalLink :size="16" class="mr-2" /> Открыть в GitLab
              </v-btn>
              <v-btn color="primary" class="flex-1 text-none" rounded="lg" @click="$emit('navigate-to-pipelines', project.id, project.name)">
                <PlayCircle :size="16" class="mr-2" /> Пайплайны
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-if="filteredProjects.length === 0" class="py-10 text-center" variant="tonal" color="grey-lighten-4">
      <v-card-text class="text-medium-emphasis">Проекты не найдены</v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, GitBranch, ExternalLink, PlayCircle, FlaskConical, Bot, Repeat, CheckCircle, XCircle, RefreshCw } from 'lucide-vue-next'

defineEmits<{ 'navigate-to-pipelines': [id: number, name: string] }>()

const searchTerm = ref('')
const statusFilter = ref('all')

const statusOptions = [
  { label: 'Все', value: 'all' },
  { label: 'С активными пайплайнами', value: 'active' },
  { label: 'С недавними ошибками', value: 'errors' },
]

type PipelineStatus = 'success' | 'failed' | 'running'
type ProjectType = 'training' | 'inference' | 'etl'

interface Project {
  id: number; name: string; description: string; namespace: string
  lastCommit: { author: string; time: string }
  pipelineStatus: PipelineStatus; types: ProjectType[]
}

const mockProjects: Project[] = [
  { id: 1, name: 'fraud-detection', description: 'Модель для детекции мошенничества в транзакциях', namespace: 'ml-team/fraud', lastCommit: { author: 'ivanov', time: '2 ч назад' }, pipelineStatus: 'success', types: ['training', 'inference'] },
  { id: 2, name: 'customer-segmentation', description: 'Сегментация клиентов для маркетинга', namespace: 'ml-team/marketing', lastCommit: { author: 'petrova', time: '5 ч назад' }, pipelineStatus: 'running', types: ['training'] },
  { id: 3, name: 'recommendation-engine', description: 'Рекомендательная система для продуктов', namespace: 'ml-team/recommendations', lastCommit: { author: 'sidorov', time: '1 день назад' }, pipelineStatus: 'success', types: ['training', 'inference'] },
  { id: 4, name: 'text-classification', description: 'Классификация текстовых документов', namespace: 'ml-team/nlp', lastCommit: { author: 'kuznetsov', time: '3 ч назад' }, pipelineStatus: 'failed', types: ['training', 'inference'] },
  { id: 5, name: 'data-pipeline-etl', description: 'ETL пайплайн для подготовки данных', namespace: 'data-engineering/pipelines', lastCommit: { author: 'sokolova', time: '12 ч назад' }, pipelineStatus: 'success', types: ['etl'] },
  { id: 6, name: 'image-recognition', description: 'Распознавание объектов на изображениях', namespace: 'ml-team/vision', lastCommit: { author: 'volkov', time: '6 ч назад' }, pipelineStatus: 'running', types: ['training', 'inference'] },
]

const statusConfig: Record<PipelineStatus, { label: string; chipColor: string; icon: any }> = {
  success: { label: 'Успешен', chipColor: 'green', icon: CheckCircle },
  failed: { label: 'Ошибка', chipColor: 'red', icon: XCircle },
  running: { label: 'В процессе', chipColor: 'blue', icon: RefreshCw },
}

const typeIcons: Record<ProjectType, { icon: any; label: string; colorClass: string }> = {
  training: { icon: FlaskConical, label: 'Обучение', colorClass: 'text-blue-600' },
  inference: { icon: Bot, label: 'Инференс', colorClass: 'text-purple-600' },
  etl: { icon: Repeat, label: 'ETL', colorClass: 'text-green-600' },
}

const filteredProjects = computed(() => mockProjects.filter(p => {
  const matchSearch = p.name.toLowerCase().includes(searchTerm.value.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.value.toLowerCase())
  const matchStatus = statusFilter.value === 'all' ||
    (statusFilter.value === 'active' && p.pipelineStatus === 'running') ||
    (statusFilter.value === 'errors' && p.pipelineStatus === 'failed')
  return matchSearch && matchStatus
}))
</script>

<style scoped>
.status-select {
  max-width: 320px;
}

.project-card {
  transition: box-shadow 0.2s;
}

.project-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
}

.type-chip {
  background: #f9fafb;
}

.border-top {
  border-top: 1px solid #e5e7eb;
}
</style>
