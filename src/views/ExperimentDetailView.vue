<template>
  <v-container fluid class="experiment-detail-view">
    <div v-if="error" class="mb-4">
      <v-alert type="error" variant="tonal">{{ error }}</v-alert>
    </div>

    <div v-if="detail" class="detail-layout">
      <aside class="info-card">
        <h3 class="info-title">Основная информация</h3>
        <div class="info-block"><div class="info-label">ID</div><div class="info-value">{{ detail.externalId }}</div></div>
        <div class="info-block"><div class="info-label">Дата создания</div><div class="info-value">{{ detail.createdAt }}</div></div>
        <div class="info-block"><div class="info-label">Дата последнего изменения</div><div class="info-value">{{ detail.updatedAt }}</div></div>

        <div class="info-block">
          <div class="info-label">Описание</div>
          <v-textarea v-model="detail.description" variant="outlined" density="comfortable" rows="4" hide-details />
        </div>

        <div class="info-block">
          <div class="info-label">Теги</div>
          <div class="tags-row">
            <v-chip v-for="tag in detail.tags" :key="tag" size="small" class="tag-chip" variant="flat">{{ tag }}</v-chip>

            <v-menu location="bottom start" :close-on-content-click="false">
              <template #activator="{ props }">
                <v-btn icon size="x-small" variant="tonal" v-bind="props"><v-icon icon="mdi-plus" /></v-btn>
              </template>

              <v-card min-width="360" class="pa-3">
                <v-text-field
                  v-model="tagSearch"
                  density="compact"
                  variant="outlined"
                  hide-details
                  placeholder="Поиск или создание тега"
                  class="mb-2"
                />

                <v-virtual-scroll :items="filteredTagOptions" :height="220" item-height="42">
                  <template #default="{ item }">
                    <v-checkbox
                      :model-value="detail.tags.includes(item)"
                      density="compact"
                      hide-details
                      @update:model-value="handleToggleTag(item, Boolean($event))"
                    >
                      <template #label>{{ item }}</template>
                    </v-checkbox>
                  </template>
                </v-virtual-scroll>

                <v-btn size="small" variant="text" color="primary" class="mb-2" :disabled="!tagSearch.trim()" @click="handleCreateTag">
                  Добавить тег "{{ tagSearch.trim() || '...' }}"
                </v-btn>
              </v-card>
            </v-menu>
          </div>
        </div>
      </aside>

      <section class="content-card">
        <v-tabs v-model="activeTab" color="primary" align-tabs="start">
          <v-tab value="runs" class="text-none">Запуски</v-tab>
          <v-tab value="models" class="text-none">Модели</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="runs">
            <v-data-table-server
              :headers="runsHeaders"
              :items="detail.runs"
              :items-length="detail.runs.length"
              item-value="id"
              hide-default-footer
              class="inner-table"
              density="comfortable"
            >
              <template #item.select><v-checkbox-btn /></template>
              <template #item.status="{ item }">
                <v-chip size="small" :color="item.status === 'completed' ? 'green' : 'blue'">
                  {{ item.status === 'completed' ? 'Завершен' : 'В процессе' }}
                </v-chip>
              </template>
              <template #item.actions>
                <div class="actions-col">
                  <v-menu location="bottom end">
                    <template #activator="{ props }"><v-btn icon variant="text" size="small" v-bind="props"><v-icon icon="mdi-dots-horizontal" /></v-btn></template>
                    <v-list density="compact">
                      <v-list-item title="Открыть" prepend-icon="mdi-open-in-new" />
                      <v-list-item title="Логи" prepend-icon="mdi-text-box-search-outline" />
                    </v-list>
                  </v-menu>
                </div>
              </template>
            </v-data-table-server>
          </v-window-item>

          <v-window-item value="models">
            <v-data-table-server
              :headers="modelsHeaders"
              :items="detail.models"
              :items-length="detail.models.length"
              item-value="id"
              hide-default-footer
              class="inner-table"
              density="comfortable"
            >
              <template #item.select><v-checkbox-btn /></template>
              <template #item.actions>
                <div class="actions-col">
                  <v-menu location="bottom end">
                    <template #activator="{ props }"><v-btn icon variant="text" size="small" v-bind="props"><v-icon icon="mdi-dots-horizontal" /></v-btn></template>
                    <v-list density="compact">
                      <v-list-item title="Открыть" prepend-icon="mdi-open-in-new" />
                      <v-list-item title="Скачать" prepend-icon="mdi-download" />
                    </v-list>
                  </v-menu>
                </div>
              </template>
            </v-data-table-server>
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
import type { DataTableHeader } from 'vuetify'
import { api, ApiError } from '@/lib/api'
import type { ExperimentDetailResponse } from '@/types/experiments'

