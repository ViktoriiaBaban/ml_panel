<template>
  <v-container fluid class="pa-0">
  <div class="flex-1 bg-[#F5F7FA] p-8">
    <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <div class="flex gap-8 px-6">
          <button v-for="tab in ['users','integrations']" :key="tab" @click="activeTab = tab"
            :class="['py-4 text-sm font-medium transition-colors relative', activeTab === tab ? 'text-[#409EFF]' : 'text-gray-600 hover:text-gray-900']">
            {{ tab === 'users' ? 'Пользователи' : 'Системные интеграции' }}
            <div v-if="activeTab === tab" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#409EFF]"></div>
          </button>
        </div>
      </div>

      <!-- Users Tab -->
      <template v-if="activeTab === 'users'">
        <div class="p-6 border-b border-gray-200">
          <button @click="showAddUserModal = true"
            class="px-6 py-2 bg-[#409EFF] text-white rounded-lg hover:bg-[#3a8eef] transition-colors flex items-center gap-2">
            <Plus class="w-4 h-4" />Добавить пользователя
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th v-for="h in ['Логин / Email','ФИО / Имя','Роль','Статус','Дата регистрации','Последний вход','Действия']" :key="h"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ h }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
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
                    <button @click="toggleUserStatus(user.id)" class="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      :title="user.status === 'active' ? 'Заблокировать' : 'Разблокировать'">
                      <Lock v-if="user.status === 'active'" class="w-4 h-4 text-gray-600" />
                      <Unlock v-else class="w-4 h-4 text-gray-600" />
                    </button>
                    <button class="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Редактировать">
                      <Edit class="w-4 h-4 text-[#409EFF]" />
                    </button>
                    <button @click="deleteUser(user.id)" class="p-1.5 hover:bg-red-50 rounded transition-colors" title="Удалить">
                      <Trash2 class="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 text-sm text-gray-600">Всего пользователей: {{ users.length }}</div>
      </template>

      <!-- Integrations Tab -->
      <template v-if="activeTab === 'integrations'">
        <div class="p-6">
          <p class="text-sm text-gray-600 mb-6">Мониторинг состояния глобальных подключений, используемых всей платформой.</p>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th v-for="h in ['Компонент','Статус','Последняя проверка','Действия']" :key="h"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ h }}</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <template v-for="integration in integrations" :key="integration.id">
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <button @click="expandedIntegration = expandedIntegration === integration.id ? null : integration.id"
                        class="text-sm font-medium text-gray-900 hover:text-[#409EFF] transition-colors">{{ integration.name }}</button>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <CheckCircle v-if="integration.status === 'working'" class="w-5 h-5 text-green-600" />
                        <AlertTriangle v-else-if="integration.status === 'warning'" class="w-5 h-5 text-yellow-600" />
                        <AlertCircle v-else class="w-5 h-5 text-red-600" />
                        <span :class="integration.status === 'working' ? 'text-green-600' : integration.status === 'warning' ? 'text-yellow-600' : 'text-red-600'" class="font-medium text-sm">
                          {{ { working: 'Работает', warning: 'Проблемы с записью', error: 'Не отвечает' }[integration.status] }}
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ integration.lastCheck }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <button @click="checkIntegration(integration.id)" :disabled="checkingIntegration === integration.id"
                        class="px-4 py-1.5 bg-[#409EFF] text-white text-sm rounded hover:bg-[#3a8eef] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <RefreshCw :class="['w-4 h-4', checkingIntegration === integration.id ? 'animate-spin' : '']" />
                        {{ checkingIntegration === integration.id ? 'Проверка...' : 'Проверить сейчас' }}
                      </button>
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
              <div><strong>GitLab:</strong> GET /version + GET /projects?membership=true</div>
              <div><strong>MLflow:</strong> GET /api/2.0/mlflow/experiments/list</div>
              <div><strong>MinIO:</strong> mc ls mlflow-artifacts + mc cp test.txt ...</div>
              <div><strong>NiFi:</strong> GET /nifi-api/flow/status</div>
              <div><strong>Nexus:</strong> GET /v2/_catalog (Docker registry)</div>
              <div><strong>BentoML:</strong> GET /docs или bentoml list через CLI</div>
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
          <button @click="showAddUserModal = false" class="p-1 hover:bg-gray-100 rounded transition-colors">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Логин (Email) <span class="text-red-500">*</span></label>
            <input type="email" v-model="newUser.email" placeholder="user@example.com"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF]" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Имя (опционально)</label>
            <input type="text" v-model="newUser.name" placeholder="Иванов Иван"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF]" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Роль</label>
            <select v-model="newUser.role" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#409EFF]">
              <option value="user">Обычный пользователь</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <button @click="showAddUserModal = false" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Отмена</button>
          <button @click="addUser" :disabled="!newUser.email" class="px-4 py-2 bg-[#409EFF] text-white rounded-lg hover:bg-[#3a8eef] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Добавить</button>
        </div>
      </div>
    </div>
  </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, Lock, Unlock, Trash2, Edit, RefreshCw, X, AlertCircle, CheckCircle, AlertTriangle, Crown, User as UserIcon } from 'lucide-vue-next'

