<template>
  <v-card rounded="lg" class="project-card" elevation="2">
    <v-card-text class="project-card__content">
      <div class="project-card__header">
        <div class="project-card__title-wrap">
          <v-icon icon="mdiSourceBranch" color="primary" size="20" />
          <h3 class="project-card__title">{{ project.name }}</h3>
        </div>

        <v-chip size="small" :color="status.chipColor" variant="tonal" class="project-card__status-chip">
          <v-icon :icon="status.icon" size="12" start />
          {{ status.label }}
        </v-chip>
      </div>

      <p class="project-card__description">{{ project.description }}</p>

      <div class="project-card__meta">
        <div><span class="project-card__meta-title">Группа:</span> {{ project.namespace }}</div>
        <div><span class="project-card__meta-title">Последний коммит:</span> {{ project.lastCommit.author }}, {{ project.lastCommit.time }}</div>
      </div>

      <div class="project-card__types">
        <v-chip v-for="type in project.types" :key="type" size="small" variant="outlined" class="project-card__type-chip">
          <v-icon :icon="typeConfig[type].icon" size="14" start :color="typeConfig[type].iconColor" />
          {{ typeConfig[type].label }}
        </v-chip>
      </div>

      <div class="project-card__actions">
        <v-btn variant="outlined" class="project-card__btn" rounded="lg" @click="emit('open-gitlab', project)">
          <v-icon icon="mdi-open-in-new" size="16" start />
          Открыть в GitLab
        </v-btn>
        <v-btn color="primary" class="project-card__btn" rounded="lg" @click="goToPipelines(project)">
          <v-icon icon="mdi-play-circle-outline" size="16" start />
          Пайплайны
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Project, PipelineStatusConfig, ProjectType, ProjectTypeConfig } from '@/types/projects'
import {router} from '@/router/router.ts';

defineProps<{
  project: Project
  status: PipelineStatusConfig
  typeConfig: Record<ProjectType, ProjectTypeConfig>
}>()

const emit = defineEmits<{
  'open-gitlab': [project: Project]
}>()

function goToPipelines(selectedProject: Project) {
  router.push({ name: 'project-pipelines', params: { projectId: selectedProject.id }, query: { projectName: selectedProject.name } })
}
</script>

<style scoped>
.project-card {
  transition: box-shadow 0.2s;
}

.project-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
}

.project-card__content {
  padding: 24px;
}

.project-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 8px;
}

.project-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-card__title {
  font-size: 18px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

.project-card__description {
  color: rgba(var(--v-theme-on-surface), 0.65);
  margin-bottom: 16px;
}

.project-card__meta {
  margin-bottom: 16px;
  color: rgba(var(--v-theme-on-surface), 0.65);
  font-size: 14px;
}

.project-card__meta-title {
  font-weight: 500;
}

.project-card__types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.project-card__type-chip {
  background: #f9fafb;
}

.project-card__actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.project-card__btn {
  flex: 1;
  text-transform: none;
}
</style>
