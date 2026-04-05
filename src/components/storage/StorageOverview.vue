<template>
  <v-row dense>
    <v-col cols="12" md="6">
      <v-card rounded="lg" class="pa-4 h-100">
        <div class="text-h6 mb-4">Объектные хранилища</div>

        <section class="object-block mb-4">
          <div
            class="object-block__header d-flex align-center justify-space-between text-primary font-weight-bold"
            @click="$emit('open-tab', 'buckets')"
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
                <td class="text-right">
                  <v-menu location="bottom end">
                    <template #activator="{ props }">
                      <v-btn icon size="x-small" variant="text" v-bind="props" @click.stop
                        >•••</v-btn
                      >
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        title="Посмотреть"
                        prepend-icon="mdi-eye-outline"
                        @click="$emit('preview-view', 'buckets', Number(bucket.id))"
                      />
                      <v-list-item
                        title="Удалить"
                        prepend-icon="mdi-delete-outline"
                        base-color="error"
                        @click="$emit('preview-delete', 'buckets', Number(bucket.id))"
                      />
                    </v-list>
                  </v-menu>
                </td>
              </tr>
            </tbody>
          </v-table>
        </section>

        <section class="object-block">
          <div
            class="object-block__header d-flex align-center justify-space-between text-primary font-weight-bold"
            @click="$emit('open-tab', 'files')"
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
                <td class="text-right">
                  <v-menu location="bottom end">
                    <template #activator="{ props }">
                      <v-btn icon size="x-small" variant="text" v-bind="props" @click.stop
                        >•••</v-btn
                      >
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        title="Посмотреть"
                        prepend-icon="mdi-eye-outline"
                        @click="$emit('preview-view', 'files', Number(file.id))"
                      />
                      <v-list-item
                        title="Удалить"
                        prepend-icon="mdi-delete-outline"
                        base-color="error"
                        @click="$emit('preview-delete', 'files', Number(file.id))"
                      />
                    </v-list>
                  </v-menu>
                </td>
              </tr>
            </tbody>
          </v-table>
        </section>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card rounded="lg" class="pa-4 h-100 table-card">
        <v-card-title
          class="d-flex align-center justify-space-between font-weight-bold table-card__header"
          @click="$emit('open-tab', 'tables')"
        >
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
              <td class="text-right">
                <v-menu location="bottom end">
                  <template #activator="{ props }">
                    <v-btn icon size="x-small" variant="text" v-bind="props" @click.stop>•••</v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item
                      title="Посмотреть"
                      prepend-icon="mdi-eye-outline"
                      @click="$emit('preview-view', 'tables', Number(table.id))"
                    />
                    <v-list-item
                      title="Удалить"
                      prepend-icon="mdi-delete-outline"
                      base-color="error"
                      @click="$emit('preview-delete', 'tables', Number(table.id))"
                    />
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { StoragePreviewBlock, StorageRow, StorageTab } from '@/views/storage/types'

defineProps<{
  bucketsPreview: StorageRow[]
  filesPreview: StorageRow[]
  tablesPreview: StorageRow[]
}>()

defineEmits<{
  (e: 'open-tab', tab: StorageTab): void
  (e: 'preview-view', block: StoragePreviewBlock, id: number): void
  (e: 'preview-delete', block: StoragePreviewBlock, id: number): void
}>()
</script>

<style scoped>
.object-block {
  border: 1px solid #1f6ed4;
  border-radius: 10px;
  overflow: hidden;
  cursor: default;
}

.object-block__header {
  padding: 10px 14px;
  background: #e9f1fc;
  cursor: pointer;
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
  cursor: default;
}

.table-card__header {
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