const activeTab = ref('users')
const showAddUserModal = ref(false)
const expandedIntegration = ref<string | null>(null)
const checkingIntegration = ref<string | null>(null)
const newUser = reactive({ email: '', name: '', role: 'user' as 'user' | 'admin' })

type UserStatus = 'active' | 'blocked'
interface User { id: number; email: string; name: string; role: 'user' | 'admin'; status: UserStatus; registrationDate: string; lastLogin: string }

const users = ref<User[]>([
  { id: 1, email: 'ivanov@example.com', name: 'Иванов Иван', role: 'user', status: 'active', registrationDate: '2025-11-03', lastLogin: '2026-01-16 09:45' },
  { id: 2, email: 'petrova@example.com', name: 'Петрова Мария', role: 'admin', status: 'active', registrationDate: '2025-10-15', lastLogin: '2026-01-16 10:20' },
  { id: 3, email: 'sidorov@example.com', name: 'Сидоров Петр', role: 'user', status: 'blocked', registrationDate: '2025-12-01', lastLogin: '2026-01-10 14:30' },
  { id: 4, email: 'victoria@example.com', name: 'Виктория', role: 'user', status: 'active', registrationDate: '2025-09-20', lastLogin: '2026-01-16 10:30' },
  { id: 5, email: 'kozlov@example.com', name: 'Козлов Андрей', role: 'user', status: 'active', registrationDate: '2025-11-18', lastLogin: '2026-01-15 18:15' },
])

type IntegrationStatus = 'working' | 'warning' | 'error'
interface Integration { id: string; name: string; status: IntegrationStatus; lastCheck: string; details?: { url?: string; version?: string; error?: string; lastSuccessfulCall?: string } }

const integrations = ref<Integration[]>([
  { id: 'gitlab', name: 'GitLab CE', status: 'working', lastCheck: '2026-01-16 10:45', details: { url: 'https://gitlab.internal', version: 'v4' } },
  { id: 'mlflow', name: 'MLflow Tracking Server', status: 'working', lastCheck: '2026-01-16 10:44', details: { url: 'http://mlflow.internal:5000' } },
  { id: 'minio', name: 'MinIO (Object Storage)', status: 'warning', lastCheck: '2026-01-16 10:40', details: { url: 'minio.internal:9000', error: 'Проблемы с записью: AccessDenied' } },
  { id: 'nifi', name: 'Apache NiFi', status: 'working', lastCheck: '2026-01-16 10:45', details: { url: 'http://nifi.internal:8080' } },
  { id: 'nexus', name: 'Nexus Repository (Docker)', status: 'working', lastCheck: '2026-01-16 10:30', details: { url: 'nexus.internal:8081' } },
  { id: 'bentoml', name: 'BentoML (Deployment)', status: 'error', lastCheck: '2026-01-16 10:20', details: { url: 'http://bentoml-api:3000', error: 'Connection timeout', lastSuccessfulCall: '2026-01-16 09:15' } },
])

function toggleUserStatus(id: number) {
  const user = users.value.find(u => u.id === id)
  if (user) user.status = user.status === 'active' ? 'blocked' : 'active'
}

function deleteUser(id: number) {
  if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
    users.value = users.value.filter(u => u.id !== id)
  }
}

function addUser() {
  if (!newUser.email) return
  users.value.push({
    id: Math.max(...users.value.map(u => u.id)) + 1,
    email: newUser.email,
    name: newUser.name || newUser.email.split('@')[0],
    role: newUser.role,
    status: 'active',
    registrationDate: new Date().toISOString().split('T')[0],
    lastLogin: '—',
  })
  showAddUserModal.value = false
  newUser.email = ''; newUser.name = ''; newUser.role = 'user'
}

async function checkIntegration(id: string) {
  checkingIntegration.value = id
  await new Promise(r => setTimeout(r, 1500))
  const integration = integrations.value.find(i => i.id === id)
  if (integration) {
    integration.status = Math.random() > 0.3 ? 'working' : 'warning'
    integration.lastCheck = new Date().toLocaleString('ru-RU').replace(',', '')
  }
  checkingIntegration.value = null
}
</script>
