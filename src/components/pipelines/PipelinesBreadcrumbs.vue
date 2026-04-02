<template>
  <div class="breadcrumbs-row">
    <v-btn variant="text" density="comfortable" class="breadcrumbs-link" @click="$emit('back')">Главная</v-btn>
    <span>→</span>
    <v-btn variant="text" density="comfortable" class="breadcrumbs-link" @click="$emit('back')">Проекты и пайплайны</v-btn>
    <span>→</span>
    <span class="breadcrumbs-current">Пайплайны</span>
    <span>→</span>
    <span class="breadcrumbs-project">{{ projectName }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ projectName: string }>()
defineEmits<{ back: [] }>()
</script>

<style scoped>
.breadcrumbs-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 14px;
}

.breadcrumbs-link {
  text-transform: none;
  padding: 0;
  min-width: auto;
}

.breadcrumbs-current {
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.breadcrumbs-project {
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
}
</style>
