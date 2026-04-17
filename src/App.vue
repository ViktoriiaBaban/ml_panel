<template>
  <v-app>
    <RouterView v-if="isLoginRoute" />
    <v-layout v-else class="app-layout">
      <Sidebar :activeSection="activeSection" />

      <v-main class="app-main">
        <Header :title="headerProps.title" :breadcrumbs="headerProps.breadcrumbs" />

        <v-container fluid class="content-container">
          <SectionEmptyState
            v-if="sectionRequirement && !sectionRequirement.isReady"
            :missing-services="sectionRequirement.missingServices"
            @open-connections="openConnectionsSettings"
          />
          <RouterView v-else />
        </v-container>
        <ToastNotifications />
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'

import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import type { BreadcrumbItem } from './components/AppBreadcrumbs.vue'
import { resolveBreadcrumb, resolveTitle } from './router/router.ts'
import { useSessionStore } from './stores/session'
import { useNotificationsStore } from './stores/notifications'
import { useIntegrationRequirementsStore } from './stores/integrationRequirements'
import type { AppSection } from './types/integrations'
import ToastNotifications from './components/ToastNotifications.vue'
import SectionEmptyState from './components/SectionEmptyState.vue'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()
const notificationsStore = useNotificationsStore()
const integrationRequirementsStore = useIntegrationRequirementsStore()

const isLoginRoute = computed(() => route.name === 'login')

onMounted(() => {
  notificationsStore.load()
  if (route.name !== 'login') {
    sessionStore.fetchMe()
    integrationRequirementsStore.fetchRequirements()
  }
})

watch(
  () => route.fullPath,
  () => {
    if (route.name !== 'login') {
      integrationRequirementsStore.fetchRequirements()
    }
  },
)

const activeSection = computed(() => String(route.meta.section ?? 'storage'))

const sectionRequirement = computed(() => {
  const section = route.meta.section
  if (typeof section !== 'string') return null
  if (!['storage', 'projects', 'experiments', 'inference', 'etl', 'monitoring'].includes(section)) return null
  return integrationRequirementsStore.getRequirementForSection(section as AppSection)
})

function openConnectionsSettings() {
  router.push({ name: 'profile-settings', query: { tab: 'connections' } })
}

const headerProps = computed(() => {
  const breadcrumbs = route.matched
    .filter((entry) => typeof entry.meta.breadcrumb !== 'undefined')
    .map((entry, index, list): BreadcrumbItem => {
      const isLast = index === list.length - 1
      const params = route.params
      const query = route.query
      const to = entry.name ? router.resolve({ name: entry.name, params, query }).fullPath : undefined

      return {
        title: resolveBreadcrumb(entry, route),
        to: isLast ? undefined : to,
        disabled: isLast,
      }
    })

  return {
    title: resolveTitle(route),
    breadcrumbs,
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
</style>
