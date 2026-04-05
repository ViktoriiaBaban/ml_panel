<template>
  <v-row dense>
    <v-col cols="12" md="6">
      <v-card rounded="lg" class="pa-4 h-100">
        <div class="text-h6 mb-4">Объектные хранилища</div>

        <section class="object-block mb-4" @click="$emit('open-tab', 'buckets')">
          <div
            class="object-block__header d-flex align-center justify-space-between text-primary font-weight-bold"
          >
            <span>Бакеты</span>
            <ChevronRight :size="18" />
          </div>

          <v-table density="comfortable" class="object-table">
            <tbody>
              <tr v-for="bucket in bucketsPreview" :key="String(bucket.id)">
                <td>{{ bucket.name }}</td>
                <td class="col-size">{{ bucket.size }}</td>
                <td class="col-date">{{ bucket.createdAt }}</td>
                <td class="col-project">{{ bucket.project }}</td>
                <td class="text-right">•••</td>
              </tr>
            </tbody>
          </v-table>
        </section>

        <section class="object-block" @click="$emit('open-tab', 'files')">
          <div
            class="object-block__header d-flex align-center justify-space-between text-primary font-weight-bold"
          >
            <span>Файлы</span>
            <ChevronRight :size="18" />
          </div>

          <v-table density="comfortable" class="object-table">
            <tbody>
              <tr v-for="file in filesPreview" :key="String(file.id)">
                <td>{{ file.name }}</td>
                <td class="col-size">{{ file.size }}</td>
                <td class="col-date">{{ file.uploadedAt ?? file.date }}</td>
                <td class="col-project">{{ file.project }}</td>
                <td class="text-right">•••</td>
              </tr>
            </tbody>
          </v-table>
        </section>
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
.object-block {
  border: 1px solid #1f6ed4;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
}

.object-block__header {
  padding: 10px 14px;
  background: #e9f1fc;
}

.object-table :deep(td) {
  border-bottom: 1px solid #e3e6eb;
  height: 46px;
}

.object-table :deep(tr:last-child td) {
  border-bottom: none;
}

.col-size {
  width: 95px;
  white-space: nowrap;
}

.col-date {
  width: 150px;
  white-space: nowrap;
}

.col-project {
  min-width: 140px;
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
