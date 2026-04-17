import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, ApiError } from '@/api/api'
import type { AppSection, SectionIntegrationRequirement, SectionRequirementsResponse } from '@/types/integrations'

export const useIntegrationRequirementsStore = defineStore('integrationRequirements', () => {
  const sections = ref<SectionIntegrationRequirement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchRequirements = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<SectionRequirementsResponse>('/integrations/section-requirements')
      sections.value = response.sections
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не удалось проверить подключение интеграций'
      sections.value = []
    } finally {
      loading.value = false
    }
  }

  const getRequirementForSection = (section: AppSection) =>
    sections.value.find((item) => item.section === section) ?? null

  const blockedSections = computed(() => sections.value.filter((item) => !item.isReady))

  return {
    sections,
    loading,
    error,
    blockedSections,
    fetchRequirements,
    getRequirementForSection,
  }
})
