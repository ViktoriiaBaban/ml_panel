<template>
  <div class="filters-row">
    <v-select
      :model-value="branchFilter"
      :items="branchItems"
      item-title="label"
      item-value="value"
      variant="outlined"
      density="comfortable"
      hide-details
      rounded="lg"
      bg-color="white"
      class="filter-select"
      @update:model-value="onBranchUpdate"
    />

    <v-select
      :model-value="statusFilter"
      :items="statusItems"
      item-title="label"
      item-value="value"
      variant="outlined"
      density="comfortable"
      hide-details
      rounded="lg"
      bg-color="white"
      class="filter-select"
      @update:model-value="onStatusUpdate"
    />

    <div class="filters-spacer" />
    <div class="filters-period">Последние 30 дней</div>
  </div>
</template>

<script setup lang="ts">
import type { PipelineFilterItem } from '@/types/pipelines'

defineProps<{
  branchFilter: string
  statusFilter: string
  branchItems: PipelineFilterItem[]
  statusItems: PipelineFilterItem[]
}>()

const emit = defineEmits<{
  'update:branchFilter': [value: string]
  'update:statusFilter': [value: string]
}>()

function onBranchUpdate(value: string) {
  emit('update:branchFilter', value)
}

function onStatusUpdate(value: string) {
  emit('update:statusFilter', value)
}
</script>

<style scoped>
.filters-row {
  align-items: center;
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.filter-select {
  max-width: 220px;
}

.filters-spacer {
  flex: 1;
}

.filters-period {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 14px;
}
</style>
