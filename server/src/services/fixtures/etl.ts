import type { EtlFlow, FlowComponent, FlowHistoryItem, FlowVariable } from '../../types/domain'

export const etlFlows: EtlFlow[] = [
  { id: 1, name: 'fraud-inference-pipeline', status: 'running', processGroups: 12, activeThreads: 8, queuedItems: 234, throughput: 1240, lastUpdated: '2026-03-25 14:23:45', source: 'Kafka: fraud-transactions', destination: 'Octopus: fraud_labels', owner: 'ml-team/fraud', schedule: 'Real-time', description: 'Поток скоринга транзакций в режиме реального времени' },
  { id: 2, name: 'data-ingestion-kafka', status: 'running', processGroups: 8, activeThreads: 5, queuedItems: 567, throughput: 2340, lastUpdated: '2026-03-25 14:23:40', source: 'S3: raw-events', destination: 'Kafka: events-normalized', owner: 'data-platform/ingestion', schedule: 'Каждые 5 минут', description: 'Нормализация и загрузка событий в Kafka' },
  { id: 3, name: 'model-training-etl', status: 'stopped', processGroups: 15, activeThreads: 0, queuedItems: 0, throughput: 0, lastUpdated: '2026-03-25 12:10:23', source: 'PostgreSQL: training_samples', destination: 'MLflow Artifacts', owner: 'ml-team/training', schedule: 'Каждую ночь в 02:00', description: 'Подготовка обучающей выборки и публикация артефактов' },
]

export const flowVariables: Record<number, FlowVariable[]> = {
  1: [
    { key: 'kafka.topic', value: 'transactions', description: 'Топик Kafka для чтения данных' },
    { key: 'kafka.group.id', value: 'fraud-pipeline-consumer', description: 'Consumer group ID' },
    { key: 'api.endpoint', value: 'http://bento-fraud:3000/predict', description: 'Endpoint для инференса модели' },
  ],
}

export const flowComponents: Record<number, FlowComponent[]> = {
  1: [
    { id: 1, name: 'FetchKafka', type: 'Processor', status: 'running', threadsActive: 2, tasksCompleted: 12340 },
    { id: 2, name: 'ValidateJSON', type: 'Processor', status: 'running', threadsActive: 1, tasksCompleted: 12340 },
    { id: 3, name: 'RouteOnAttribute', type: 'Processor', status: 'running', threadsActive: 1, tasksCompleted: 12340 },
  ],
}

export const flowHistory: Record<number, FlowHistoryItem[]> = {
  1: [
    { id: 1, timestamp: '2026-03-25 14:23:45', action: 'Flow started', user: 'Виктория', status: 'success' },
    { id: 2, timestamp: '2026-03-25 12:10:20', action: 'Flow stopped', user: 'Виктория', status: 'success' },
    { id: 3, timestamp: '2026-03-25 09:45:12', action: 'Variable updated: kafka.topic = "transactions"', user: 'Игорь', status: 'success' },
  ],
}
