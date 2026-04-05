<template>
  <v-container fluid class="storage-page pa-6 pa-md-8">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">Данные и хранилища</h1>
        <p v-if="mode === 'overview'" class="text-medium-emphasis">
          Выберите нужный раздел для работы с бакетами, файлами и таблицами.
        </p>
      </div>

      <v-btn
        v-if="mode === 'details'"
        variant="text"
        class="text-none"
        prepend-icon="mdi-view-dashboard-outline"
        @click="goOverview"
      >
        На главную раздела
      </v-btn>
    </div>

    <StorageOverview
      v-if="mode === 'overview'"
      :buckets-preview="bucketsPreview"
      :files-preview="filesPreview"
      :tables-preview="tablesPreview"
      @open-tab="openTab"
    />

    <StorageDetails
      v-else
      :active-tab="activeTab"
      :search-term="searchTerm"
      :headers="headersByTab[activeTab]"
      :paged-items="pagedItems"
      :items-per-page="itemsPerPage"
      :current-page="currentPage"
      :total-pages="totalPages"
      @update:active-tab="activeTab = $event"
      @update:search-term="searchTerm = $event"
      @set-page="setPage"
    />

    <StorageFab
      v-if="mode === 'details'"
      :expanded="fabExpanded"
      @toggle="fabExpanded = !fabExpanded"
      @upload="openUploadDialog"
      @create-bucket="openCreateBucketDialog"
    />

    <CreateBucketDialog
      v-model="createBucketDialog"
      :form="bucketForm"
      :projects="projects"
      @update:form="bucketForm = $event"
      @save="saveBucket"
    />

    <UploadFileDialog
      v-model="uploadFileDialog"
      :form="uploadForm"
      :file-types="fileTypes"
      :bucket-names="bucketNames"
      @update:form="uploadForm = $event"
      @save="saveUpload"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CreateBucketDialog from '@/components/storage/CreateBucketDialog.vue'
import StorageDetails from '@/components/storage/StorageDetails.vue'
import StorageFab from '@/components/storage/StorageFab.vue'
import StorageOverview from '@/components/storage/StorageOverview.vue'
import UploadFileDialog from '@/components/storage/UploadFileDialog.vue'
import {
  bucketRows,
  fileRows,
  fileTypes,
  headersByTab,
  projects,
  tableRows,
} from './storage/mockData'
import type { BucketForm, StorageMode, StorageRow, StorageTab, UploadForm } from './storage/types'

const mode = ref<StorageMode>('overview')
const activeTab = ref<StorageTab>('buckets')
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const fabExpanded = ref(false)

const createBucketDialog = ref(false)
const uploadFileDialog = ref(false)

const bucketForm = ref<BucketForm>({
  name: '',
  project: 'Общее',
  versioning: true,
  hasLimit: false,
})

const uploadForm = ref<UploadForm>({
  name: '',
  type: 'Датасет',
  bucket: 'Название бакета 1',
})

const buckets = ref<StorageRow[]>([...bucketRows])
const files = ref<StorageRow[]>([...fileRows])
const tables = ref<StorageRow[]>([...tableRows])

const currentItems = computed(() => {
  if (activeTab.value === 'buckets') return buckets.value
  if (activeTab.value === 'files') return files.value
  return tables.value
})

const filteredItems = computed(() => {
  const search = searchTerm.value.trim().toLowerCase()
  if (!search) return currentItems.value
  return currentItems.value.filter((item) =>
    Object.values(item).some((value) => String(value).toLowerCase().includes(search))
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / itemsPerPage)))

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
})

const bucketsPreview = computed(() => buckets.value.slice(0, 5))
const filesPreview = computed(() => files.value.slice(0, 5))
const tablesPreview = computed(() => tables.value.slice(0, 12))
const bucketNames = computed(() => buckets.value.map((item) => String(item.name)))

watch([activeTab, searchTerm], () => {
  currentPage.value = 1
})

watch(totalPages, (value) => {
  if (currentPage.value > value) currentPage.value = value
})

function openTab(tab: StorageTab) {
  activeTab.value = tab
  mode.value = 'details'
}

function goOverview() {
  mode.value = 'overview'
  fabExpanded.value = false
}

function setPage(page: number) {
  if (page < 1) return
  if (page > totalPages.value) return
  currentPage.value = page
}

function openCreateBucketDialog() {
  fabExpanded.value = false
  createBucketDialog.value = true
}

function openUploadDialog() {
  fabExpanded.value = false
  uploadFileDialog.value = true
}

function saveBucket() {
  createBucketDialog.value = false
}

function saveUpload() {
  uploadFileDialog.value = false
}
</script>

<style scoped>
.storage-page {
  position: relative;
}
</style>
