import type { Pipeline, Project } from '../../types/domain'

export const projects: Project[] = [
  { id: 1, name: 'fraud-detection', description: 'Модель для детекции мошенничества в транзакциях', namespace: 'ml-team/fraud', lastCommit: { author: 'ivanov', time: '2 ч назад' }, pipelineStatus: 'success', types: ['training', 'inference'] },
  { id: 2, name: 'customer-segmentation', description: 'Сегментация клиентов для маркетинга', namespace: 'ml-team/marketing', lastCommit: { author: 'petrova', time: '5 ч назад' }, pipelineStatus: 'running', types: ['training'] },
  { id: 3, name: 'recommendation-engine', description: 'Рекомендательная система для продуктов', namespace: 'ml-team/recommendations', lastCommit: { author: 'sidorov', time: '1 день назад' }, pipelineStatus: 'success', types: ['training', 'inference'] },
  { id: 4, name: 'text-classification', description: 'Классификация текстовых документов', namespace: 'ml-team/nlp', lastCommit: { author: 'kuznetsov', time: '3 ч назад' }, pipelineStatus: 'failed', types: ['training', 'inference'] },
  { id: 5, name: 'data-pipeline-etl', description: 'ETL пайплайн для подготовки данных', namespace: 'data-engineering/pipelines', lastCommit: { author: 'sokolova', time: '12 ч назад' }, pipelineStatus: 'success', types: ['etl'] },
  { id: 6, name: 'image-recognition', description: 'Распознавание объектов на изображениях', namespace: 'ml-team/vision', lastCommit: { author: 'volkov', time: '6 ч назад' }, pipelineStatus: 'running', types: ['training', 'inference'] },
]

export const pipelines: Pipeline[] = [
  { id: 1, projectId: 1, pipelineId: '#1428', branch: 'main', tag: 'v1.2.0', author: 'petrov', startTime: '2026-01-14 14:30', duration: '12 мин 34 сек', status: 'partial', stages: [{ name: 'data_prep', status: 'success', duration: '2 мин 15 сек' }, { name: 'train', status: 'success', duration: '8 мин 45 сек', mlflowRun: 'run-abc123' }, { name: 'deploy', status: 'warning', duration: '1 мин 34 сек', bentoService: 'fraud-v3' }] },
  { id: 2, projectId: 2, pipelineId: '#1427', branch: 'dev', author: 'ivanov', startTime: '2026-01-14 12:15', duration: '10 мин 20 сек', status: 'success', stages: [{ name: 'data_prep', status: 'success', duration: '2 мин 10 сек' }, { name: 'train', status: 'success', duration: '7 мин 30 сек', mlflowRun: 'run-def456' }, { name: 'test', status: 'success', duration: '40 сек' }] },
  { id: 3, projectId: 3, pipelineId: '#1426', branch: 'feature/new-model', author: 'sidorova', startTime: '2026-01-14 10:00', duration: '15 мин 45 сек', status: 'failed', stages: [{ name: 'data_prep', status: 'success', duration: '2 мин 20 сек' }, { name: 'train', status: 'failed', duration: '5 мин 15 сек', mlflowRun: 'run-ghi789' }, { name: 'deploy', status: 'pending' }] },
  { id: 4, projectId: 5, pipelineId: '#1425', branch: 'main', tag: 'v1.1.5', author: 'kuznetsov', startTime: '2026-01-13 16:45', duration: '11 мин 10 сек', status: 'success', stages: [{ name: 'etl', status: 'success', duration: '3 мин 30 сек', nifiFlow: 'flow-etl-001' }, { name: 'data_prep', status: 'success', duration: '2 мин 05 сек' }, { name: 'train', status: 'success', duration: '5 мин 35 сек', mlflowRun: 'run-jkl012' }] },
  { id: 5, projectId: 1, pipelineId: '#1424', branch: 'main', author: 'volkov', startTime: '2026-01-13 14:20', duration: '9 мин 55 сек', status: 'running', stages: [{ name: 'data_prep', status: 'success', duration: '2 мин 15 сек' }, { name: 'train', status: 'running', mlflowRun: 'run-mno345' }, { name: 'deploy', status: 'pending' }] },
]
