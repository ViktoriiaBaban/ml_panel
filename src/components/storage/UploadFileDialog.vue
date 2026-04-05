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

      <div v-if="!form.file" class="drop-zone mb-8" @dragover.prevent @drop.prevent="onDrop">
        <input ref="fileInput" type="file" class="d-none" @change="onFileSelect" />

        <v-icon size="28" class="mb-2">mdi-tray-arrow-up</v-icon>
        <div class="text-subtitle-1 font-weight-medium mb-1">Перетащите файл сюда</div>
        <div class="text-body-2 text-medium-emphasis mb-3">или выберите файл с компьютера</div>

        <v-btn size="small" color="primary" variant="outlined" @click="openFilePicker">
          Выбрать файл
        </v-btn>
      </div>

      <div v-else class="file-state mb-8">
        <div class="d-flex align-center justify-space-between ga-2 mb-3">
          <div class="text-body-1 font-weight-medium text-truncate">{{ form.file.name }}</div>
          <v-btn
            icon
            size="small"
            variant="text"
            color="medium-emphasis"
            aria-label="Очистить выбранный файл"
            @click="clearFile"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div v-if="isUploading" class="d-flex align-center ga-2 text-medium-emphasis mb-2">
          <v-progress-circular indeterminate size="18" width="2" color="primary" />
          <span class="text-body-2">Идёт загрузка файла...</span>
        </div>

        <v-progress-linear
          :model-value="isUploading ? 0 : 100"
          :indeterminate="isUploading"
          color="primary"
          height="8"
          rounded
        />

        <div v-if="!isUploading" class="text-body-2 text-success mt-2">Файл готов к загрузке</div>
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
import { onBeforeUnmount, ref } from 'vue'
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
const isUploading = ref(false)
let uploadTimer: ReturnType<typeof setTimeout> | null = null

function updateField<Key extends keyof UploadForm>(key: Key, value: UploadForm[Key]) {
  emit('update:form', { ...props.form, [key]: value })
}

function setFile(file: File | null) {
  if (uploadTimer) {
    clearTimeout(uploadTimer)
    uploadTimer = null
  }

  updateField('file', file)
  if (file && !props.form.name) {
    updateField('name', file.name)
  }

  if (!file) {
    isUploading.value = false
    return
  }

  isUploading.value = true
  uploadTimer = setTimeout(() => {
    isUploading.value = false
    uploadTimer = null
  }, 1400)
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

function clearFile() {
  setFile(null)
  if (fileInput.value) fileInput.value.value = ''
}

onBeforeUnmount(() => {
  if (uploadTimer) clearTimeout(uploadTimer)
})
</script>

<style scoped>
.drop-zone {
  border: 1px dashed #b8c0cc;
  border-radius: 12px;
  padding: 28px 20px;
  text-align: center;
  background: #f7f9fc;
}

.file-state {
  border: 1px solid #dce2ea;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
}
</style>
