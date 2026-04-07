<template>
  <v-container fluid class="experiment-detail-view">
    <div v-if="error" class="mb-4">
      <v-alert type="error" variant="tonal">{{ error }}</v-alert>
    </div>

    <div v-if="detail" class="detail-layout">
      <aside class="info-card">
        <h3 class="info-title">Основная информация</h3>

        <div class="info-block">
          <div class="info-label">ID</div>
          <div class="info-value">{{ detail.externalId }}</div>
        </div>

        <div class="info-block">
          <div class="info-label">Дата создания</div>
          <div class="info-value">{{ detail.createdAt }}</div>
        </div>

        <div class="info-block">
          <div class="info-label">Дата последнего изменения</div>
          <div class="info-value">{{ detail.updatedAt }}</div>
        </div>

        <div class="info-block">
          <div class="info-label">Описание</div>
          <v-textarea
            v-model="detail.description"
            variant="outlined"
            density="comfortable"
            rows="4"
            hide-details
          />
        </div>

        <div class="info-block">
          <div class="info-label">Теги</div>
          <div class="tags-row">
            <v-chip
              v-for="tag in detail.tags"
              :key="tag"
              size="small"
              color="cyan-lighten-4"
              class="tag-chip"
            >
              {{ tag }}
            </v-chip>

            <v-menu location="bottom start" :close-on-content-click="false">
              <template #activator="{ props }">
                <v-btn icon size="x-small" variant="tonal" v-bind="props">
                  <v-icon icon="mdi-plus" />
                </v-btn>
              </template>

              <v-card min-width="320" class="pa-3">
                <div class="text-subtitle-2 mb-2">Добавить существующий тег</div>
                <v-select
                  v-model="selectedExistingTag"
                  :items="existingTagOptions"
                  density="compact"
                  variant="outlined"
                  hide-details
                  placeholder="Выберите тег"
                  class="mb-3"
                />
                <v-btn
                  block
                  variant="tonal"
                  color="primary"
                  class="mb-4"
                  :disabled="!selectedExistingTag"
                  @click="handleAddExistingTag"
                >
                  Добавить тег
                </v-btn>

                <div class="text-subtitle-2 mb-2">Создать новый тег</div>
                <v-text-field
                  v-model="newTag"
                  density="compact"
                  variant="outlined"
                  hide-details
                  placeholder="Новый тег"
                  class="mb-3"
                />
                <v-btn
                  block
                  color="primary"
                  :disabled="!newTag.trim()"
                  @click="handleCreateTag"
                >
                  Создать и добавить
                </v-btn>
              </v-card>
            </v-menu>
          </div>
        </div>
      </aside>

      <section class="content-card">
        <v-tabs v-model="activeTab" color="primary" align-tabs="start" class="detail-tabs">
          <v-tab value="runs" class="text-none">Запуски</v-tab>
          <v-tab value="models" class="text-none">Модели</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="runs">
            <v-table class="inner-table">
              <thead>
                <tr>
                  <th class="check-col"><v-checkbox-btn /></th>
                  <th>Название</th>
                  <th>Время старта</th>
                  <th>Датасет</th>
                  <th>Продолжительность</th>
                  <th>Модель</th>
                  <th>Статус</th>
                  <th class="actions-col"><v-icon icon="mdi-filter-variant" size="16" /></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="run in detail.runs" :key="run.id">
                  <td class="check-col"><v-checkbox-btn /></td>
                  <td>{{ run.name }}</td>
                  <td>{{ run.startTime }}</td>
                  <td>{{ run.dataset }}</td>
                  <td>{{ run.duration }}</td>
                  <td>{{ run.model }}</td>
                  <td>
                    <v-chip size="small" :color="run.status === 'completed' ? 'green' : 'blue'">
                      {{ run.status === 'completed' ? 'Завершен' : 'В процессе' }}
                    </v-chip>
                  </td>
                  <td class="actions-col">
                    <v-menu location="bottom end">
                      <template #activator="{ props }">
                        <v-btn icon variant="text" size="small" v-bind="props">
                          <v-icon icon="mdi-dots-horizontal" />
                        </v-btn>
                      </template>
                      <v-list density="compact">
                        <v-list-item title="Открыть" prepend-icon="mdi-open-in-new" />
                        <v-list-item title="Логи" prepend-icon="mdi-text-box-search-outline" />
                      </v-list>
                    </v-menu>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-window-item>

          <v-window-item value="models">
            <v-table class="inner-table">
              <thead>
                <tr>
                  <th class="check-col"><v-checkbox-btn /></th>
                  <th>Название</th>
                  <th>Дата изменения</th>
                  <th>Последняя версия</th>
                  <th class="actions-col" />
                </tr>
              </thead>
              <tbody>
                <tr v-for="model in detail.models" :key="model.id">
                  <td class="check-col"><v-checkbox-btn /></td>
                  <td>{{ model.name }}</td>
                  <td>{{ model.updatedAt }}</td>
                  <td>{{ model.version }}</td>
                  <td class="actions-col">
                    <v-menu location="bottom end">
                      <template #activator="{ props }">
                        <v-btn icon variant="text" size="small" v-bind="props">
                          <v-icon icon="mdi-dots-horizontal" />
                        </v-btn>
                      </template>
                      <v-list density="compact">
                        <v-list-item title="Открыть" prepend-icon="mdi-open-in-new" />
                        <v-list-item title="Скачать" prepend-icon="mdi-download" />
                      </v-list>
                    </v-menu>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-window-item>
        </v-window>

        <div class="table-pagination">
          <v-btn icon variant="text"><v-icon icon="mdi-page-first" /></v-btn>
          <v-btn icon variant="text"><v-icon icon="mdi-chevron-left" /></v-btn>
          <span class="page-pill">1</span>
          <v-btn icon variant="text"><v-icon icon="mdi-chevron-right" /></v-btn>
          <v-btn icon variant="text"><v-icon icon="mdi-page-last" /></v-btn>
        </div>
      </section>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, ApiError } from '@/lib/api'
