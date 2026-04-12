<template>
  <v-navigation-drawer
    :rail="collapsed"
    permanent
    color="white"
    width="272"
    class="align-center"
  >
    <template #prepend>
      <div class="pa-4">
        <v-btn
          :icon="collapsed ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          :title="collapsed ? 'Развернуть меню' : 'Свернуть меню'"
          variant="flat"
          density="compact"
          color="primary"
          class="toggle-btn"
          @click="toggleCollapsed"
        />

        <div class="logo-row">
          <div class="logo-icon">
            <Brain :size="18" />
          </div>
          <span v-if="!collapsed"
                class="logo-title">ML Control Panel</span>
        </div>
      </div>
    </template>

    <v-list nav density="comfortable">
      <v-list-item
        v-for="item in menuItems"
        :key="item.id"
        :prepend-icon="item.icon"
        :active="item.id === activeSection"
        :title="item.label"
        color="primary"
        rounded="lg"
        @click="router.push(item.path)"
      />
    </v-list>

    <template #append>
      <v-card class="d-flex flex-column ga-2 align-center justify-center w-100 pa-4" variant="text">
        <v-card-title class="d-flex ga-2 align-center w-100">
          <v-avatar color="secondary" size="32" icon="mdi-account" />
          <v-card-item v-if="!collapsed" class="pa-2 w-100">
            <v-card-text class="pa-0">
              <template v-if="sessionStore.loading">…</template>
              <template v-else>{{ sessionStore.me?.name || '—' }}</template>
            </v-card-text>
            <v-card-subtitle v-if="sessionStore.me?.jobTitle" class="pa-0">{{ sessionStore.me.jobTitle }}</v-card-subtitle>
          </v-card-item>
        </v-card-title>
        <v-card-actions class="d-flex ga-2" :class="{ 'flex-column': collapsed }">
          <v-btn :title="collapsed ? 'Настройки' : ''" icon="mdi-cog-outline" variant="text" @click="router.push('/profile/settings')" />
          <v-btn
            :title="collapsed ? 'Выйти' : ''"
            icon="mdi-logout"
            variant="text"
            @click="onLogout"
          />
        </v-card-actions>
      </v-card>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Brain } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSessionStore } from '@/stores/session'

defineProps<{ activeSection?: string }>()

const collapsed = ref(false)
const router = useRouter()
const sessionStore = useSessionStore()
const authStore = useAuthStore()

function onLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}

function toggleCollapsed() {
  collapsed.value = !collapsed.value
}

const menuItems = [
  { icon: 'mdi-home-outline', label: 'Главная панель', path: '/', id: 'home' },
  { icon: 'mdi-database-outline', label: 'Данные и хранилища', path: '/storage', id: 'storage' },
  { icon: 'mdi-source-branch', label: 'Проекты и пайплайны', path: '/projects', id: 'projects' },
  { icon: 'mdi-brain', label: 'Эксперименты и обучение', path: '/experiments', id: 'experiments' },
  { icon: 'mdi-flash-outline', label: 'Инференс и сервисы', path: '/inference', id: 'inference' },
  { icon: 'mdi-source-merge', label: 'Потоки данных и ETL', path: '/etl', id: 'etl' },
  { icon: 'mdi-pulse', label: 'Мониторинг и состояние системы', path: '/monitoring/dashboard', id: 'monitoring' },
  { icon: 'mdi-shield-outline', label: 'Администрирование', path: '/administration/users', id: 'administration' },
]
</script>

<style scoped>
.logo-row {
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

.toggle-btn {
  position: absolute;
  top: 20px;
  right: -20px;
}
</style>
