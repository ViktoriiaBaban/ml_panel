<template>
  <v-container fluid class="experiments-view">
    <section class="experiments-panel">
      <div class="toolbar">
        <v-btn color="primary" prepend-icon="mdi-plus" class="text-none">Создать эксперимент</v-btn>

        <v-text-field
          :model-value="store.search"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          class="search-input"
          placeholder="Введите для поиска"
          @update:model-value="store.setSearch(String($event ?? ''))"
        />
      </div>

      <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4">{{ store.error }}</v-alert>

      <v-card class="table-wrap" flat>
        <v-data-table-server
          :headers="headers"
          :items="store.items"
          :items-length="store.total"
          item-value="id"
          hide-default-footer
          class="experiments-table"
          density="comfortable"
        >
          <template #header.select>
            <v-checkbox-btn :model-value="store.allVisibleSelected" @update:model-value="store.toggleVisibleSelection" />
          </template>

          <template #header.name>
            <button type="button" class="header-sort-btn" @click="store.setSort('name')">
              Название
              <v-icon
                size="16"
                :icon="store.sort === 'name' ? (store.sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down') : 'mdi-arrow-up-down'"
              />
            </button>
          </template>

          <template #header.tags>
            <div class="th-with-icon">
              <span>Теги</span>
              <v-menu location="bottom start">
                <template #activator="{ props }">
                  <v-badge dot color="primary" :model-value="store.tagFilter !== 'all'">
                    <v-btn icon variant="text" size="x-small" v-bind="props">
                      <v-icon icon="mdi-filter-variant" size="16" />
                    </v-btn>
                  </v-badge>
                </template>
                <v-card min-width="240" class="pa-3">
                  <v-select
                    :model-value="store.tagFilter"
                    :items="tagFilterItems"
                    label="Фильтр по тегу"
                    density="compact"
                    variant="outlined"
                    hide-details
                    @update:model-value="store.setTagFilter(String($event ?? 'all'))"
                  />
                </v-card>
              </v-menu>
            </div>
          </template>

          <template #header.updatedAt>
            <button type="button" class="header-sort-btn" @click="store.setSort('updatedAt')">
              Дата изменения
              <v-icon
                size="16"
                :icon="store.sort === 'updatedAt' ? (store.sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down') : 'mdi-arrow-up-down'"
              />
            </button>
          </template>

          <template #header.createdAt>
            <button type="button" class="header-sort-btn" @click="store.setSort('createdAt')">
              Дата создания
              <v-icon
                size="16"
                :icon="store.sort === 'createdAt' ? (store.sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down') : 'mdi-arrow-up-down'"
              />
            </button>
          </template>

          <template #header.project>
            <div class="th-with-icon">
              <span>Проект</span>
              <v-menu location="bottom start">
                <template #activator="{ props }">
                  <v-badge dot color="primary" :model-value="store.projectFilter !== 'all'">
                    <v-btn icon variant="text" size="x-small" v-bind="props">
                      <v-icon icon="mdi-filter-variant" size="16" />
                    </v-btn>
                  </v-badge>
                </template>
                <v-card min-width="260" class="pa-3">
                  <v-select
                    :model-value="store.projectFilter"
                    :items="projectFilterItems"
                    label="Фильтр по проекту"
                    density="compact"
                    variant="outlined"
                    hide-details
                    @update:model-value="store.setProjectFilter(String($event ?? 'all'))"
                  />
                </v-card>
              </v-menu>
            </div>
          </template>

          <template #item.select="{ item }">
            <v-checkbox-btn
              :model-value="store.selected.includes(item.id)"
              @update:model-value="store.toggleRowSelection(item.id)"
            />
          </template>

          <template #item.name="{ item }">
            <v-btn variant="text" class="name-link" @click="openExperiment(item)">{{ item.name }}</v-btn>
          </template>

          <template #item.tags="{ item }">
            <div class="tags-wrap">
              <v-chip v-for="tag in item.tags.slice(0, 2)" :key="tag" size="small" class="tag-chip" variant="flat">{{ tag }}</v-chip>
              <v-chip v-if="item.tags.length > 2" size="small" variant="flat" class="count-chip">+{{ item.tags.length - 2 }}</v-chip>
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="actions-col">
              <v-menu location="bottom end">
                <template #activator="{ props }">
                  <v-btn icon variant="text" size="small" v-bind="props" aria-label="Действия">
                    <v-icon icon="mdi-dots-horizontal" />
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item title="Открыть" prepend-icon="mdi-open-in-new" @click="openExperiment(item)" />
                  <v-list-item title="Редактировать" prepend-icon="mdi-pencil-outline" />
                  <v-list-item title="Удалить" prepend-icon="mdi-delete-outline" base-color="error" />
                </v-list>
              </v-menu>
            </div>
          </template>
        </v-data-table-server>
      </v-card>

      <div class="pagination-wrap">
        <v-btn icon variant="text" :disabled="store.page <= 1" @click="store.setPage(1)"><v-icon icon="mdi-page-first" /></v-btn>
        <v-btn icon variant="text" :disabled="store.page <= 1" @click="store.setPage(store.page - 1)"><v-icon icon="mdi-chevron-left" /></v-btn>

        <v-btn
          v-for="page in pagesToShow"
          :key="String(page)"
          :variant="page === store.page ? 'flat' : 'text'"
          :color="page === store.page ? 'grey-lighten-3' : undefined"
          class="page-btn"
          :disabled="page === '...'"
          @click="typeof page === 'number' && store.setPage(page)"
        >{{ page }}</v-btn>

        <v-btn icon variant="text" :disabled="store.page >= store.totalPages" @click="store.setPage(store.page + 1)"><v-icon icon="mdi-chevron-right" /></v-btn>
        <v-btn icon variant="text" :disabled="store.page >= store.totalPages" @click="store.setPage(store.totalPages)"><v-icon icon="mdi-page-last" /></v-btn>
      </div>
    </section>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { DataTableHeader } from 'vuetify'
