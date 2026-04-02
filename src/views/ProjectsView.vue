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
          @open-pipelines="projectsStore.openPipelinesDialog"
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
      @close-pipelines="projectsStore.closePipelinesDialog"
      @confirm-gitlab="handleGitlabConfirm"
      @confirm-pipelines="handlePipelinesConfirm"
    />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, GitBranch, ExternalLink, PlayCircle, FlaskConical, Bot, Repeat, CheckCircle, XCircle, RefreshCw } from 'lucide-vue-next'
import { useProjectsStore } from '@/stores/projects'
import ProjectsFilters from '@/components/projects/ProjectsFilters.vue'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import ProjectsActionDialogs from '@/components/projects/ProjectsActionDialogs.vue'

const router = useRouter()

const searchTerm = ref('')
const statusFilter = ref('all')

const statusOptions = [
  { label: 'Все', value: 'all' },
  { label: 'С активными пайплайнами', value: 'active' },
  { label: 'С недавними ошибками', value: 'errors' },
]

const emit = defineEmits<{ 'navigate-to-pipelines': [id: number, name: string] }>()
const projectsStore = useProjectsStore()

onMounted(async () => {
  await projectsStore.fetchProjects({ search: projectsStore.searchTerm, status: projectsStore.statusFilter })
})

const handleGitlabConfirm = () => {
  projectsStore.closeGitlabDialog()
}

const handlePipelinesConfirm = () => {
  if (!projectsStore.selectedProject) return
  emit('navigate-to-pipelines', projectsStore.selectedProject.id, projectsStore.selectedProject.name)
  projectsStore.closePipelinesDialog()
}
const filteredProjects = computed(() => projectsStore.items)

function goToPipelines(projectId: number, projectName: string) {
  router.push({ name: 'project-pipelines', params: { projectId }, query: { projectName } })
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


