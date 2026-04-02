<template>
  <v-dialog :model-value="gitlabOpen" max-width="500" @update:model-value="emit('close-gitlab')">
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center ga-2">
        <v-icon icon="mdiOpenInNew" color="primary" />
        Подтверждение перехода
      </v-card-title>
      <v-card-text>
        Вы собираетесь открыть проект <strong>{{ selectedProject?.name }}</strong> в GitLab в новой вкладке.
      </v-card-text>
      <v-card-actions class="px-6 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="emit('close-gitlab')">Отмена</v-btn>
        <v-btn color="primary" @click="emit('confirm-gitlab')">Открыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Project } from '@/types/projects'

defineProps<{
  gitlabOpen: boolean
  selectedProject: Project | null
}>()

const emit = defineEmits<{
  'close-gitlab': []
  'confirm-gitlab': []
}>()
</script>
