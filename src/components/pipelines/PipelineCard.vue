<template>
  <v-card rounded="lg" elevation="2">
    <v-card-text class="pipeline-card-content">
      <div class="card-header">
        <div class="card-title-group">
          <v-btn variant="text" class="pipeline-link" @click="emit('open-dialog', pipeline.id)">
            {{ pipeline.pipelineId }}
            <v-icon icon="mdi-open-in-new" size="16" class="ml-1" />
          </v-btn>

          <div class="meta-inline">
            <v-icon icon="mdi-source-branch" size="16" />
            <span>{{ pipeline.branch }}</span>
            <template v-if="pipeline.tag">
              <v-icon icon="mdi-tag-outline" size="16" class="ml-2" />
              <span>{{ pipeline.tag }}</span>
            </template>
          </div>
        </div>

        <v-chip size="small" :color="pipelineStatusConfig[pipeline.status].chipColor" variant="tonal" class="font-weight-medium">
          {{ pipelineStatusConfig[pipeline.status].label }}
        </v-chip>
      </div>

      <div class="meta-row">
        <div class="meta-item"><v-icon icon="mdi-account" size="16" /><span>{{ pipeline.author }}</span></div>
        <div class="meta-item"><v-icon icon="mdi-clock-outline" size="16" /><span>{{ pipeline.startTime }}</span></div>
        <div class="meta-item"><span class="meta-label">Длительность:</span><span>{{ pipeline.duration }}</span></div>
      </div>

      <div class="timeline-row">
        <template v-for="(stage, index) in pipeline.stages" :key="index">
          <div class="timeline-stage">
            <v-avatar :color="stageStatusConfig[stage.status].color" size="32">
              <v-icon :icon="stageStatusConfig[stage.status].icon" color="white" size="14" />
            </v-avatar>
            <span class="timeline-label">{{ stage.name }}</span>
          </div>
          <div v-if="index < pipeline.stages.length - 1" class="timeline-line" />
        </template>
      </div>

      <v-btn variant="text" color="primary" class="toggle-details-btn" @click="emit('toggle-details', pipeline.id)">
        <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" class="mr-2" />
        {{ expanded ? 'Скрыть детали' : 'Показать детали' }}
      </v-btn>
    </v-card-text>

    <v-expand-transition>
      <div v-if="expanded" class="details-wrap">
        <div class="details-body">
          <v-sheet v-for="(stage, index) in pipeline.stages" :key="index" rounded="lg" color="grey-lighten-4" class="stage-sheet">
            <div class="stage-header">
              <div class="stage-title-group">
                <span class="stage-title">{{ stage.name }}</span>
                <v-chip size="x-small" :class="stageBadgeClassMap[stage.status]">{{ stageStatusConfig[stage.status].label }}</v-chip>
              </div>
              <span v-if="stage.duration" class="stage-duration">{{ stage.duration }}</span>
            </div>

            <div v-if="stage.mlflowRun || stage.bentoService || stage.nifiFlow" class="stage-links">
              <div v-if="stage.mlflowRun">MLflow run: <a href="#" class="resource-link">{{ stage.mlflowRun }}</a></div>
              <div v-if="stage.bentoService">Bento service: <a href="#" class="resource-link">{{ stage.bentoService }}</a></div>
              <div v-if="stage.nifiFlow">NiFi flow: <a href="#" class="resource-link">{{ stage.nifiFlow }}</a></div>
            </div>
          </v-sheet>
        </div>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import type { Pipeline } from '@/types/pipelines'
import { pipelineStatusConfig, stageBadgeClassMap, stageStatusConfig } from '@/types/pipelines'

defineProps<{
  pipeline: Pipeline
  expanded: boolean
}>()

const emit = defineEmits<{
  'toggle-details': [pipelineId: number]
  'open-dialog': [pipelineId: number]
}>()
</script>

<style scoped>
.pipeline-card-content {
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
}

.card-title-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.pipeline-link {
  text-transform: none;
  min-width: auto;
  padding: 0;
  color: rgb(var(--v-theme-primary));
  font-size: 20px;
  font-weight: 600;
}

.meta-inline,
.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 14px;
  flex-wrap: wrap;
}

.meta-row {
  gap: 24px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.timeline-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.timeline-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-label {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.timeline-line {
  width: 48px;
  height: 2px;
  background: #d1d5db;
  margin: 0 4px;
}

.toggle-details-btn {
  text-transform: none;
  min-width: auto;
  padding: 0;
}

.details-wrap {
  padding: 0 24px 24px;
  border-top: 1px solid #e5e7eb;
}

.details-body {
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stage-sheet {
  padding: 16px;
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.stage-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stage-title {
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.stage-duration {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.stage-links {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}

.resource-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

:deep(.stage-chip--success) {
  background-color: #dcfce7;
  color: #166534;
}

:deep(.stage-chip--failed) {
  background-color: #fee2e2;
  color: #991b1b;
}

:deep(.stage-chip--running) {
  background-color: #dbeafe;
  color: #1e40af;
}

:deep(.stage-chip--warning) {
  background-color: #fef3c7;
  color: #92400e;
}

:deep(.stage-chip--pending) {
  background-color: #f3f4f6;
  color: #374151;
}
</style>
