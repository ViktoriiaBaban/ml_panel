<template>
  <v-dialog :model-value="modelValue" max-width="520" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Добавить пользователя</span>
        <v-btn icon variant="text" size="small" @click="$emit('update:modelValue', false)">
          <v-icon icon="mdi-close" />
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-text-field
          label="Логин (Email)"
          type="email"
          :model-value="form.email"
          required
          variant="outlined"
          density="comfortable"
          @update:model-value="$emit('set-field', 'email', String($event ?? ''))"
        />
        <v-text-field
          label="Имя (опционально)"
          type="text"
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
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="outlined" @click="$emit('update:modelValue', false)">Отмена</v-btn>
        <v-btn color="primary" :disabled="!form.email" @click="$emit('submit')">Добавить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { SelectOption, UserFormState, UserRole } from '@/types/administration'

defineProps<{
  modelValue: boolean
  form: UserFormState
  roleOptions: SelectOption<UserRole>[]
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  setField: [field: keyof UserFormState, value: string | UserRole]
  submit: []
}>()
</script>
