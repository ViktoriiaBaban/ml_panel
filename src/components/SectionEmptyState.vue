<template>
  <div class="empty-state-shell">
    <v-card class="empty-state-card" rounded="xl" variant="text">
      <p class="text-h6 font-weight-bold mb-2">Подключите интеграции</p>
      <p class="text-body-1 text-medium-emphasis mb-5">
        Чтобы продолжить, привяжите аккаунт
        <strong>{{ servicesLabel }}</strong>
        в настройках профиля.
      </p>
      <v-btn color="primary" variant="flat" prepend-icon="mdi-link-variant" @click="$emit('open-connections')">
        Перейти в настройки интеграций
      </v-btn>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  missingServices: string[]
}>()

defineEmits<{
  (event: 'open-connections'): void
}>()

const servicesLabel = computed(() => props.missingServices.join(', '))
</script>

<style scoped>
.empty-state-shell {
  min-height: calc(100vh - 190px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.empty-state-card {
  width: min(720px, 100%);
  padding: 32px;
  border: 2px dashed rgba(100, 116, 139, 0.5);
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(2px);
  text-align: center;
}
</style>
