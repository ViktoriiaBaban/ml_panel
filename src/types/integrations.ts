export type AppSection = 'storage' | 'projects' | 'experiments' | 'inference' | 'etl' | 'monitoring'

export interface SectionIntegrationRequirement {
  section: AppSection
  sectionTitle: string
  requiredServiceIds: string[]
  requiredServices: string[]
  connectedServiceIds: string[]
  missingServiceIds: string[]
  missingServices: string[]
  isReady: boolean
}

export interface SectionRequirementsResponse {
  sections: SectionIntegrationRequirement[]
}
