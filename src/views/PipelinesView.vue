<template>
  <v-container fluid class="pipelines-view">
    <PipelinesBreadcrumbs :project-name="projectName" @back="goBack" />

    <PipelinesFilters
      :branch-filter="branchFilter"
      :status-filter="statusFilter"
      :branch-items="branchItems"
      :status-items="statusItems"
      @update:branch-filter="onBranchFilterChange"
      @update:status-filter="onStatusFilterChange"
    />

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <div v-if="items.length" class="cards-list">
      <PipelineCard
        v-for="pipeline in items"
        :key="pipeline.id"
        :pipeline="pipeline"
        :expanded="expandedPipelineId === pipeline.id"
        @toggle-details="pipelinesStore.togglePipelineDetails"
        @open-dialog="pipelinesStore.openPipelineDialog"
      />
    </div>

    <v-card v-else class="empty-state" variant="tonal">
      <v-card-text class="text-medium-emphasis">Пайплайны не найдены</v-card-text>
    </v-card>

    <PipelineDetailsDialog
      :model-value="Boolean(selectedPipeline)"
      :pipeline="selectedPipeline"
      @update:model-value="onDialogModelUpdate"
      @close="pipelinesStore.closePipelineDialog"
    />
  </v-container>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import PipelineCard from '@/components/pipelines/PipelineCard.vue'
import PipelineDetailsDialog from '@/components/pipelines/PipelineDetailsDialog.vue'
import PipelinesBreadcrumbs from '@/components/pipelines/PipelinesBreadcrumbs.vue'
import PipelinesFilters from '@/components/pipelines/PipelinesFilters.vue'
import { usePipelinesStore } from '@/stores/pipelines'

const props = defineProps<{ projectId: number; projectName: string }>()

const router = useRouter()

const pipelinesStore = usePipelinesStore()
const { items, loading, error, branchFilter, statusFilter, expandedPipelineId, selectedPipeline, branchItems, statusItems } = storeToRefs(pipelinesStore)

onMounted(async () => {
  await pipelinesStore.init(props.projectId)
})

function onDialogModelUpdate(value: boolean) {
  if (!value) pipelinesStore.closePipelineDialog()
}

async function onBranchFilterChange(value: string) {
  await pipelinesStore.setFilters(value, statusFilter.value)
}

async function onStatusFilterChange(value: string) {
  await pipelinesStore.setFilters(branchFilter.value, value)
}

function goBack() {
  router.push('/projects')
}
</script>

<style scoped>
.pipelines-view {
  padding: 32px;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 32px 0;
  margin-top: 16px;
}
</style>
