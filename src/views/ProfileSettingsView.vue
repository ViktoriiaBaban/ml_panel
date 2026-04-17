<template>
  <v-container fluid class="profile-view">
    <v-alert v-if="profileStore.error" type="error" variant="tonal" class="mb-4">{{ profileStore.error }}</v-alert>

    <v-card rounded="xl" class="settings-shell">
      <v-row no-gutters>
        <v-col cols="12" md="3" class="settings-nav-col">
          <div class="settings-nav">
            <div class="text-h6 font-weight-bold mb-1">Настройки</div>
            <p class="text-body-2 text-medium-emphasis mb-4">Управление профилем и подключениями</p>

            <v-list nav density="comfortable" class="pa-0" bg-color="transparent">
              <v-list-item
                v-for="tab in tabs"
                :key="tab.value"
                :active="activeTab === tab.value"
                rounded="lg"
                class="mb-2"
                @click="activeTab = tab.value"
              >
                <template #prepend>
                  <v-icon :icon="tab.icon" size="20" />
                </template>
                <v-list-item-title>{{ tab.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </v-col>

        <v-col cols="12" md="9" class="settings-content-col">
          <div class="settings-content">
            <section v-if="activeTab === 'profile'" class="tab-section">
              <div class="text-h5 font-weight-bold mb-1">Личные данные</div>
              <p class="text-body-2 text-medium-emphasis mb-6">Основная информация профиля</p>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="profileStore.profile.name"
                    label="Имя"
                    @update:model-value="profileStore.setProfileField('name', String($event ?? ''))"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="profileStore.profile.email"
                    label="Email"
                    @update:model-value="profileStore.setProfileField('email', String($event ?? ''))"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="profileStore.profile.role"
                    label="Роль"
                    readonly
                    variant="filled"
                    density="comfortable"
                  />
                </v-col>
              </v-row>

              <div class="d-flex justify-end mt-2">
                <v-btn color="primary" variant="flat" @click="onSaveProfile">Сохранить изменения</v-btn>
              </div>
            </section>

            <section v-else-if="activeTab === 'security'" class="tab-section">
              <div class="text-h5 font-weight-bold mb-1">Безопасность</div>
              <p class="text-body-2 text-medium-emphasis mb-6">Смена пароля и удаление аккаунта</p>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="profileStore.passwordForm.currentPassword"
                    label="Текущий пароль"
                    type="password"
                    autocomplete="current-password"
                    @update:model-value="profileStore.setPasswordField('currentPassword', String($event ?? ''))"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="profileStore.passwordForm.newPassword"
                    label="Новый пароль"
                    type="password"
                    autocomplete="new-password"
                    @update:model-value="profileStore.setPasswordField('newPassword', String($event ?? ''))"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="profileStore.passwordForm.confirmPassword"
                    label="Подтверждение нового пароля"
                    type="password"
                    autocomplete="new-password"
                    @update:model-value="profileStore.setPasswordField('confirmPassword', String($event ?? ''))"
                  />
                </v-col>
              </v-row>

              <div class="d-flex align-center ga-3 flex-wrap mt-2">
                <v-btn color="primary" variant="flat" @click="profileStore.changePassword">Изменить пароль</v-btn>
                <v-btn color="error" variant="outlined" @click="profileStore.openDeleteDialog">Удалить учётную запись</v-btn>
              </div>
            </section>

            <section v-else class="tab-section">
              <div class="text-h5 font-weight-bold mb-1">Подключения</div>
              <p class="text-body-2 text-medium-emphasis mb-6">
                Каждый пользователь привязывает свои аккаунты самостоятельно.
              </p>

              <v-data-table
                :items="profileStore.connections"
                :headers="connectionHeaders"
                item-value="serviceId"
                :loading="profileStore.loading"
              >
                <template #item.connected="{ item }">
                  <div class="d-flex align-center ga-2">
                    <v-icon
                      :icon="item.connected ? 'mdi-check-circle' : 'mdi-link-off'"
                      :color="item.connected ? 'success' : 'grey'"
                      size="18"
                    />
                    <span>{{ item.connected ? 'Подключено' : 'Не подключено' }}</span>
                  </div>
                </template>
                <template #item.username="{ item }">
                  {{ item.username || '—' }}
                </template>
                <template #item.actions="{ item }">
                  <v-btn
                    size="small"
                    color="primary"
                    :variant="item.connected ? 'outlined' : 'flat'"
                    @click="profileStore.openConnectionDialog(item.serviceId)"
                  >
                    {{ item.connected ? 'Изменить привязку' : 'Привязать аккаунт' }}
                  </v-btn>
                </template>
              </v-data-table>
            </section>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-dialog
      :model-value="profileStore.showConnectionDialog"
      max-width="560"
      @update:model-value="(v) => !v && profileStore.closeConnectionDialog()"
    >
      <v-card rounded="lg">
        <v-card-title>{{ profileStore.connectionForm.serviceName }}: привязка аккаунта</v-card-title>
        <v-card-text class="d-flex flex-column ga-3 pt-3">
          <v-text-field
            :model-value="profileStore.connectionForm.username"
            label="Логин"
            @update:model-value="profileStore.setConnectionField('username', String($event ?? ''))"
          />
          <v-text-field
            :model-value="profileStore.connectionForm.token"
            label="Токен / пароль"
            type="password"
            @update:model-value="profileStore.setConnectionField('token', String($event ?? ''))"
          />
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="profileStore.closeConnectionDialog">Отмена</v-btn>
          <v-btn color="primary" variant="flat" @click="profileStore.saveConnection">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      :model-value="profileStore.showDeleteDialog"
      max-width="480"
      @update:model-value="(v) => !v && profileStore.closeDeleteDialog()"
    >
      <v-card rounded="lg">
        <v-card-title>Удалить учётную запись?</v-card-title>
        <v-card-text class="pt-3">
          <v-text-field
            :model-value="profileStore.deleteForm.password"
            label="Текущий пароль"
            type="password"
            autocomplete="current-password"
            @update:model-value="profileStore.setDeletePassword(String($event ?? ''))"
          />
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="profileStore.closeDeleteDialog">Отмена</v-btn>
          <v-btn color="error" variant="flat" @click="onConfirmDelete">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { DataTableHeader } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useSessionStore } from '@/stores/session'

const profileStore = useProfileStore()
const sessionStore = useSessionStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const activeTab = ref<'profile' | 'security' | 'connections'>('profile')

const tabs = [
  { title: 'Основные', value: 'profile', icon: 'mdi-account-circle-outline' },
  { title: 'Безопасность', value: 'security', icon: 'mdi-shield-outline' },
  { title: 'Подключения', value: 'connections', icon: 'mdi-link-variant' },
] as const

function normalizeTab(value: unknown): 'profile' | 'security' | 'connections' {
  return value === 'connections' || value === 'security' || value === 'profile' ? value : 'profile'
}

const connectionHeaders: DataTableHeader[] = [
  { title: 'Сервис', key: 'serviceName' },
  { title: 'Статус', key: 'connected' },
  { title: 'Аккаунт', key: 'username' },
  { title: 'Обновлено', key: 'updatedAt' },
  { title: 'Действия', key: 'actions', sortable: false },
]

onMounted(() => {
  activeTab.value = normalizeTab(route.query.tab)
  profileStore.fetchSettings()
})

watch(
  () => route.query.tab,
  (value) => {
    activeTab.value = normalizeTab(value)
  },
)

async function onSaveProfile() {
  await profileStore.saveProfile()
  if (!profileStore.error) {
    await sessionStore.fetchMe()
  }
}

async function onConfirmDelete() {
  await profileStore.deleteAccount()
  if (!profileStore.error) {
    authStore.logout()
    router.push({ name: 'login' })
  }
}
</script>

<style scoped>
.profile-view {
  padding: 24px;
}

.settings-shell {
  border: 1px solid #e5e7eb;
}

.settings-nav-col {
  border-right: 1px solid #e5e7eb;
  background: #fcfcfd;
}

.settings-nav {
  padding: 24px;
  min-height: 100%;
}

.settings-content {
  padding: 28px;
}

.tab-section {
  min-height: 420px;
}

@media (max-width: 959px) {
  .settings-nav-col {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .settings-content {
    padding: 20px;
  }
}
</style>
