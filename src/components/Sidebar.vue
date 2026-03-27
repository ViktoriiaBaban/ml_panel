<template>
  <div
    :class="[
      'bg-[#1E1E1E] h-screen flex flex-col text-white transition-all duration-300 ease-in-out relative flex-shrink-0',
      collapsed ? 'w-16' : 'w-64'
    ]"
  >
    <!-- Toggle button -->
    <button
      @click="toggleCollapsed"
      class="absolute -right-3 top-7 z-10 w-6 h-6 bg-[#409EFF] rounded-full flex items-center justify-center shadow-md hover:bg-[#66B1FF] transition-colors"
      :title="collapsed ? 'Развернуть меню' : 'Свернуть меню'"
    >
      <ChevronLeft
        :class="['w-3.5 h-3.5 text-white transition-transform duration-300', collapsed ? 'rotate-180' : '']"
      />
    </button>

    <!-- Logo -->
    <div class="p-4 border-b border-white/10 overflow-hidden">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-[#409EFF] rounded flex items-center justify-center flex-shrink-0">
          <Brain class="w-5 h-5" />
        </div>
        <div
          :class="['overflow-hidden transition-all duration-300 whitespace-nowrap', collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100']"
        >
          <div class="font-semibold text-sm">ML Control Panel</div>
        </div>
      </div>
    </div>

    <!-- Menu Items -->
    <nav class="flex-1 py-4 overflow-y-auto overflow-x-hidden">
      <div
        v-for="item in menuItems"
        :key="item.id"
        @click="$emit('navigate', item.id)"
        :title="collapsed ? item.label : ''"
        :class="[
          'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-4',
          item.id === activeSection
            ? 'bg-[#409EFF]/10 border-[#409EFF] text-white font-semibold'
            : 'text-white/70 hover:text-white hover:bg-white/5 border-transparent'
        ]"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span
          :class="[
            'text-sm overflow-hidden whitespace-nowrap transition-all duration-300',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          ]"
        >
          {{ item.label }}
        </span>
      </div>
    </nav>

    <!-- User Account -->
    <div class="p-4 border-t border-white/10 overflow-hidden">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 bg-[#409EFF] rounded-full flex items-center justify-center flex-shrink-0">
          <User class="w-4 h-4" />
        </div>
        <div
          :class="[
            'flex-1 overflow-hidden transition-all duration-300 whitespace-nowrap',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          ]"
        >
          <div class="text-sm font-medium">Виктория</div>
          <div class="text-xs text-white/70">ML-инженер</div>
        </div>
      </div>
      <div
        :class="['flex gap-2 transition-all duration-300', collapsed ? 'flex-col items-center' : '']"
      >
        <button
          class="flex-1 p-2 hover:bg-white/10 rounded transition-colors"
          :title="collapsed ? 'Настройки' : ''"
        >
          <Settings class="w-4 h-4 mx-auto" />
        </button>
        <button
          class="flex-1 p-2 hover:bg-white/10 rounded transition-colors"
          :title="collapsed ? 'Выйти' : ''"
        >
          <LogOut class="w-4 h-4 mx-auto" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Home, Database, GitBranch, Brain, Zap, GitMerge,
  Activity, Settings, User, LogOut, Shield, ChevronLeft
} from 'lucide-vue-next'

defineProps<{ activeSection?: string }>()
defineEmits<{ navigate: [sectionId: string] }>()

const collapsed = ref(false)

function toggleCollapsed() {
  collapsed.value = !collapsed.value
}

const menuItems = [
  { icon: Home,      label: 'Главная панель',                id: 'home' },
  { icon: Database,  label: 'Данные и хранилища',             id: 'storage' },
  { icon: GitBranch, label: 'Проекты и пайплайны',            id: 'projects' },
  { icon: Brain,     label: 'Эксперименты и обучение',        id: 'experiments' },
  { icon: Zap,       label: 'Инференс и сервисы',             id: 'inference' },
  { icon: GitMerge,  label: 'Потоки данных и ETL',            id: 'etl' },
  { icon: Activity,  label: 'Мониторинг и состояние системы', id: 'monitoring' },
  { icon: Shield,    label: 'Администрирование',              id: 'administration' },
]
</script>
