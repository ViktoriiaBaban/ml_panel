<template>
  <v-container fluid class="pa-0">
  <div class="flex-1 bg-[#F5F7FA] p-8">
    <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <div class="flex gap-8 px-6">
          <v-btn v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value"
            :class="['py-4 text-sm font-medium transition-colors relative', activeTab === tab.value ? 'text-[#409EFF]' : 'text-gray-600 hover:text-gray-900']">
            {{ tab.label }}
            <div v-if="activeTab === tab.value" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#409EFF]"></div>
          </v-btn>
        </div>
      </div>

      <!-- Users Tab -->
      <template v-if="activeTab === 'users'">
        <div class="p-6 border-b border-gray-200">
          <v-btn @click="showAddUserModal = true"
            class="px-6 py-2 bg-[#409EFF] text-white rounded-lg hover:bg-[#3a8eef] transition-colors flex items-center gap-2">
            <Plus class="w-4 h-4" />Добавить пользователя
          </v-btn>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th v-for="h in userHeaders" :key="h"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ h }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in adminStore.users" :key="user.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <Crown v-if="user.role === 'admin'" class="w-4 h-4 text-gray-500" />
                    <UserIcon v-else class="w-4 h-4 text-gray-400" />
                    <span class="text-sm text-gray-900">{{ user.role === 'admin' ? 'Администратор' : 'Обычный пользователь' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <CheckCircle v-if="user.status === 'active'" class="w-4 h-4 text-green-600" />
                    <Lock v-else class="w-4 h-4 text-gray-400" />
                    <span class="text-sm text-gray-900">{{ user.status === 'active' ? 'Активен' : 'Заблокирован' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ user.registrationDate }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ user.lastLogin }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <v-btn @click="toggleUserStatus(user.id)" class="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      :title="user.status === 'active' ? 'Заблокировать' : 'Разблокировать'">
                      <Lock v-if="user.status === 'active'" class="w-4 h-4 text-gray-600" />
                      <Unlock v-else class="w-4 h-4 text-gray-600" />
                    </v-btn>
                    <v-btn class="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Редактировать">
                      <Edit class="w-4 h-4 text-[#409EFF]" />
                    </v-btn>
                    <v-btn @click="deleteUser(user.id)" class="p-1.5 hover:bg-red-50 rounded transition-colors" title="Удалить">
                      <Trash2 class="w-4 h-4 text-red-600" />
                    </v-btn>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 text-sm text-gray-600">Всего пользователей: {{ adminStore.users.length }}</div>
      </template>

      <!-- Integrations Tab -->
      <template v-if="activeTab === 'integrations'">
        <div class="p-6">
          <p class="text-sm text-gray-600 mb-6">Мониторинг состояния глобальных подключений, используемых всей платформой.</p>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th v-for="h in integrationHeaders" :key="h"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ h }}</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <template v-for="integration in adminStore.integrations" :key="integration.id">
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <v-btn @click="expandedIntegration = expandedIntegration === integration.id ? null : integration.id"
                        class="text-sm font-medium text-gray-900 hover:text-[#409EFF] transition-colors">{{ integration.name }}</v-btn>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <CheckCircle v-if="integration.status === 'working'" class="w-5 h-5 text-green-600" />
                        <AlertTriangle v-else-if="integration.status === 'warning'" class="w-5 h-5 text-yellow-600" />
                        <AlertCircle v-else class="w-5 h-5 text-red-600" />
                        <span :class="integration.status === 'working' ? 'text-green-600' : integration.status === 'warning' ? 'text-yellow-600' : 'text-red-600'" class="font-medium text-sm">
                          {{ integrationStatusLabels[integration.status] }}
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ integration.lastCheck }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <v-btn @click="checkIntegration(integration.id)" :disabled="checkingIntegration === integration.id"
                        class="px-4 py-1.5 bg-[#409EFF] text-white text-sm rounded hover:bg-[#3a8eef] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <RefreshCw :class="['w-4 h-4', checkingIntegration === integration.id ? 'animate-spin' : '']" />
                        {{ checkingIntegration === integration.id ? 'Проверка...' : 'Проверить сейчас' }}
                      </v-btn>
                    </td>
                  </tr>
                  <tr v-if="expandedIntegration === integration.id && integration.details">
                    <td colspan="4" class="px-6 py-4 bg-gray-50">
                      <div class="space-y-2 text-sm">
                        <div v-if="integration.details.url" class="flex"><span class="text-gray-500 w-48">URL:</span><span class="text-gray-900">{{ integration.details.url }}</span></div>
                        <div v-if="integration.details.version" class="flex"><span class="text-gray-500 w-48">Версия API:</span><span class="text-gray-900">{{ integration.details.version }}</span></div>
                        <div v-if="integration.details.error" class="flex"><span class="text-gray-500 w-48">Ошибка:</span><span class="text-red-600">{{ integration.details.error }}</span></div>
                        <div v-if="integration.details.lastSuccessfulCall" class="flex"><span class="text-gray-500 w-48">Последний успешный вызов:</span><span class="text-gray-900">{{ integration.details.lastSuccessfulCall }}</span></div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
        <div class="px-6 pb-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-2">Health-check проверки:</h4>
            <div class="text-sm text-gray-600 space-y-1">
              <div v-for="check in adminStore.healthChecks" :key="check.name"><strong>{{ check.name }}:</strong> {{ check.command }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Добавить пользователя</h3>
          <v-btn @click="showAddUserModal = false" class="p-1 hover:bg-gray-100 rounded transition-colors">
            <X class="w-5 h-5 text-gray-500" />
          </v-btn>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Логин (Email) <span class="text-red-500">*</span></label>
            <v-text-field type="email" v-model="newUser.email" placeholder="user@example.com"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF]"  variant="outlined" density="comfortable" hide-details />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Имя (опционально)</label>
            <v-text-field type="text" v-model="newUser.name" placeholder="Иванов Иван"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF]"  variant="outlined" density="comfortable" hide-details />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Роль</label>
            <v-select
              v-model="newUser.role"
              :items="roleOptions"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="comfortable"
              hide-details
              class="w-full"
            />
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <v-btn @click="showAddUserModal = false" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Отмена</v-btn>
          <v-btn @click="addUser" :disabled="!newUser.email" class="px-4 py-2 bg-[#409EFF] text-white rounded-lg hover:bg-[#3a8eef] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Добавить</v-btn>
        </div>
      </div>
    </div>
  </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Plus, Lock, Unlock, Trash2, Edit, RefreshCw, X, AlertCircle, CheckCircle, AlertTriangle, Crown, User as UserIcon } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'

