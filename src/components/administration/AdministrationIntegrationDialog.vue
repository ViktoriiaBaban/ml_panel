<template>
  <v-dialog :model-value="modelValue" max-width="980" @update:model-value="emit('update:modelValue', $event)">
    <v-card rounded="xl" class="integration-dialog-card">
      <div class="dialog-header">
        <div>
          <h2 class="dialog-title">Настройка: {{ form.name }}</h2>
          <p class="dialog-subtitle">Укажите параметры подключения к внешнему сервису</p>
        </div>

        <v-btn icon="mdi-close" variant="text" size="small" color="secondary" @click="emit('update:modelValue', false)" />
      </div>

      <v-divider />

      <v-card-text class="dialog-content">
        <div class="field-block">
          <label class="field-label">URL сервиса <span class="required">*</span></label>
          <v-text-field
            :model-value="form.baseUrl"
            placeholder="https://gitlab.internal"
            variant="outlined"
            hide-details
            density="comfortable"
            @update:model-value="setField('baseUrl', String($event ?? ''))"
          />
          <p class="field-help">Основной URL для доступа к API сервиса</p>
        </div>

        <div class="field-block">
          <label class="field-label">Health-check URL (опционально)</label>
          <v-text-field
            :model-value="form.healthCheckUrl"
            placeholder="https://gitlab.internal/api/v4/version"
            variant="outlined"
            hide-details
            density="comfortable"
            @update:model-value="setField('healthCheckUrl', String($event ?? ''))"
          />
          <p class="field-help">Endpoint для проверки доступности сервиса</p>
        </div>

        <div class="field-block">
          <label class="field-label">API ключ / Токен (опционально)</label>
          <v-text-field
            :model-value="form.apiToken"
            placeholder="••••••••••••••"
            type="password"
            variant="outlined"
            hide-details
            density="comfortable"
            @update:model-value="setField('apiToken', String($event ?? ''))"
          />
          <p class="field-help">Токен для авторизации запросов к API</p>
        </div>

        <div class="field-block">
          <label class="field-label">Описание (опционально)</label>
          <v-textarea
            :model-value="form.description"
            placeholder="Дополнительная информация о подключении..."
            variant="outlined"
            hide-details
            rows="3"
            auto-grow
            @update:model-value="setField('description', String($event ?? ''))"
          />
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="dialog-actions">
        <v-spacer />
        <v-btn variant="outlined" color="secondary" class="text-none" min-width="130" @click="emit('update:modelValue', false)">
          Отмена
        </v-btn>
        <v-btn color="primary" variant="flat" class="text-none" min-width="250" :disabled="!canSave" @click="emit('submit')">
          Сохранить изменения
        </v-btn>
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

function setField(field: keyof IntegrationFormState, value: string) {
  emit('setField', field, value)
}
</script>

<style scoped>
.integration-dialog-card {
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 28px 28px 16px;
}

.dialog-title {
  margin: 0;
  font-size: 2rem;
  line-height: 1.2;
  font-weight: 700;
}

.dialog-subtitle {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 1.05rem;
}

.dialog-content {
  max-height: 520px;
  overflow-y: auto;
  padding: 22px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-label {
  font-size: 1.08rem;
  font-weight: 700;
  color: #334155;
}

.required {
  color: #ef4444;
}

.field-help {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.dialog-actions {
  padding: 18px 28px 26px;
  gap: 12px;
}
</style>
