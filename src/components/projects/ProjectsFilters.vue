<template>
  <div class="projects-filters">
    <v-text-field
      :model-value="searchTerm"
      placeholder="Поиск по названию проекта..."
      variant="outlined"
      density="comfortable"
      hide-details
      rounded="lg"
      bg-color="white"
      class="projects-filters__search"
      @update:model-value="onSearchUpdate"
    >
      <template #prepend-inner>
        <v-icon icon="mdiMagnify" size="18" color="medium-emphasis" />
      </template>
    </v-text-field>

    <v-select
      :model-value="statusFilter"
      :items="statusOptions"
      item-title="label"
      item-value="value"
      variant="outlined"
      density="comfortable"
      hide-details
      rounded="lg"
      bg-color="white"
      class="projects-filters__status"
      @update:model-value="onStatusUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProjectsQuery, StatusOption } from '@/types/projects'

defineProps<{
  searchTerm: string
  statusFilter: Required<ProjectsQuery>['status']
  statusOptions: StatusOption[]
}>()

const emit = defineEmits<{
  search: [value: string]
  status: [value: Required<ProjectsQuery>['status']]
}>()

const onSearchUpdate = (value: string | null) => {
  emit('search', value ?? '')
}

const onStatusUpdate = (value: Required<ProjectsQuery>['status'] | null) => {
  emit('status', value ?? 'all')
}
</script>

<style scoped>
.projects-filters {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.projects-filters__search {
  flex: 1;
}

.projects-filters__status {
  max-width: 320px;
}
</style>