const props = defineProps<{ experimentId: number }>()

const route = useRoute()
const router = useRouter()
const detail = ref<ExperimentDetailResponse | null>(null)
const activeTab = ref<'runs' | 'models'>('runs')
const error = ref<string | null>(null)
const tagSearch = ref('')

const runsHeaders = computed<DataTableHeader[]>(() => [
  { title: '', key: 'select', sortable: false, width: 42 },
  { title: 'Название', key: 'name', sortable: false },
  { title: 'Время старта', key: 'startTime', sortable: false },
  { title: 'Датасет', key: 'dataset', sortable: false },
  { title: 'Продолжительность', key: 'duration', sortable: false },
  { title: 'Модель', key: 'model', sortable: false },
  { title: 'Статус', key: 'status', sortable: false },
  { title: '', key: 'actions', sortable: false, width: 52 },
])

const modelsHeaders = computed<DataTableHeader[]>(() => [
  { title: '', key: 'select', sortable: false, width: 42 },
  { title: 'Название', key: 'name', sortable: false },
  { title: 'Дата изменения', key: 'updatedAt', sortable: false },
  { title: 'Последняя версия', key: 'version', sortable: false },
  { title: '', key: 'actions', sortable: false, width: 52 },
])

const filteredTagOptions = computed(() => {
  const all = detail.value?.availableTags ?? []
  const search = tagSearch.value.trim().toLowerCase()
  return search ? all.filter((tag) => tag.toLowerCase().includes(search)) : all
})

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
    detail.value = await api.post<ExperimentDetailResponse, { tag: string }>(`/experiments/${props.experimentId}/tags`, { tag: tag.trim() })
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Не удалось обновить теги'
  }
}

async function removeTag(tag: string) {
  try {
    detail.value = await api.del<ExperimentDetailResponse>(`/experiments/${props.experimentId}/tags/${encodeURIComponent(tag)}`)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Не удалось обновить теги'
  }
}

async function handleToggleTag(tag: string, checked: boolean) {
  if (checked) {
    await addTag(tag)
    return
  }
  await removeTag(tag)
}

async function handleCreateTag() {
  const value = tagSearch.value.trim()
  if (!value) return
  await addTag(value)
  tagSearch.value = ''
}

onMounted(fetchDetail)
watch(() => props.experimentId, fetchDetail)
</script>

<style scoped>
.experiment-detail-view { padding: 24px; }
.detail-layout { display: grid; grid-template-columns: 360px 1fr; gap: 12px; }
.info-card, .content-card { background: #ffffff; border-radius: 12px; padding: 16px; }
.info-title { margin-bottom: 10px; font-size: 22px; }
.info-block { margin-bottom: 14px; }
.info-label { color: #525a66; margin-bottom: 6px; }
.info-value { color: #1f2937; }
.tags-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.tag-chip { background: #d9f3fb; color: #0a87a6; font-weight: 500; }
.inner-table { margin-top: 8px; border: 1px solid #d8dee8; }
.inner-table :deep(th) { background: #e8ebf2; }
.actions-col { text-align: right; }
.table-pagination { display: flex; justify-content: center; align-items: center; margin-top: 12px; }
.page-pill { width: 42px; height: 42px; border-radius: 10px; background: #eceff4; display: inline-flex; align-items: center; justify-content: center; }
</style>
