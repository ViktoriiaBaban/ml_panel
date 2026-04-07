import type { ExperimentDetail } from '@/types/domain'

export const experimentDetails: Record<number, ExperimentDetail> = {
  1: {
    id: 1,
    externalId: '154d48ef7485fa4fc8e',
    description: 'Бейзлайн для классификации изображений.',
    tags: ['nlp'],
    runs: [
      { id: 101, name: 'Название запуска', startTime: '08.01.2026, 15:00', dataset: '--', duration: '2.0 c', model: 'Название модели', status: 'completed' },
      { id: 102, name: 'Название запуска', startTime: '08.01.2026, 15:00', dataset: 'dataset (aa7a0238)', duration: '26.5 c', model: 'Название модели', status: 'completed' },
      { id: 103, name: 'Название запуска', startTime: '08.01.2026, 15:00', dataset: '--', duration: '--', model: 'Название модели', status: 'running' },
      { id: 104, name: 'Название запуска', startTime: '08.01.2026, 15:00', dataset: '--', duration: '14.4 c', model: 'Название модели', status: 'completed' },
      { id: 105, name: 'Название запуска', startTime: '08.01.2026, 15:00', dataset: '--', duration: '2.0 c', model: 'Название модели', status: 'completed' },
    ],
    models: [
      { id: 201, name: 'Название модели', updatedAt: '08.01.2026, 15:00', version: 'model-name-v12.1' },
      { id: 202, name: 'Название модели', updatedAt: '08.01.2026, 15:00', version: 'model-name-v7.3' },
      { id: 203, name: 'Название модели', updatedAt: '08.01.2026, 15:00', version: 'model-name-v2.0' },
      { id: 204, name: 'Название модели', updatedAt: '08.01.2026, 15:00', version: 'model-name-v5.1' },
    ],
  },
}
