<template>
  <div class="bg-white border-b border-gray-200 px-8 py-4">
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <template v-for="(crumb, index) in breadcrumbs" :key="index">
            <ChevronRight v-if="index > 0" class="w-4 h-4" />
            <span :class="index === breadcrumbs.length - 1 ? 'text-gray-900' : 'hover:text-gray-900 cursor-pointer'">
              {{ crumb }}
            </span>
          </template>
        </div>
        <h1 class="text-xl font-medium text-[#333333]">{{ title }}</h1>
      </div>
      <div class="flex items-center gap-3">
        <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <HelpCircle class="w-5 h-5 text-gray-600" />
        </button>
        <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell class="w-5 h-5 text-gray-600" />
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, HelpCircle, Bell } from 'lucide-vue-next'

defineProps<{
  title?: string
  breadcrumbs?: string[]
}>()
</script>
