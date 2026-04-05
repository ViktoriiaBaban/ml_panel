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
        class="mb-3"
        @update:model-value="updateField('bucket', String($event ?? ''))"
      />

      <div class="drop-zone mb-8" @dragover.prevent @drop.prevent="onDrop">
        <input ref="fileInput" type="file" class="d-none" @change="onFileSelect" />

        <v-icon size="28" class="mb-2">mdi-tray-arrow-up</v-icon>
        <div class="text-subtitle-1 font-weight-medium mb-1">Перетащите файл сюда</div>
        <div class="text-body-2 text-medium-emphasis mb-3">или выберите файл с компьютера</div>

        <v-btn size="small" color="primary" variant="outlined" @click="openFilePicker">
          Выбрать файл
        </v-btn>

        <div v-if="form.file" class="text-body-2 mt-3">Выбран файл: {{ form.file.name }}</div>
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
        <v-btn min-width="180" color="primary" @click="emit('save')">Загрузить</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

const fileInput = ref<HTMLInputElement | null>(null)

function updateField<Key extends keyof UploadForm>(key: Key, value: UploadForm[Key]) {
  emit('update:form', { ...props.form, [key]: value })
}

function setFile(file: File | null) {
  updateField('file', file)
  if (file && !props.form.name) {
    updateField('name', file.name)
  }
}

function openFilePicker() {
  fileInput.value?.click()
}

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  setFile(input.files?.[0] ?? null)
}

function onDrop(event: DragEvent) {
  setFile(event.dataTransfer?.files?.[0] ?? null)
}
</script>

<style scoped>
.drop-zone {
  border: 1px dashed #b8c0cc;
  border-radius: 12px;
  padding: 28px 20px;
  text-align: center;
  background: #f7f9fc;
}
</style>