import type { ExperimentDetailResponse } from '@/types/experiments'

const props = defineProps<{ experimentId: number }>()

const route = useRoute()
const router = useRouter()
const detail = ref<ExperimentDetailResponse | null>(null)
const activeTab = ref<'runs' | 'models'>('runs')
const error = ref<string | null>(null)
const selectedExistingTag = ref('')
const newTag = ref('')

const existingTagOptions = computed(() =>
  (detail.value?.availableTags ?? []).filter((tag) => !detail.value?.tags.includes(tag))
)

async function fetchDetail() {
  error.value = null
  try {
    detail.value = await api.get<ExperimentDetailResponse>(`/experiments/${props.experimentId}`)
    if (detail.value && route.query.experimentName !== detail.value.name) {
      router.replace({ query: { ...route.query, experimentName: detail.value.name } })
    }
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Не удалось загрузить эксперимент'
  }
}

async function addTag(tag: string) {
  if (!tag.trim()) return
  try {
    detail.value = await api.post<ExperimentDetailResponse, { tag: string }>(
      `/experiments/${props.experimentId}/tags`,
      { tag: tag.trim() },
    )
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Не удалось обновить теги'
  }
}

async function handleAddExistingTag() {
  if (!selectedExistingTag.value) return
  await addTag(selectedExistingTag.value)
  selectedExistingTag.value = ''
}

async function handleCreateTag() {
  const value = newTag.value.trim()
  if (!value) return
  await addTag(value)
  newTag.value = ''
}

onMounted(fetchDetail)
watch(() => props.experimentId, fetchDetail)
</script>

<style scoped>
.experiment-detail-view {
  padding: 24px;
}

.detail-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 12px;
}

.info-card,
.content-card {
  background: #f8f9fc;
  border-radius: 10px;
  padding: 16px;
}

.info-title {
  margin-bottom: 10px;
  font-size: 28px;
}

.info-block {
  margin-bottom: 14px;
}

.info-label {
  color: #525a66;
  margin-bottom: 6px;
}

.info-value {
  color: #1f2937;
}

.tags-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-chip {
  color: #0891b2;
}

.inner-table {
  margin-top: 8px;
  border: 1px solid #d8dee8;
}

.inner-table :deep(th) {
  background: #e8ebf2;
}

.inner-table :deep(td),
.inner-table :deep(th) {
  border-bottom: 1px solid #e2e8f0;
}

.check-col {
  width: 42px;
}

.actions-col {
  width: 52px;
  text-align: right;
}

.table-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 12px;
}

.page-pill {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #eceff4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
