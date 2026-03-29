<template>
  <v-container fluid class="pa-8">
    <v-card rounded="lg" elevation="2">
      <v-tabs v-model="activeTab" color="primary" align-tabs="start" class="px-4 border-b">
        <v-tab v-for="tab in tabs" :key="tab" :value="tab" class="text-none">{{ tab }}</v-tab>
      </v-tabs>

      <template v-if="activeTab === 'Files'">
        <div class="pa-6 d-flex align-center ga-4 border-b flex-wrap">
          <v-text-field
            v-model="searchTerm"
            placeholder="Поиск по имени или проекту…"
            variant="outlined"
            density="comfortable"
            hide-details
            rounded="lg"
            class="flex-1"
          >
            <template #prepend-inner>
              <Search :size="18" class="text-medium-emphasis" />
            </template>
          </v-text-field>

          <v-select
            v-model="filterType"
            :items="filterItems"
            variant="outlined"
            density="comfortable"
            hide-details
            rounded="lg"
            class="filter-select"
          />

          <v-btn color="primary" rounded="lg" class="text-none">
            <Upload :size="16" class="mr-2" />
            Загрузить файл
          </v-btn>
        </div>

        <v-table class="text-no-wrap">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col.key" @click="handleSort(col.key)" class="cursor-pointer">
                <div class="d-flex align-center ga-1">
                  {{ col.label }}
                  <span v-if="sortField === col.key" class="text-primary">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                </div>
              </th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in pagedFiles" :key="file.id">
              <td>
                <div class="d-flex align-center ga-3">
                  <component :is="fileTypeIcons[file.type]" :size="18" color="#409EFF" />
                  <span>{{ file.name }}</span>
                </div>
              </td>
              <td>
                <v-chip size="small" :class="typeBadgeClass(file.type)">{{ file.type }}</v-chip>
              </td>
              <td>{{ file.size }}</td>
              <td>{{ file.date }}</td>
              <td>{{ file.project }}</td>
              <td>
                <v-menu location="bottom end">
                  <template #activator="{ props }">
                    <v-btn icon variant="text" size="small" v-bind="props">
                      <MoreVertical :size="18" />
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item title="Просмотреть">
                      <template #prepend><Eye :size="16" /></template>
                    </v-list-item>
                    <v-list-item title="Скачать">
                      <template #prepend><Download :size="16" /></template>
                    </v-list-item>
                    <v-list-item title="Удалить" base-color="error">
                      <template #prepend><Trash2 :size="16" /></template>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </tbody>
        </v-table>

        <div class="px-6 py-4 d-flex align-center justify-space-between border-t flex-wrap ga-2">
          <div class="text-body-2 text-medium-emphasis">
            Показано {{ pagedStart }}–{{ pagedEnd }} из {{ filteredAndSortedFiles.length }}
          </div>

          <div class="d-flex align-center ga-2">
            <v-btn icon variant="outlined" size="small" :disabled="currentPage === 1" @click="currentPage = Math.max(1, currentPage - 1)">
              <ChevronLeft :size="16" />
            </v-btn>
            <span class="text-body-2">Страница {{ currentPage }} из {{ totalPages }}</span>
            <v-btn icon variant="outlined" size="small" :disabled="currentPage >= totalPages" @click="currentPage = Math.min(totalPages, currentPage + 1)">
              <ChevronRight :size="16" />
            </v-btn>
          </div>
        </div>
      </template>

      <v-card-text v-else class="py-12 text-center text-medium-emphasis">
        Содержимое вкладки "{{ activeTab }}" будет отображено здесь
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileText, Database, Package, MoreVertical, Search, Upload, ChevronLeft, ChevronRight, Download, Eye, Trash2 } from 'lucide-vue-next'

const tabs = ['Buckets', 'Files', 'Upload', 'Metadata']
const activeTab = ref('Files')
const currentPage = ref(1)
const searchTerm = ref('')
const filterType = ref('Все типы')
const sortField = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')
const itemsPerPage = 10

