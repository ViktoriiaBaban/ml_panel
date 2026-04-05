<template>
  <v-row dense>
    <v-col cols="12" md="8">
      <v-card rounded="lg" class="pa-4 h-100">
        <div class="text-h6 mb-4">Объектные хранилища</div>
        <v-row dense>
          <v-col cols="12">
            <v-card class="section-block" variant="outlined" @click="$emit('open-tab', 'buckets')">
              <v-card-title
                class="d-flex align-center justify-space-between text-primary font-weight-bold"
              >
                Бакеты
                <ChevronRight :size="18" />
              </v-card-title>
              <v-divider />
              <v-list lines="one" density="comfortable">
                <v-list-item
                  v-for="bucket in bucketsPreview"
                  :key="String(bucket.id)"
                  :title="String(bucket.name)"
                  :subtitle="`${bucket.size} · ${bucket.project}`"
                />
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-card class="section-block" variant="outlined" @click="$emit('open-tab', 'files')">
              <v-card-title
                class="d-flex align-center justify-space-between text-primary font-weight-bold"
              >
                Файлы
                <ChevronRight :size="18" />
              </v-card-title>
              <v-divider />
              <v-list lines="one" density="comfortable">
                <v-list-item
                  v-for="file in filesPreview"
                  :key="String(file.id)"
                  :title="String(file.name)"
                  :subtitle="`${file.size} · ${file.project}`"
                />
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card
        rounded="lg"
        class="pa-4 h-100 section-block"
        variant="outlined"
        @click="$emit('open-tab', 'tables')"
      >
        <v-card-title class="d-flex align-center justify-space-between font-weight-bold">
          Табличные данные
          <ChevronRight :size="18" />
        </v-card-title>
        <v-divider class="mb-2" />
        <v-list lines="one" density="comfortable">
          <v-list-item
            v-for="table in tablesPreview"
            :key="String(table.id)"
            :title="String(table.name)"
          >
            <template #append>
              <v-chip
                :color="table.type === 'Признаки' ? 'cyan' : 'orange'"
                size="small"
                variant="tonal"
              >
                {{ table.type }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { StorageRow, StorageTab } from '@/views/storage/types'

defineProps<{
  bucketsPreview: StorageRow[]
  filesPreview: StorageRow[]
  tablesPreview: StorageRow[]
}>()

defineEmits<{
  (e: 'open-tab', tab: StorageTab): void
}>()
</script>

<style scoped>
.section-block {
  border-color: #1f6ed4;
  cursor: pointer;
}
</style>
