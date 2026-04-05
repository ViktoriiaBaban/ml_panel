<template>
  <v-row dense>
    <v-col cols="12" md="6">
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

    <v-col cols="12" md="6">
      <v-card rounded="lg" class="pa-4 h-100 table-card" @click="$emit('open-tab', 'tables')">
        <v-card-title class="d-flex align-center justify-space-between font-weight-bold">
          Табличные данные
          <ChevronRight :size="18" />
        </v-card-title>

        <v-table density="comfortable" class="overview-table">
          <thead>
            <tr>
              <th>Название ↓</th>
              <th>Тип</th>
              <th>Размер, строки</th>
              <th>Дата создания</th>
              <th class="text-right"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="table in tablesPreview" :key="String(table.id)">
              <td>{{ table.name }}</td>
              <td>
                <v-chip
                  :color="table.type === 'Признаки' ? 'cyan' : 'orange'"
                  size="small"
                  variant="tonal"
                >
                  {{ table.type }}
                </v-chip>
              </td>
              <td>{{ table.rows }}</td>
              <td>{{ table.createdAt }}</td>
              <td class="text-right">•••</td>
            </tr>
          </tbody>
        </v-table>
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

.table-card {
  cursor: pointer;
}

.overview-table :deep(th) {
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid #9aa0a6;
}

.overview-table :deep(td) {
  border-bottom: 1px solid #e3e6eb;
  height: 46px;
}
</style>
