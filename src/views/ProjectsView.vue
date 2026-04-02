<template>
  <v-container fluid class="projects-view">
    <ProjectsFilters
      :search-term="projectsStore.searchTerm"
      :status-filter="projectsStore.statusFilter"
      :status-options="projectsStore.statusOptions"
      @search="projectsStore.setSearchTerm"
      @status="projectsStore.setStatusFilter"
    />

    <v-row>
      <v-col v-for="project in projectsStore.items" :key="project.id" cols="12" md="6" lg="4">
        <ProjectCard
          :project="project"
          :status="projectsStore.statusConfig[project.pipelineStatus]"
          :type-config="projectsStore.typeConfig"
          @open-gitlab="projectsStore.openGitlabDialog"
        />
      </v-col>
    </v-row>

    <v-card v-if="projectsStore.items.length === 0" class="projects-view__empty" variant="tonal" color="grey-lighten-4">
      <v-card-text class="text-medium-emphasis">Проекты не найдены</v-card-text>
    </v-card>

    <ProjectsActionDialogs
      :gitlab-open="projectsStore.dialogs.gitlab"
      :pipelines-open="projectsStore.dialogs.pipelines"
      :selected-project="projectsStore.selectedProject"
      @close-gitlab="projectsStore.closeGitlabDialog"
      @confirm-gitlab="handleGitlabConfirm"
    />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { useProjectsStore } from '@/stores/projects'
import ProjectsFilters from '@/components/projects/ProjectsFilters.vue'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import ProjectsActionDialogs from '@/components/projects/ProjectsActionDialogs.vue'

const projectsStore = useProjectsStore()

onMounted(async () => {
  await projectsStore.fetchProjects({ search: projectsStore.searchTerm, status: projectsStore.statusFilter })
})

const handleGitlabConfirm = () => {
  projectsStore.closeGitlabDialog()
}

</script>

<style scoped>
.projects-view {
  padding: 32px;
}

.projects-view__empty {
  text-align: center;
  padding: 40px 0;
}
</style>


