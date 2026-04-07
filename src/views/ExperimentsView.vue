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

      <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4">
        {{ store.error }}
      </v-alert>

      <div class="table-wrap">
        <v-table class="experiments-table" density="comfortable">
          <thead>
            <tr>
              <th class="checkbox-col">
                <v-checkbox-btn :model-value="store.allVisibleSelected" @update:model-value="store.toggleVisibleSelection" />
              </th>
              <th class="sortable" @click="store.setSort('name')">
                <span>Название</span>
                <v-icon size="16" :icon="store.sort === 'name' ? (store.sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down') : 'mdi-arrow-up-down'" />
              </th>
              <th>
                <div class="th-with-icon">
                  <span>Теги</span>
                  <v-icon icon="mdi-filter-variant" size="16" />
                </div>
              </th>
              <th class="sortable" @click="store.setSort('updatedAt')">
                <span>Дата изменения</span>
                <v-icon size="16" :icon="store.sort === 'updatedAt' ? (store.sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down') : 'mdi-arrow-up-down'" />
              </th>
              <th class="sortable" @click="store.setSort('createdAt')">
                <span>Дата создания</span>
                <v-icon size="16" :icon="store.sort === 'createdAt' ? (store.sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down') : 'mdi-arrow-up-down'" />
              </th>
              <th>
                <div class="th-with-icon">
                  <span>Проект</span>
                  <v-icon icon="mdi-filter-variant" size="16" />
                </div>
              </th>
              <th class="actions-col" />
            </tr>
            <tr class="filters-row">
              <th />
              <th>
                <v-text-field
                  :model-value="store.nameFilter"
                  variant="underlined"
                  density="compact"
                  hide-details
                  placeholder="Фильтр названия"
                  @update:model-value="store.setNameFilter(String($event ?? ''))"
                />
              </th>
              <th>
                <v-select
                  :model-value="store.tagFilter"
                  :items="[{ title: 'Все теги', value: 'all' }, ...store.availableTags.map(tag => ({ title: tag, value: tag }))]"
                  variant="underlined"
                  density="compact"
                  hide-details
                  @update:model-value="store.setTagFilter(String($event ?? 'all'))"
                />
              </th>
              <th />
              <th />
              <th>
                <v-select
                  :model-value="store.projectFilter"
                  :items="[{ title: 'Все проекты', value: 'all' }, ...store.availableProjects.map(project => ({ title: project, value: project }))]"
                  variant="underlined"
                  density="compact"
                  hide-details
                  @update:model-value="store.setProjectFilter(String($event ?? 'all'))"
                />
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.loading">
              <td colspan="7" class="loading-cell">
                <v-progress-circular indeterminate color="primary" size="20" width="2" />
              </td>
            </tr>
            <tr v-for="item in store.items" v-else :key="item.id">
              <td class="checkbox-col">
                <v-checkbox-btn
                  :model-value="store.selected.includes(item.id)"
                  @update:model-value="store.toggleRowSelection(item.id)"
                />
              </td>
              <td><v-btn variant="text" class="name-link" @click="openExperiment(item)">{{ item.name }}</v-btn></td>
              <td>
                <div class="tags-wrap">
                  <v-chip v-for="tag in item.tags.slice(0, 2)" :key="tag" size="small" color="cyan-lighten-4" class="tag-chip">
                    {{ tag }}
                  </v-chip>
                  <v-chip v-if="item.tags.length > 2" size="small" variant="tonal">+{{ item.tags.length - 2 }}</v-chip>
                </div>
              </td>
              <td>{{ item.updatedAt }}</td>
              <td>{{ item.createdAt }}</td>
              <td>{{ item.project }}</td>
              <td class="actions-col">
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
              </td>
            </tr>
            <tr v-if="!store.loading && store.items.length === 0">
              <td colspan="7" class="empty-cell">Эксперименты не найдены</td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div class="pagination-wrap">
        <v-btn icon variant="text" :disabled="store.page <= 1" @click="store.setPage(1)">
          <v-icon icon="mdi-page-first" />
        </v-btn>
        <v-btn icon variant="text" :disabled="store.page <= 1" @click="store.setPage(store.page - 1)">
          <v-icon icon="mdi-chevron-left" />
        </v-btn>

        <v-btn
          v-for="page in pagesToShow"
          :key="String(page)"
          :variant="page === store.page ? 'flat' : 'text'"
          :color="page === store.page ? 'grey-lighten-3' : undefined"
          class="page-btn"
          :disabled="page === '...'"
          @click="typeof page === 'number' && store.setPage(page)"
        >
          {{ page }}
        </v-btn>

        <v-btn icon variant="text" :disabled="store.page >= store.totalPages" @click="store.setPage(store.page + 1)">
          <v-icon icon="mdi-chevron-right" />
        </v-btn>
        <v-btn icon variant="text" :disabled="store.page >= store.totalPages" @click="store.setPage(store.totalPages)">
          <v-icon icon="mdi-page-last" />
        </v-btn>
      </div>
    </section>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExperimentsStore } from '@/stores/experiments'

const store = useExperimentsStore()
const router = useRouter()

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
.experiments-view {
  padding: 24px;
}

.experiments-panel {
  background: #f0f2f7;
  border-radius: 12px;
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.search-input {
  max-width: 460px;
  min-width: 320px;
}

.table-wrap {
  background: #fff;
  border: 1px solid #d9dee8;
  border-radius: 8px;
  overflow: hidden;
}

.experiments-table :deep(th) {
  background: #e8ebf2;
  font-weight: 600;
  color: #1f2937;
}

.experiments-table :deep(th),
.experiments-table :deep(td) {
  border-bottom: 1px solid #e2e8f0;
}

.sortable {
  cursor: pointer;
}

.sortable > span,
.sortable > .v-icon {
  vertical-align: middle;
}

.filters-row :deep(th) {
  background: #f4f6fb;
}

.checkbox-col {
  width: 44px;
}

.actions-col {
  width: 56px;
  text-align: right;
}

.name-link {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  padding: 0;
  min-width: 0;
}

.th-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tags-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-chip {
  color: #0891b2;
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 24px;
  color: #6b7280;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  gap: 6px;
}

.page-btn {
  min-width: 38px;
}
</style>
