<template>
  <v-dialog
    :model-value="modelValue"
    max-width="640"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="lg" class="pa-4 pa-md-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <div class="text-h4 font-weight-bold">Загрузка файла</div>
        <v-btn icon variant="text" @click="emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-text-field
        :model-value="form.name"
        label="Название файла"
        variant="solo-filled"
        flat
        class="mb-3"
        @update:model-value="updateField('name', String($event ?? ''))"
      />
      <v-select
        :model-value="form.type"
        :items="fileTypes"
        label="Тип"
        variant="solo-filled"
        flat
        class="mb-3"
        @update:model-value="updateField('type', String($event ?? ''))"
      />
      <v-select
        :model-value="form.bucket"
        :items="bucketNames"
        label="Бакет"
        variant="solo-filled"
        flat
        class="mb-8"
        @update:model-value="updateField('bucket', String($event ?? ''))"
      />

      <div class="d-flex justify-center ga-4">
        <v-btn
          min-width="180"
          variant="outlined"
          color="primary"
          @click="emit('update:modelValue', false)"
        >
          Отменить
        </v-btn>
        <v-btn min-width="180" color="primary" @click="emit('save')">Загрузить</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { UploadForm } from '@/views/storage/types'

const props = defineProps<{
  modelValue: boolean
  form: UploadForm
  fileTypes: string[]
  bucketNames: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:form', value: UploadForm): void
  (e: 'save'): void
}>()

function updateField<Key extends keyof UploadForm>(key: Key, value: UploadForm[Key]) {
  emit('update:form', { ...props.form, [key]: value })
}
</script>
