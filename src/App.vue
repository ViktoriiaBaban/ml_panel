<template>
  <v-app>
    <v-layout class="app-layout">
      <Sidebar :activeSection="activeSection" @navigate="handleNavigate" />

      <v-main class="app-main">
        <Header :title="headerProps.title" :breadcrumbs="headerProps.breadcrumbs" />

        <v-container fluid class="content-container">
          <FileTable v-if="activeSection === 'storage'" />
          <template v-else-if="activeSection === 'projects'">
            <PipelinesView
              v-if="projectsSubView === 'pipelines' && selectedProject"
              :projectId="selectedProject.id"
              :projectName="selectedProject.name"
              @back="handleBackToProjects"
            />
            <ProjectsView v-else @navigate-to-pipelines="handleNavigateToPipelines" />
          </template>
          <template v-else-if="activeSection === 'inference'">
            <InferenceMonitoringView
              v-if="inferenceSubView === 'monitoring' && selectedService"
              :serviceId="selectedService.id"
              :serviceName="selectedService.name"
              @back="handleBackToServices"
            />
            <InferenceServicesView v-else @navigate-to-monitoring="handleNavigateToMonitoring" />
          </template>
          <template v-else-if="activeSection === 'etl'">
            <EtlFlowDetailView
              v-if="etlSubView === 'detail' && selectedFlow"
              :flow="selectedFlow"
              @back="handleBackToFlows"
            />
            <EtlFlowsView v-else @navigate-to-detail="handleNavigateToFlowDetail" />
          </template>
          <MonitoringSystemView v-else-if="activeSection === 'monitoring'" />
          <AdministrationView v-else-if="activeSection === 'administration'" />

          <v-card v-else class="empty-state" elevation="2" rounded="lg">
            <v-card-text class="text-center text-medium-emphasis">
              Раздел "{{ activeSection }}" в разработке
            </v-card-text>
          </v-card>
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import FileTable from './views/FileTable.vue'
import ProjectsView from './views/ProjectsView.vue'
import PipelinesView from './views/PipelinesView.vue'
import InferenceServicesView from './views/InferenceServicesView.vue'
import InferenceMonitoringView from './views/InferenceMonitoringView.vue'
import AdministrationView from './views/AdministrationView.vue'
import EtlFlowsView from './views/EtlFlowsView.vue'
import EtlFlowDetailView from './views/EtlFlowDetailView.vue'
import MonitoringSystemView from './views/MonitoringSystemView.vue'

import type { EtlFlow } from './stores/etl'
import type { EtlSubView, InferenceSubView, ProjectsSubView, Section } from './types/app'

const activeSection = ref<Section>('storage')
const projectsSubView = ref<ProjectsSubView>('list')
const selectedProject = ref<{ id: number; name: string } | null>(null)
const inferenceSubView = ref<InferenceSubView>('list')
const selectedService = ref<{ id: number; name: string } | null>(null)
const etlSubView = ref<EtlSubView>('list')
const selectedFlow = ref<EtlFlow | null>(null)

function handleNavigate(sectionId: string) {
  activeSection.value = sectionId as Section
  if (sectionId !== 'projects') { projectsSubView.value = 'list'; selectedProject.value = null }
  if (sectionId !== 'inference') { inferenceSubView.value = 'list'; selectedService.value = null }
  if (sectionId !== 'etl') { etlSubView.value = 'list'; selectedFlow.value = null }
}

function handleNavigateToPipelines(projectId: number, projectName: string) {
  selectedProject.value = { id: projectId, name: projectName }
  projectsSubView.value = 'pipelines'
}
function handleBackToProjects() { projectsSubView.value = 'list'; selectedProject.value = null }

function handleNavigateToMonitoring(serviceId: number, serviceName: string) {
  selectedService.value = { id: serviceId, name: serviceName }
  inferenceSubView.value = 'monitoring'
}
function handleBackToServices() { inferenceSubView.value = 'list'; selectedService.value = null }

function handleNavigateToFlowDetail(flow: EtlFlow) {
  selectedFlow.value = flow
  etlSubView.value = 'detail'
}
function handleBackToFlows() { etlSubView.value = 'list'; selectedFlow.value = null }

const headerProps = computed(() => {
  switch (activeSection.value) {
    case 'storage':
      return { title: 'Объектное хранилище', breadcrumbs: ['Главная', 'Данные и хранилища', 'Объектное хранилище'] }
    case 'projects':
      if (projectsSubView.value === 'pipelines' && selectedProject.value)
        return { title: 'Пайплайны', breadcrumbs: ['Главная', 'Проекты и пайплайны', 'Пайплайны', selectedProject.value.name] }
      return { title: 'Мои проекты', breadcrumbs: ['Главная', 'Проекты и пайплайны', 'Мои проекты'] }
    case 'inference':
      if (inferenceSubView.value === 'monitoring' && selectedService.value)
        return { title: 'Мониторинг инференса', breadcrumbs: ['Главная', 'Инференс-сервисы', selectedService.value.name] }
      return { title: 'Инференс-сервисы', breadcrumbs: ['Главная', 'Инференс-сервисы'] }
    case 'etl':
      if (etlSubView.value === 'detail' && selectedFlow.value)
        return { title: 'Мониторинг потока', breadcrumbs: ['Главная', 'Потоки данных и ETL', selectedFlow.value.name] }
      return { title: 'Потоки данных и ETL', breadcrumbs: ['Главная', 'Потоки данных и ETL'] }
    case 'monitoring':
      return { title: 'Мониторинг и состояние системы', breadcrumbs: ['Главная', 'Мониторинг и состояние системы'] }
    case 'administration':
      return { title: 'Администрирование', breadcrumbs: ['Главная', 'Администрирование'] }
    default:
      return { title: 'ML Control Panel', breadcrumbs: ['Главная'] }
  }
})
</script>

<style scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
}

.app-main {
  background-color: #f5f7fa;
  height: 100vh;
  overflow-y: auto;
}

.content-container {
  padding: 0;
  max-width: 100%;
}

.empty-state {
  margin: 32px;
}
</style>
