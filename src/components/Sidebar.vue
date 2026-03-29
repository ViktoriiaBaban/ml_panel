<template>
  <v-navigation-drawer
    :rail="collapsed"
    permanent
    color="#1E1E1E"
    theme="dark"
    width="272"
    rail-width="72"
    class="sidebar"
  >
    <template #prepend>
      <div class="sidebar-top">
        <v-btn
          icon
          size="small"
          color="primary"
          class="toggle-btn"
          :title="collapsed ? 'Развернуть меню' : 'Свернуть меню'"
          @click="toggleCollapsed"
        >
          <ChevronLeft :size="14" :class="{ 'rotated': collapsed }" />
        </v-btn>

        <div class="logo-row">
          <div class="logo-icon">
            <Brain :size="18" />
          </div>
          <span v-if="!collapsed" class="logo-title">ML Control Panel</span>
        </div>
      </div>
    </template>

    <v-list nav density="comfortable" class="menu-list">
      <v-list-item
        v-for="item in menuItems"
        :key="item.id"
        :active="item.id === activeSection"
        color="primary"
        rounded="lg"
        :title="collapsed ? item.label : undefined"
        @click="$emit('navigate', item.id)"
      >
        <template #prepend>
          <component :is="item.icon" :size="18" />
        </template>
        <v-list-item-title v-if="!collapsed">{{ item.label }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <template #append>
      <div class="sidebar-bottom">
        <div class="user-row">
          <v-avatar color="primary" size="32">
            <User :size="16" />
          </v-avatar>
          <div v-if="!collapsed" class="user-text">
            <div class="user-name">Виктория</div>
            <div class="user-role">ML-инженер</div>
          </div>
        </div>
        <div class="actions-row" :class="{ stacked: collapsed }">
          <v-btn icon variant="text" :title="collapsed ? 'Настройки' : ''">
            <Settings :size="16" />
          </v-btn>
          <v-btn icon variant="text" :title="collapsed ? 'Выйти' : ''">
            <LogOut :size="16" />
          </v-btn>
        </div>
      </div>
    </template>
  </v-navigation-drawer>
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

<style scoped>
.sidebar {
  position: relative;
  height: 100vh !important;
  max-height: 100vh !important;
}

.sidebar :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-top,
.sidebar-bottom {
  padding: 16px;
}

.logo-row,
.user-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-title {
  font-size: 14px;
  font-weight: 600;
}

.menu-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-inline: 8px;
}

.toggle-btn {
  position: absolute;
  top: 20px;
  right: -16px;
  z-index: 20;
}

.rotated {
  transform: rotate(180deg);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.user-role {
  font-size: 12px;
  opacity: 0.75;
}

.actions-row {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.actions-row.stacked {
  flex-direction: column;
}
</style>
