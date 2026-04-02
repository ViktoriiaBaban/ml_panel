<template>
  <v-card flat rounded="lg" class="admin-card">
    <div class="card-actions">
      <v-btn color="primary" prepend-icon="mdi-plus" @click="$emit('add-user')">Добавить пользователя</v-btn>
    </div>

    <v-data-table-server
      :headers="headers"
      :items="users"
      :items-length="users.length"
      item-value="id"
      :loading="loading"
      class="admin-table"
      density="comfortable"
    >
      <template #item.role="{ item }">
        <div class="icon-text">
          <v-icon :icon="item.role === 'admin' ? 'mdi-crown-outline' : 'mdi-account-outline'" size="18" />
          <span>{{ item.role === 'admin' ? 'Администратор' : 'Обычный пользователь' }}</span>
        </div>
      </template>

      <template #item.status="{ item }">
        <div class="icon-text">
          <v-icon :icon="item.status === 'active' ? 'mdi-check-circle' : 'mdi-lock-outline'" size="18" :color="item.status === 'active' ? 'success' : 'grey-darken-1'" />
          <span>{{ item.status === 'active' ? 'Активен' : 'Заблокирован' }}</span>
        </div>
      </template>

      <template #item.actions="{ item }">
        <div class="actions-group">
          <v-btn
            icon
            variant="text"
            size="small"
            :title="item.status === 'active' ? 'Заблокировать' : 'Разблокировать'"
            @click="$emit('toggle-user-status', item.id)"
          >
            <v-icon :icon="item.status === 'active' ? 'mdi-lock-outline' : 'mdi-lock-open-variant-outline'" />
          </v-btn>
          <v-btn icon variant="text" size="small" title="Редактировать">
            <v-icon icon="mdi-pencil-outline" color="primary" />
          </v-btn>
          <v-btn icon variant="text" size="small" title="Удалить" @click="$emit('delete-user', item.id)">
            <v-icon icon="mdi-delete-outline" color="error" />
          </v-btn>
        </div>
      </template>

      <template #bottom>
        <div class="table-summary">Всего пользователей: {{ users.length }}</div>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import type { AdminUser } from '@/types/administration'

defineProps<{
  headers: DataTableHeader[]
  users: AdminUser[]
  loading: boolean
}>()

defineEmits<{
  'add-user': []
  'toggle-user-status': [id: number]
  'delete-user': [id: number]
}>()
</script>

<style scoped>
.admin-card {
  border: 1px solid #e5e7eb;
}

.card-actions {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.admin-table {
  background: #fff;
}

.icon-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions-group {
  display: flex;
  align-items: center;
}

.table-summary {
  padding: 16px;
  color: #6b7280;
  font-size: 14px;
  border-top: 1px solid #e5e7eb;
}
</style>
