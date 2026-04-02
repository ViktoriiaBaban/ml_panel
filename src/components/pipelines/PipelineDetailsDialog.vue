<template>
  <v-dialog :model-value="modelValue" max-width="620" @update:model-value="onDialogToggle">
    <v-card v-if="pipeline" rounded="lg">
      <v-card-title class="dialog-title">
        <span>{{ pipeline.pipelineId }}</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="emit('close')" />
      </v-card-title>
      <v-divider />
      <v-card-text>
        <div class="dialog-meta-row">
          <v-icon icon="mdi-source-branch" size="18" />
          <span>{{ pipeline.branch }}</span>
          <v-chip v-if="pipeline.tag" size="x-small" color="grey-lighten-2">{{ pipeline.tag }}</v-chip>
        </div>

        <div class="dialog-meta-row">
          <v-icon icon="mdi-account" size="18" />
          <span>{{ pipeline.author }}</span>
          <v-icon icon="mdi-clock-outline" size="18" class="ml-4" />
          <span>{{ pipeline.startTime }}</span>
        </div>

        <v-alert type="info" variant="tonal" class="mt-4">
          Длительность: {{ pipeline.duration }}. Всего этапов: {{ pipeline.stages.length }}.
        </v-alert>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="emit('close')">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Pipeline } from '@/types/pipelines'

defineProps<{
  modelValue: boolean
  pipeline: Pipeline | null
}>()

const emit = defineEmits<{
  close: []
  'update:modelValue': [value: boolean]
}>()

function onDialogToggle(value: boolean) {
  emit('update:modelValue', value)
  if (!value) emit('close')
}
</script>

<style scoped>
.dialog-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.dialog-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
