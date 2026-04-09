<template>
  <v-dialog :model-value="modelValue" max-width="640" @update:model-value="emit('update:modelValue', $event)">
    <v-card rounded="lg">
      <v-card-title class="text-h6">{{ title }}</v-card-title>
      <v-card-text class="d-flex flex-column ga-4 pt-3">
        <v-text-field
          :model-value="form.baseUrl"
          label="Базовый URL сервиса"
          placeholder="https://service.internal"
          required
          @update:model-value="setField('baseUrl', String($event ?? ''))"
        />
        <v-text-field
          :model-value="form.healthCheckPath"
          label="Путь health-check (опционально)"
          placeholder="/health"
          @update:model-value="setField('healthCheckPath', String($event ?? ''))"
        />
        <v-text-field
          :model-value="form.version"
          label="Версия API (опционально)"
          placeholder="v1"
          @update:model-value="setField('version', String($event ?? ''))"
        />
      </v-card-text>
      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn variant="text" @click="emit('update:modelValue', false)">Отмена</v-btn>
        <v-btn color="primary" variant="flat" :disabled="!canSave" @click="emit('submit')">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IntegrationFormState } from '@/types/administration'

const props = defineProps<{
  modelValue: boolean
  form: IntegrationFormState
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  setField: [field: keyof IntegrationFormState, value: string]
  submit: []
}>()

const canSave = computed(() => props.form.baseUrl.trim().length > 0)
const title = computed(() => `${props.form.name}: подключение`)

function setField(field: keyof IntegrationFormState, value: string) {
  emit('setField', field, value)
}
</script>
