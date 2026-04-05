<template>
  <v-container fluid class="storage-page pa-6 pa-md-8">
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
      :paged-items="currentItems"
      :items-per-page="itemsPerPage"
      :current-page="currentPage"
      :total-pages="totalPages"
      @update:active-tab="onTabChange"
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
import { useRoute, useRouter } from 'vue-router'
import CreateBucketDialog from '@/components/storage/CreateBucketDialog.vue'
import StorageDetails from '@/components/storage/StorageDetails.vue'
import StorageFab from '@/components/storage/StorageFab.vue'
import StorageOverview from '@/components/storage/StorageOverview.vue'
import UploadFileDialog from '@/components/storage/UploadFileDialog.vue'
import { api } from '@/lib/api'
import { fileTypes, headersByTab, projects } from './storage/mockData'
import type { BucketForm, StorageMode, StorageRow, StorageTab, UploadForm } from './storage/types'

type PagedResponse = {
  items: StorageRow[]
  total: number
  page: number
  perPage: number
}

type OverviewResponse = {
  buckets: StorageRow[]
  files: StorageRow[]
  tables: StorageRow[]
}

const route = useRoute()
const router = useRouter()

const routeToTab: Partial<Record<string, StorageTab>> = {
  'storage-buckets': 'buckets',
  'storage-files': 'files',
  'storage-tables': 'tables',
}

const tabToRoute: Record<StorageTab, string> = {
  buckets: 'storage-buckets',
  files: 'storage-files',
  tables: 'storage-tables',
}

const endpointByTab: Record<StorageTab, string> = {
  buckets: 'buckets',
  files: 'files',
  tables: 'tables',
}

const mode = ref<StorageMode>('overview')
const activeTab = ref<StorageTab>('buckets')
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const fabExpanded = ref(false)

const createBucketDialog = ref(false)
const uploadFileDialog = ref(false)

const overview = ref<OverviewResponse>({ buckets: [], files: [], tables: [] })
const buckets = ref<StorageRow[]>([])
const files = ref<StorageRow[]>([])
const tables = ref<StorageRow[]>([])
const totals = ref<Record<StorageTab, number>>({ buckets: 0, files: 0, tables: 0 })

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
  file: null,
})

const currentItems = computed(() => {
  if (activeTab.value === 'buckets') return buckets.value
  if (activeTab.value === 'files') return files.value
  return tables.value
})

const totalPages = computed(() => {
  const total = totals.value[activeTab.value]
  return Math.max(1, Math.ceil(total / itemsPerPage))
})

const bucketsPreview = computed(() => overview.value.buckets)
const filesPreview = computed(() => overview.value.files)
const tablesPreview = computed(() => overview.value.tables)
const bucketNames = computed(() => {
  const source = overview.value.buckets.length ? overview.value.buckets : buckets.value
  return source.map((item) => String(item.name))
})

watch(
  () => route.name,
  (name) => {
    const routeName = typeof name === 'string' ? name : ''
    if (routeName === 'storage-overview') {
      mode.value = 'overview'
      fabExpanded.value = false
      fetchOverview()
      return
    }

    const tab = routeToTab[routeName]
    if (tab) {
      mode.value = 'details'
      activeTab.value = tab
      fetchTabData(tab, currentPage.value)
    }
  },
  { immediate: true }
)

watch(searchTerm, () => {
  currentPage.value = 1
  if (mode.value === 'details') fetchTabData(activeTab.value, 1)
})

function openTab(tab: StorageTab) {
  activeTab.value = tab
  currentPage.value = 1
  router.push({ name: tabToRoute[tab] })
}

function onTabChange(tab: StorageTab) {
  openTab(tab)
}

function setPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchTabData(activeTab.value, page)
}

async function fetchOverview() {
  const params = new URLSearchParams({ bucketsLimit: '5', filesLimit: '5', tablesLimit: '10' })
  const res = await api.get<OverviewResponse>(`/storage/overview?${params.toString()}`)
  overview.value = {
    buckets: res.buckets,
    files: res.files.map((x) => normalizeFileRow(x)),
    tables: res.tables,
  }
}

async function fetchTabData(tab: StorageTab, page: number) {
  const params = new URLSearchParams({
    search: searchTerm.value,
    page: String(page),
    perPage: String(itemsPerPage),
  })

  if (tab === 'files') {
    params.set('type', 'Все типы')
    params.set('sortDirection', 'asc')
  }

  const res = await api.get<PagedResponse>(`/storage/${endpointByTab[tab]}?${params.toString()}`)
  totals.value[tab] = res.total

  if (tab === 'buckets') buckets.value = res.items
  if (tab === 'files') files.value = res.items.map((x) => normalizeFileRow(x))
  if (tab === 'tables') tables.value = res.items
}

function normalizeFileRow(row: StorageRow): StorageRow {
  if ('uploadedAt' in row) return row
  if ('date' in row) {
    return { ...row, uploadedAt: row.date }
  }
  return row
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
