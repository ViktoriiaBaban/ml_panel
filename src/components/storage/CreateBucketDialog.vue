<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="lg" class="pa-4 pa-md-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <div class="text-h4 font-weight-bold">Создание бакета</div>
        <v-btn icon variant="text" @click="emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-text-field
        :model-value="form.name"
        label="Название бакета"
        placeholder="Placeholder"
        variant="solo-filled"
        flat
        class="mb-3"
        @update:model-value="updateField('name', String($event ?? ''))"
      />

      <v-select
        :model-value="form.project"
        :items="projects"
        label="Проект"
        variant="solo-filled"
        flat
        class="mb-3"
        @update:model-value="updateField('project', String($event ?? ''))"
      />

      <div class="d-flex align-center justify-space-between mb-4 text-h6">
        <span>Версионирование</span>
        <v-switch
          :model-value="form.versioning"
          inset
          hide-details
          color="primary"
          @update:model-value="updateField('versioning', Boolean($event))"
        />
      </div>

      <div class="d-flex align-center justify-space-between mb-8 text-h6">
        <span>Наличие лимита</span>
        <v-switch
          :model-value="form.hasLimit"
          inset
          hide-details
          color="primary"
          @update:model-value="updateField('hasLimit', Boolean($event))"
        />
      </div>

      <div class="d-flex justify-center ga-4">
        <v-btn
          min-width="180"
          variant="outlined"
          color="primary"
          @click="emit('update:modelValue', false)"
        >
          Отменить
        </v-btn>
        <v-btn min-width="180" color="primary" @click="emit('save')">Сохранить</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { BucketForm } from '@/views/storage/types'

const props = defineProps<{
  modelValue: boolean
  form: BucketForm
  projects: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:form', value: BucketForm): void
  (e: 'save'): void
}>()

function updateField<Key extends keyof BucketForm>(key: Key, value: BucketForm[Key]) {
  emit('update:form', { ...props.form, [key]: value })
}
</script>
