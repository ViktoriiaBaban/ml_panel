<template>
  <div class="fab-wrap">
    <transition name="fab-list">
      <div v-if="expanded" class="fab-actions">
        <v-btn
          rounded="xl"
          color="primary"
          variant="tonal"
          class="text-none"
          prepend-icon="mdi-upload"
          @click="emit('upload')"
        >
          Загрузить файл
        </v-btn>
        <v-btn
          rounded="xl"
          color="primary"
          variant="tonal"
          class="text-none"
          prepend-icon="mdi-folder-plus-outline"
          @click="emit('create-bucket')"
        >
          Создать бакет
        </v-btn>
      </div>
    </transition>

    <v-btn icon color="primary" size="large" elevation="6" @click="emit('toggle')">
      <v-icon>{{ expanded ? 'mdi-close' : 'mdi-plus' }}</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
defineProps<{ expanded: boolean }>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'upload'): void
  (e: 'create-bucket'): void
}>()
</script>

<style scoped>
.fab-wrap {
  position: fixed;
  right: 24px;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  z-index: 40;
}

.fab-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.fab-list-enter-active,
.fab-list-leave-active {
  transition: all 0.2s ease;
}

.fab-list-enter-from,
.fab-list-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
