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
            Показано {{ pagedStart }}–{{ pagedEnd }} из {{ totalLabel }}
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
import { ref, computed, watch } from 'vue'
import { FileText, Database, Package, MoreVertical, Search, Upload, ChevronLeft, ChevronRight, Download, Eye, Trash2 } from 'lucide-vue-next'
import { useStorageFilesStore, type StorageFileType } from '@/stores/storageFiles'

const tabs = ['Buckets', 'Files', 'Upload', 'Metadata']
const activeTab = ref('Files')
const currentPage = ref(1)
const searchTerm = ref('')
const filterType = ref('Все типы')
const sortField = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')
const itemsPerPage = 10

const filterItems = ['Все типы', 'Разметка', 'Датасеты', 'Артефакты']

type FileType = StorageFileType
const filesStore = useStorageFilesStore()
filesStore.fetchFiles({ search: '', type: 'Все типы', page: 1, perPage: itemsPerPage, sortField: null, sortDirection: 'asc' })

const fileTypeIcons: Record<FileType, any> = { 'Разметка': FileText, 'Датасет': Database, 'Артефакт модели': Package }

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

watch([searchTerm, filterType], () => {
  currentPage.value = 1
  filesStore.fetchFiles({
    search: searchTerm.value,
    type: filterType.value,
    page: 1,
    perPage: itemsPerPage,
    sortField: sortField.value,
    sortDirection: sortDirection.value,
  })
})
watch([sortField, sortDirection], () => {
  currentPage.value = 1
  filesStore.fetchFiles({
    search: searchTerm.value,
    type: filterType.value,
    page: 1,
    perPage: itemsPerPage,
    sortField: sortField.value,
    sortDirection: sortDirection.value,
  })
})
watch(currentPage, (p) => {
  filesStore.fetchFiles({
    search: searchTerm.value,
    type: filterType.value,
    page: p,
    perPage: itemsPerPage,
    sortField: sortField.value,
    sortDirection: sortDirection.value,
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filesStore.total / itemsPerPage)))
const pagedFiles = computed(() => filesStore.items)
const pagedStart = computed(() => filesStore.total === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1)
const pagedEnd = computed(() => Math.min(currentPage.value * itemsPerPage, filesStore.total))
const totalLabel = computed(() => filesStore.total)
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
