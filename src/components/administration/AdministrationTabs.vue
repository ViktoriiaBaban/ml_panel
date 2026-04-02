<template>
  <v-tabs :model-value="modelValue" color="primary" align-tabs="start" @update:model-value="onTabChange">
    <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.label }}</v-tab>
  </v-tabs>
</template>

<script setup lang="ts">
import type { AdministrationTab, SelectOption } from '@/types/administration'

defineProps<{
  modelValue: AdministrationTab
  tabs: SelectOption<AdministrationTab>[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: AdministrationTab] }>()

function onTabChange(value: unknown) {
  emit('update:modelValue', value as AdministrationTab)
}
</script>
