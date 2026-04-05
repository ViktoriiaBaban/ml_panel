<template>
  <v-card rounded="lg" class="pa-4">
    <div class="d-flex flex-wrap align-center justify-space-between ga-4 mb-4">
      <v-tabs
        :model-value="activeTab"
        color="primary"
        align-tabs="start"
        @update:model-value="onTabChange"
      >
        <v-tab value="buckets" class="text-none">Бакеты</v-tab>
        <v-tab value="files" class="text-none">Файлы</v-tab>
        <v-tab value="tables" class="text-none">Табличные данные</v-tab>
      </v-tabs>

      <v-text-field
        :model-value="searchTerm"
        placeholder="Введите для поиска"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="comfortable"
        hide-details
        class="search-field"
        @update:model-value="emit('update:search-term', String($event ?? ''))"
      />
    </div>

    <v-data-table
      :headers="headers"
      :items="pagedItems"
      :items-per-page="itemsPerPage"
      :page="currentPage"
      hide-default-footer
      class="bordered-table"
    >
      <template #item.type="{ item }">
        <v-chip
          v-if="activeTab === 'files' || activeTab === 'tables'"
          :color="chipColor(item.type)"
          size="small"
          variant="tonal"
        >
          {{ item.type }}
        </v-chip>
        <span v-else>—</span>
      </template>

      <template #item.actions>
        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn icon variant="text" size="small" v-bind="props">
              <MoreHorizontal :size="16" />
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item title="Посмотреть" />
            <v-list-item title="Удалить" base-color="error" />
          </v-list>
        </v-menu>
      </template>
    </v-data-table>

    <div class="d-flex align-center justify-center ga-2 mt-4">
      <v-btn
        icon
        variant="text"
        :disabled="currentPage <= 1"
        @click="emit('set-page', currentPage - 1)"
      >
        <ChevronsLeft :size="16" />
      </v-btn>
      <v-btn
        icon
        variant="text"
        :disabled="currentPage <= 1"
        @click="emit('set-page', currentPage - 1)"
      >
        <ChevronLeft :size="16" />
      </v-btn>
      <span class="page-badge">{{ currentPage }}</span>
      <span class="text-medium-emphasis">из {{ totalPages }}</span>
      <v-btn
        icon
        variant="text"
        :disabled="currentPage >= totalPages"
        @click="emit('set-page', currentPage + 1)"
      >
        <ChevronRight :size="16" />
      </v-btn>
      <v-btn
        icon
        variant="text"
        :disabled="currentPage >= totalPages"
        @click="emit('set-page', currentPage + 1)"
      >
        <ChevronsRight :size="16" />
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-vue-next'
import type { StorageHeader, StorageRow, StorageTab } from '@/views/storage/types'

defineProps<{
  activeTab: StorageTab
  searchTerm: string
  headers: StorageHeader[]
  pagedItems: StorageRow[]
  currentPage: number
  totalPages: number
  itemsPerPage: number
}>()

const emit = defineEmits<{
  (e: 'update:active-tab', tab: StorageTab): void
  (e: 'update:search-term', value: string): void
  (e: 'set-page', page: number): void
}>()

function onTabChange(tab: string | null) {
  if (tab === 'buckets' || tab === 'files' || tab === 'tables') {
    emit('update:active-tab', tab)
  }
}

function chipColor(value: unknown) {
  if (value === 'Исходные данные') return 'orange'
  if (value === 'Признаки') return 'cyan'
  if (value === 'Разметка') return 'cyan'
  if (value === 'Артефакты модели') return 'deep-purple'
  return 'blue'
}
</script>

<style scoped>
.search-field {
  min-width: 360px;
  max-width: 520px;
}

.bordered-table {
  border: 1px solid #d8dce5;
}

.page-badge {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eef0f3;
}
</style>
