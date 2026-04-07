import type { Experiment } from '@/types/domain'

export const experiments: Experiment[] = [
  { id: 1, name: 'Image classification baseline', tags: ['computer-vision', 'classification', 'resnet'], updatedAt: '08.01.2026, 15:00', createdAt: '08.01.2026, 13:20', project: 'Роботы на складе' },
  { id: 2, name: 'NLP intent detection v2', tags: ['nlp'], updatedAt: '08.01.2026, 14:10', createdAt: '07.01.2026, 18:40', project: 'Ассистент поддержки' },
  { id: 3, name: 'Detection with YOLO', tags: ['computer-vision'], updatedAt: '08.01.2026, 13:55', createdAt: '05.01.2026, 09:10', project: 'Видеоаналитика' },
  { id: 4, name: 'Segment anything proto', tags: ['computer-vision', 'segmentation'], updatedAt: '07.01.2026, 21:30', createdAt: '03.01.2026, 11:52', project: 'Видеоаналитика' },
  { id: 5, name: 'Prompt quality benchmark', tags: ['nlp', 'classification'], updatedAt: '07.01.2026, 17:00', createdAt: '02.01.2026, 10:10', project: 'Ассистент поддержки' },
  { id: 6, name: 'Risk scoring with tabnet', tags: ['classification'], updatedAt: '07.01.2026, 12:30', createdAt: '29.12.2025, 16:40', project: 'Антифрод' },
  { id: 7, name: 'OCR invoices v3', tags: ['computer-vision', 'ocr'], updatedAt: '07.01.2026, 11:20', createdAt: '28.12.2025, 09:00', project: 'Документооборот' },
  { id: 8, name: 'RAG retrieval tuning', tags: ['nlp', 'retrieval'], updatedAt: '06.01.2026, 19:45', createdAt: '27.12.2025, 15:35', project: 'Ассистент поддержки' },
  { id: 9, name: 'Feature drift study', tags: ['monitoring'], updatedAt: '06.01.2026, 17:15', createdAt: '26.12.2025, 08:45', project: 'Антифрод' },
  { id: 10, name: 'Text summarization lite', tags: ['nlp'], updatedAt: '06.01.2026, 11:50', createdAt: '25.12.2025, 19:20', project: 'Ассистент поддержки' },
  { id: 11, name: 'Classifier distillation', tags: ['classification'], updatedAt: '05.01.2026, 18:10', createdAt: '24.12.2025, 17:20', project: 'Роботы на складе' },
  { id: 12, name: 'Object tracking metrics', tags: ['computer-vision', 'tracking'], updatedAt: '05.01.2026, 16:25', createdAt: '24.12.2025, 11:00', project: 'Видеоаналитика' },
]
