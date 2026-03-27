<template>
  <v-app-bar flat color="white" border="b" height="76">
    <div class="header-wrap">
      <div>
        <div class="breadcrumbs">
          <template v-for="(crumb, index) in breadcrumbs" :key="index">
            <ChevronRight v-if="index > 0" :size="14" class="crumb-icon" />
            <span :class="['crumb', { 'crumb-last': index === breadcrumbs.length - 1 }]">
              {{ crumb }}
            </span>
          </template>
        </div>
        <h1 class="header-title">{{ title }}</h1>
      </div>

      <div class="header-actions">
        <v-btn icon variant="text">
          <HelpCircle :size="20" />
        </v-btn>
        <v-badge dot color="error" location="top end">
          <v-btn icon variant="text">
            <Bell :size="20" />
          </v-btn>
        </v-badge>
      </div>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ChevronRight, HelpCircle, Bell } from 'lucide-vue-next'

withDefaults(defineProps<{
  title?: string
  breadcrumbs?: string[]
}>(), {
  title: '',
  breadcrumbs: () => [],
})
</script>

<style scoped>
.header-wrap {
  width: 100%;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 6px;
}

.crumb {
  transition: color 0.2s;
}

.crumb-last {
  color: #111827;
}

.header-title {
  font-size: 24px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