const filterItems = ['Все типы', 'Разметка', 'Датасеты', 'Артефакты']

type FileType = 'Разметка' | 'Датасет' | 'Артефакт модели'
interface FileItem { id: number; name: string; type: FileType; size: string; date: string; project: string }

const fileTypeIcons: Record<FileType, any> = { 'Разметка': FileText, 'Датасет': Database, 'Артефакт модели': Package }

const mockFiles: FileItem[] = [
  { id: 1, name: 'training_data_v1.csv', type: 'Датасет', size: '12.4 МБ', date: '09.01.2026, 14:23', project: 'Fraud Detection' },
  { id: 2, name: 'labels_annotated.json', type: 'Разметка', size: '856 КБ', date: '09.01.2026, 13:45', project: 'Fraud Detection' },
  { id: 3, name: 'model_v2.3.pkl', type: 'Артефакт модели', size: '45.2 МБ', date: '09.01.2026, 12:30', project: 'Fraud Detection' },
  { id: 4, name: 'validation_set.parquet', type: 'Датасет', size: '8.7 МБ', date: '09.01.2026, 11:15', project: 'Customer Segmentation' },
  { id: 5, name: 'feature_labels.csv', type: 'Разметка', size: '320 КБ', date: '09.01.2026, 10:00', project: 'Customer Segmentation' },
  { id: 6, name: 'classifier_final.h5', type: 'Артефакт модели', size: '92.1 МБ', date: '09.01.2026, 09:45', project: 'Text Classification' },
  { id: 7, name: 'test_data.csv', type: 'Датасет', size: '6.3 МБ', date: '09.01.2026, 08:20', project: 'Text Classification' },
  { id: 8, name: 'annotations_v3.json', type: 'Разметка', size: '1.2 МБ', date: '08.01.2026, 17:30', project: 'Image Recognition' },
  { id: 9, name: 'embeddings.npy', type: 'Артефакт модели', size: '128.5 МБ', date: '08.01.2026, 16:15', project: 'Recommendation System' },
  { id: 10, name: 'user_interactions.csv', type: 'Датасет', size: '22.8 МБ', date: '08.01.2026, 15:00', project: 'Recommendation System' },
]

const columns = [
  { key: 'name', label: 'Имя файла' },
  { key: 'type', label: 'Тип' },
  { key: 'size', label: 'Размер' },
  { key: 'date', label: 'Дата загрузки' },
  { key: 'project', label: 'Проект' },
]

function typeBadgeClass(type: FileType) {
  if (type === 'Разметка') return 'bg-blue-100 text-blue-800'
  if (type === 'Датасет') return 'bg-green-100 text-green-800'
  return 'bg-purple-100 text-purple-800'
}

function handleSort(field: string) {
  if (sortField.value === field) sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  else { sortField.value = field; sortDirection.value = 'asc' }
}

const filteredAndSortedFiles = computed(() => {
  let files = mockFiles.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(searchTerm.value.toLowerCase()) || f.project.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchFilter = filterType.value === 'Все типы' || f.type === filterType.value ||
      (filterType.value === 'Датасеты' && f.type === 'Датасет') ||
      (filterType.value === 'Артефакты' && f.type === 'Артефакт модели')
    return matchSearch && matchFilter
  })
  if (sortField.value) {
    const field = sortField.value as keyof FileItem
    const dir = sortDirection.value === 'asc' ? 1 : -1
    files = [...files].sort((a, b) => (a[field] > b[field] ? dir : -dir))
  }
  return files
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAndSortedFiles.value.length / itemsPerPage)))
const pagedFiles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredAndSortedFiles.value.slice(start, start + itemsPerPage)
})
const pagedStart = computed(() => filteredAndSortedFiles.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1)
const pagedEnd = computed(() => Math.min(currentPage.value * itemsPerPage, filteredAndSortedFiles.value.length))
</script>

<style scoped>
.filter-select {
  min-width: 180px;
}

.border-b {
  border-bottom: 1px solid #e5e7eb;
}

.border-t {
  border-top: 1px solid #e5e7eb;
}
</style>
