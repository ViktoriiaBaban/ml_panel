<template>
  <v-dialog :model-value="modelValue" max-width="560" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Редактирование пользователя</span>
        <v-btn icon variant="text" size="small" @click="$emit('update:modelValue', false)">
          <v-icon icon="mdi-close" />
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form class="dialog-form">
          <v-text-field
            label="Email"
            type="email"
            :model-value="form.email"
            variant="outlined"
            density="comfortable"
            @update:model-value="$emit('set-field', 'email', String($event ?? ''))"
          />
          <v-text-field
            label="Имя"
            :model-value="form.name"
            variant="outlined"
            density="comfortable"
            @update:model-value="$emit('set-field', 'name', String($event ?? ''))"
          />
          <v-select
            label="Роль"
            :model-value="form.role"
            :items="roleOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            @update:model-value="$emit('set-field', 'role', $event as UserRole)"
          />

          <v-divider class="my-2" />
          <div class="text-body-2 mb-2">Сброс пароля</div>
          <v-text-field
            label="Новый пароль"
            :model-value="form.newPassword"
            :type="form.showPassword ? 'text' : 'password'"
            hint="Минимум 8 символов"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            @update:model-value="$emit('set-field', 'newPassword', String($event ?? ''))"
          >
            <template #append-inner>
              <v-icon
                :icon="form.showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                size="small"
                @click="$emit('set-field', 'showPassword', !form.showPassword)"
              />
            </template>
          </v-text-field>
          <div class="d-flex justify-end">
            <v-btn
              color="warning"
              variant="tonal"
              prepend-icon="mdi-lock-reset"
              :disabled="form.newPassword.length < 8"
              @click="$emit('reset-password')"
            >
              Сбросить пароль
            </v-btn>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="outlined" @click="$emit('update:modelValue', false)">Отмена</v-btn>
        <v-btn color="primary" :disabled="!form.email" @click="$emit('save')">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { EditUserFormState, SelectOption, UserRole } from '@/types/administration'

defineProps<{
  modelValue: boolean
  form: EditUserFormState
  roleOptions: SelectOption<UserRole>[]
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  setField: [field: keyof EditUserFormState, value: string | UserRole | boolean | number | null]
  save: []
  'reset-password': []
}>()
</script>

<style scoped>
.dialog-form {
  display: grid;
  gap: 10px;
}
</style>