const activeTab = ref('users')
const tabs = [
  { value: 'users', label: 'Пользователи' },
  { value: 'integrations', label: 'Системные интеграции' },
]
const userHeaders = ['Логин / Email', 'ФИО / Имя', 'Роль', 'Статус', 'Дата регистрации', 'Последний вход', 'Действия']
const integrationHeaders = ['Компонент', 'Статус', 'Последняя проверка', 'Действия']
const integrationStatusLabels = { working: 'Работает', warning: 'Проблемы с записью', error: 'Не отвечает' } as const
const showAddUserModal = ref(false)
const expandedIntegration = ref<string | null>(null)
const checkingIntegration = ref<string | null>(null)
const newUser = reactive({ email: '', name: '', role: 'user' as 'user' | 'admin' })
const roleOptions = [
  { label: 'Обычный пользователь', value: 'user' },
  { label: 'Администратор', value: 'admin' },
]

const adminStore = useAdminStore()
adminStore.fetchUsers()
watch(activeTab, (tab) => {
  if (tab === 'integrations') adminStore.fetchIntegrations()
})

function toggleUserStatus(id: number) {
  adminStore.toggleUserStatus(id)
}

function deleteUser(id: number) {
  if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
    adminStore.deleteUser(id)
  }
}

function addUser() {
  if (!newUser.email) return
  adminStore.addUser({ email: newUser.email, name: newUser.name, role: newUser.role })
  showAddUserModal.value = false
  newUser.email = ''; newUser.name = ''; newUser.role = 'user'
}

async function checkIntegration(id: string) {
  checkingIntegration.value = id
  await adminStore.checkIntegration(id)
  checkingIntegration.value = null
}
</script>