import { useExperimentsStore } from '@/stores/experiments'

const store = useExperimentsStore()
const router = useRouter()

const headers = computed<DataTableHeader[]>(() => [
  { title: '', key: 'select', sortable: false, width: 44 },
  { title: 'Название', key: 'name', sortable: false },
  { title: 'Теги', key: 'tags', sortable: false },
  { title: 'Дата изменения', key: 'updatedAt', sortable: false },
  { title: 'Дата создания', key: 'createdAt', sortable: false },
  { title: 'Проект', key: 'project', sortable: false },
  { title: '', key: 'actions', sortable: false, width: 56 },
])

const tagFilterItems = computed(() => [
  { title: 'Все теги', value: 'all' },
  ...store.availableTags.map((tag) => ({ title: tag, value: tag })),
])

const projectFilterItems = computed(() => [
  { title: 'Все проекты', value: 'all' },
  ...store.availableProjects.map((project) => ({ title: project, value: project })),
])

onMounted(async () => {
  await store.fetchExperiments()
})

function openExperiment(item: { id: number; name: string }) {
  router.push({ name: 'experiment-detail', params: { experimentId: item.id }, query: { experimentName: item.name } })
}

const pagesToShow = computed<Array<number | '...'>>(() => {
  const total = store.totalPages
  const current = store.page
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, '...', total]
  if (current >= total - 2) return [1, '...', total - 2, total - 1, total]
  return [1, '...', current, '...', total]
})
</script>

<style scoped>
.experiments-view { padding: 24px; }
.experiments-panel { background: #f0f2f7; border-radius: 12px; padding: 20px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 16px; }
.search-input { max-width: 460px; min-width: 320px; }
.table-wrap { border: 1px solid #d9dee8; border-radius: 8px; overflow: hidden; }
.experiments-table :deep(th) { background: #e8ebf2; font-weight: 600; color: #1f2937; }
.header-sort-btn { display: inline-flex; align-items: center; gap: 4px; background: transparent; border: 0; cursor: pointer; font-weight: 600; }
.th-with-icon { display: inline-flex; align-items: center; gap: 4px; }
.name-link { text-transform: none; letter-spacing: 0; font-weight: 500; padding: 0; min-width: 0; }
.tags-wrap { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.tag-chip { background: #d9f3fb; color: #0a87a6; font-weight: 500; }
.count-chip { background: #eef2f7; }
.actions-col { text-align: right; }
.pagination-wrap { display: flex; justify-content: center; align-items: center; margin-top: 16px; gap: 6px; }
.page-btn { min-width: 38px; }
</style>
