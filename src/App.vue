<template>
  <div class="flex h-screen bg-[#F5F7FA]">
    <Sidebar :activeSection="activeSection" @navigate="handleNavigate" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Header :title="headerProps.title" :breadcrumbs="headerProps.breadcrumbs" />
      <div class="flex-1 overflow-y-auto">
        <FileTable v-if="activeSection === 'storage'" />
        <template v-else-if="activeSection === 'projects'">
          <PipelinesView
            v-if="projectsSubView === 'pipelines' && selectedProject"
            :projectName="selectedProject.name"
            @back="handleBackToProjects"
          />
          <ProjectsView v-else @navigate-to-pipelines="handleNavigateToPipelines" />
        </template>
        <template v-else-if="activeSection === 'inference'">
          <InferenceMonitoringView
            v-if="inferenceSubView === 'monitoring' && selectedService"
            :serviceName="selectedService.name"
            @back="handleBackToServices"
          />
          <InferenceServicesView v-else @navigate-to-monitoring="handleNavigateToMonitoring" />
        </template>
        <template v-else-if="activeSection === 'etl'">
          <EtlFlowDetailView
            v-if="etlSubView === 'detail' && selectedFlow"
            :flowName="selectedFlow.name"
            @back="handleBackToFlows"
          />
          <EtlFlowsView v-else @navigate-to-detail="handleNavigateToFlowDetail" />
        </template>
        <MonitoringSystemView v-else-if="activeSection === 'monitoring'" />
        <AdministrationView v-else-if="activeSection === 'administration'" />
        <div v-else class="flex-1 bg-[#F5F7FA] p-8">
          <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-12 text-center">
            <p class="text-gray-500">Раздел "{{ activeSection }}" в разработке</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import FileTable from './components/FileTable.vue'
import ProjectsView from './components/ProjectsView.vue'
import PipelinesView from './components/PipelinesView.vue'
import InferenceServicesView from './components/InferenceServicesView.vue'
import InferenceMonitoringView from './components/InferenceMonitoringView.vue'
import AdministrationView from './components/AdministrationView.vue'
import EtlFlowsView from './components/EtlFlowsView.vue'
import EtlFlowDetailView from './components/EtlFlowDetailView.vue'
import MonitoringSystemView from './components/MonitoringSystemView.vue'

type Section = 'storage' | 'projects' | 'home' | 'experiments' | 'inference' | 'etl' | 'monitoring' | 'settings' | 'administration'
type ProjectsSubView = 'list' | 'pipelines'
type InferenceSubView = 'list' | 'monitoring'
type EtlSubView = 'list' | 'detail'

const activeSection = ref<Section>('storage')
const projectsSubView = ref<ProjectsSubView>('list')
const selectedProject = ref<{ id: number; name: string } | null>(null)
const inferenceSubView = ref<InferenceSubView>('list')
const selectedService = ref<{ id: number; name: string } | null>(null)
const etlSubView = ref<EtlSubView>('list')
const selectedFlow = ref<{ id: number; name: string } | null>(null)

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

function handleNavigateToFlowDetail(flowId: number, flowName: string) {
  selectedFlow.value = { id: flowId, name: flowName }
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
