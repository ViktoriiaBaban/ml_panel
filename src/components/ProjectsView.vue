<template>
  <v-container fluid class="pa-0">
  <div class="p-8">
    <!-- Filters -->
    <div class="mb-6 flex items-center gap-4">
      <div class="flex-1 relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Поиск по названию проекта..." v-model="searchTerm"
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF] focus:border-transparent bg-white" />
      </div>
      <select v-model="statusFilter" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF] bg-white">
        <option value="all">Все</option>
        <option value="active">С активными пайплайнами</option>
        <option value="errors">С недавними ошибками</option>
      </select>
    </div>

    <!-- Projects Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="project in filteredProjects" :key="project.id"
        class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-6 hover:shadow-lg transition-shadow">
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <GitBranch class="w-5 h-5 text-[#409EFF]" />
            <h3 class="font-semibold text-gray-900">{{ project.name }}</h3>
          </div>
          <span :class="['px-2 py-1 text-xs font-medium rounded-full', statusConfig[project.pipelineStatus].color]">
            <component :is="statusConfig[project.pipelineStatus].icon" class="w-3 h-3" /> {{ statusConfig[project.pipelineStatus].label }}
          </span>
        </div>
        <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ project.description }}</p>
        <div class="space-y-2 mb-4">
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span class="font-medium">Группа:</span><span>{{ project.namespace }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span class="font-medium">Последний коммит:</span>
            <span>{{ project.lastCommit.author }}, {{ project.lastCommit.time }}</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mb-4">
          <div v-for="type in project.types" :key="type"
            class="flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-full text-xs">
            <component :is="typeIcons[type].icon" :class="['w-4 h-4', typeIcons[type].color]" />
            <span class="text-gray-700">{{ typeIcons[type].label }}</span>
          </div>
        </div>
        <div class="flex gap-2 pt-4 border-t border-gray-200">
          <button class="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <ExternalLink class="w-4 h-4" /> Открыть в GitLab
          </button>
          <button @click="$emit('navigate-to-pipelines', project.id, project.name)"
            class="flex-1 px-4 py-2 text-sm bg-[#409EFF] text-white rounded-lg hover:bg-[#3a8eef] transition-colors flex items-center justify-center gap-2">
            <PlayCircle class="w-4 h-4" /> Пайплайны
          </button>
        </div>
      </div>
    </div>

    <div v-if="filteredProjects.length === 0" class="text-center py-12">
      <p class="text-gray-500">Проекты не найдены</p>
    </div>
  </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, GitBranch, ExternalLink, PlayCircle, FlaskConical, Bot, Repeat, CheckCircle, XCircle, RefreshCw } from 'lucide-vue-next'

defineEmits<{ 'navigate-to-pipelines': [id: number, name: string] }>()

const searchTerm = ref('')
const statusFilter = ref('all')

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

const statusConfig: Record<PipelineStatus, { label: string; color: string; icon: any }> = {
  success: { label: 'Успешен', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  failed: { label: 'Ошибка', color: 'bg-red-100 text-red-800', icon: XCircle },
  running: { label: 'В процессе', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
}

const typeIcons: Record<ProjectType, { icon: any; label: string; color: string }> = {
  training: { icon: FlaskConical, label: 'Обучение', color: 'text-blue-600' },
  inference: { icon: Bot, label: 'Инференс', color: 'text-purple-600' },
  etl: { icon: Repeat, label: 'ETL', color: 'text-green-600' },
}

const filteredProjects = computed(() => mockProjects.filter(p => {
  const matchSearch = p.name.toLowerCase().includes(searchTerm.value.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.value.toLowerCase())
  const matchStatus = statusFilter.value === 'all' ||
    (statusFilter.value === 'active' && p.pipelineStatus === 'running') ||
    (statusFilter.value === 'errors' && p.pipelineStatus === 'failed')
  return matchSearch && matchStatus
}))
</script>
