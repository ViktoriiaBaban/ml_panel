<template>
  <div class="flex-1 bg-[#F5F7FA] p-8">
    <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <div class="flex gap-8 px-6">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            :class="['py-4 text-sm font-medium transition-colors relative', activeTab === tab ? 'text-[#409EFF]' : 'text-gray-600 hover:text-gray-900']"
          >
            {{ tab }}
            <div v-if="activeTab === tab" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#409EFF]"></div>
          </button>
        </div>
      </div>

      <!-- Files Tab -->
      <template v-if="activeTab === 'Files'">
        <!-- Toolbar -->
        <div class="p-6 border-b border-gray-200 flex items-center gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по имени или проекту…"
              v-model="searchTerm"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF] focus:border-transparent"
            />
          </div>
          <select v-model="filterType" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF]">
            <option>Все типы</option>
            <option>Разметка</option>
            <option>Датасеты</option>
            <option>Артефакты</option>
          </select>
          <button class="px-6 py-2 bg-[#409EFF] text-white rounded-lg hover:bg-[#3a8eef] transition-colors flex items-center gap-2">
            <Upload class="w-4 h-4" />
            Загрузить файл
          </button>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th v-for="col in columns" :key="col.key" @click="handleSort(col.key)"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700">
                  <div class="flex items-center gap-1">
                    {{ col.label }}
                    <span v-if="sortField === col.key" class="text-[#409EFF]">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
                  </div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="file in filteredAndSortedFiles" :key="file.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <component :is="fileTypeIcons[file.type]" class="w-5 h-5 text-[#409EFF]" />
                    <span class="text-sm text-gray-900">{{ file.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['px-3 py-1 text-xs font-medium rounded-full', typeBadgeClass(file.type)]">{{ file.type }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ file.size }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ file.date }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ file.project }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div class="relative">
                    <button @click="activeMenu = activeMenu === file.id ? null : file.id" class="p-1 hover:bg-gray-100 rounded transition-colors">
                      <MoreVertical class="w-5 h-5" />
                    </button>
                    <div v-if="activeMenu === file.id" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 rounded-t-lg">
                        <Eye class="w-4 h-4" /> Просмотреть
                      </button>
                      <button class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                        <Download class="w-4 h-4" /> Скачать
                      </button>
                      <button class="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 rounded-b-lg">
                        <Trash2 class="w-4 h-4" /> Удалить
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Показано {{ filteredAndSortedFiles.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}–{{ Math.min(currentPage * itemsPerPage, filteredAndSortedFiles.length) }} из {{ filteredAndSortedFiles.length }}
          </div>
          <div class="flex items-center gap-2">
            <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
              class="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft class="w-4 h-4" />
            </button>
            <span class="px-4 py-2 text-sm text-gray-700">Страница {{ currentPage }} из {{ Math.max(1, Math.ceil(filteredAndSortedFiles.length / itemsPerPage)) }}</span>
            <button @click="currentPage = Math.min(Math.ceil(filteredAndSortedFiles.length / itemsPerPage), currentPage + 1)"
              :disabled="currentPage >= Math.ceil(filteredAndSortedFiles.length / itemsPerPage)"
              class="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </template>

      <!-- Other tabs placeholder -->
      <div v-else class="p-12 text-center text-gray-500">
        <p>Содержимое вкладки "{{ activeTab }}" будет отображено здесь</p>
      </div>
    </div>
  </div>
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
const activeMenu = ref<number | null>(null)
const itemsPerPage = 10

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
</script>
