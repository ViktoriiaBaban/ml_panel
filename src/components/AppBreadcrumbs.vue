<template>
  <v-breadcrumbs :items="items" class="app-breadcrumbs" divider="/">
    <template #item="{ item }">
      <RouterLink
        v-if="item.to && !item.disabled"
        :to="item.to"
        class="crumb-link"
      >
        {{ item.title }}
      </RouterLink>
      <span v-else class="crumb-current">{{ item.title }}</span>
    </template>
  </v-breadcrumbs>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

export type BreadcrumbItem = {
  title: string
  to?: string
  disabled?: boolean
}

withDefaults(defineProps<{
  items?: BreadcrumbItem[]
}>(), {
  items: () => [],
})
</script>

<style scoped>
.app-breadcrumbs {
  padding: 0;
  margin-bottom: 6px;
  color: #6b7280;
  font-size: 13px;
}

.crumb-link {
  color: #6b7280;
  text-decoration: none;
}

.crumb-link:hover {
  color: #409eff;
}

.crumb-current {
  color: #111827;
}
</style>
