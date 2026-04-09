<template>
  <v-app>
    <RouterView v-if="isLoginRoute" />
    <v-layout v-else class="app-layout">
      <Sidebar :activeSection="activeSection" />

      <v-main class="app-main">
        <Header :title="headerProps.title" :breadcrumbs="headerProps.breadcrumbs" />

        <v-container fluid class="content-container">
          <RouterView />
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'

import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import type { BreadcrumbItem } from './components/AppBreadcrumbs.vue'
import { resolveBreadcrumb, resolveTitle } from './router/router.ts'
import { useSessionStore } from './stores/session'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()

const isLoginRoute = computed(() => route.name === 'login')

onMounted(() => {
  if (route.name !== 'login') {
    sessionStore.fetchMe()
  }
})

const activeSection = computed(() => String(route.meta.section ?? 'storage'))

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
