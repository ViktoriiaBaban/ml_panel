<template>
  <v-container fluid class="profile-view">
    <v-alert v-if="profileStore.error" type="error" variant="tonal" class="mb-4">{{ profileStore.error }}</v-alert>

    <v-row>
      <v-col cols="12" md="6">
        <v-card rounded="lg" class="card">
          <v-card-title>Личные данные</v-card-title>
          <v-card-text class="d-flex flex-column ga-3">
            <v-text-field
              :model-value="profileStore.profile.name"
              label="Имя"
              @update:model-value="profileStore.setProfileField('name', String($event ?? ''))"
            />
            <v-text-field
              :model-value="profileStore.profile.email"
              label="Email"
              @update:model-value="profileStore.setProfileField('email', String($event ?? ''))"
            />
            <v-text-field :model-value="profileStore.profile.role" label="Роль" readonly variant="filled" density="comfortable" />
          </v-card-text>
          <v-card-actions class="px-6 pb-5">
            <v-spacer />
            <v-btn color="primary" variant="flat" @click="onSaveProfile">Сохранить</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="lg" class="card">
          <v-card-title>Учётная запись</v-card-title>
          <v-card-text class="d-flex flex-column ga-3">
            <v-text-field
              :model-value="profileStore.passwordForm.currentPassword"
              label="Текущий пароль"
              type="password"
              autocomplete="current-password"
              @update:model-value="profileStore.setPasswordField('currentPassword', String($event ?? ''))"
            />
            <v-text-field
              :model-value="profileStore.passwordForm.newPassword"
              label="Новый пароль"
              type="password"
              autocomplete="new-password"
              @update:model-value="profileStore.setPasswordField('newPassword', String($event ?? ''))"
            />
            <v-text-field
              :model-value="profileStore.passwordForm.confirmPassword"
              label="Подтверждение нового пароля"
              type="password"
              autocomplete="new-password"
              @update:model-value="profileStore.setPasswordField('confirmPassword', String($event ?? ''))"
            />
            <v-btn color="primary" variant="flat" class="align-self-start" @click="profileStore.changePassword">
              Изменить пароль
            </v-btn>

            <v-divider class="my-2" />

            <div class="text-subtitle-2">Удаление аккаунта</div>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Действие необратимо. Для подтверждения потребуется текущий пароль.
            </p>
            <v-btn color="error" variant="outlined" class="align-self-start" @click="profileStore.openDeleteDialog">
              Удалить учётную запись
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="lg" class="card mt-4">
      <v-card-title>Личные подключения к сервисам</v-card-title>
      <v-card-text class="pt-0 text-medium-emphasis">
        Каждый пользователь привязывает свои аккаунты самостоятельно (не путать с системными интеграциями в админке).
      </v-card-text>
      <v-data-table
        :items="profileStore.connections"
        :headers="connectionHeaders"
        item-value="serviceId"
        :loading="profileStore.loading"
      >
        <template #item.connected="{ item }">
          <div class="d-flex align-center ga-2">
            <v-icon :icon="item.connected ? 'mdi-check-circle' : 'mdi-link-off'" :color="item.connected ? 'success' : 'grey'" size="18" />
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
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { DataTableHeader } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useSessionStore } from '@/stores/session'

const profileStore = useProfileStore()
const sessionStore = useSessionStore()
const authStore = useAuthStore()
const router = useRouter()

const connectionHeaders: DataTableHeader[] = [
  { title: 'Сервис', key: 'serviceName' },
  { title: 'Статус', key: 'connected' },
  { title: 'Аккаунт', key: 'username' },
  { title: 'Обновлено', key: 'updatedAt' },
  { title: 'Действия', key: 'actions', sortable: false },
]

onMounted(() => {
  profileStore.fetchSettings()
})

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

.card {
  border: 1px solid #e5e7eb;
}
</style>
