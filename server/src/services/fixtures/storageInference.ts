import type { InferenceService, InferenceServiceMonitoring, StorageFile } from '../../types/domain'

export const files: StorageFile[] = [
  { id: 1, name: 'training_data_v1.csv', type: 'Датасет', size: '12.4 МБ', date: '09.01.2026, 14:23', project: 'Fraud Detection' },
  { id: 2, name: 'labels_annotated.json', type: 'Разметка', size: '856 КБ', date: '09.01.2026, 13:45', project: 'Fraud Detection' },
  { id: 3, name: 'model_v2.3.pkl', type: 'Артефакт модели', size: '45.2 МБ', date: '09.01.2026, 12:30', project: 'Fraud Detection' },
  { id: 4, name: 'validation_set.parquet', type: 'Датасет', size: '8.7 МБ', date: '09.01.2026, 11:15', project: 'Customer Segmentation' },
  { id: 5, name: 'feature_labels.csv', type: 'Разметка', size: '320 КБ', date: '09.01.2026, 10:00', project: 'Customer Segmentation' },
  { id: 6, name: 'classifier_final.h5', type: 'Артефакт модели', size: '92.1 МБ', date: '09.01.2026, 09:45', project: 'Text Classification' },
  { id: 7, name: 'test_data.csv', type: 'Датасет', size: '6.3 МБ', date: '09.01.2026, 08:20', project: 'Text Classification' },
  { id: 8, name: 'annotations_v3.json', type: 'Разметка', size: '1.2 МБ', date: '08.01.2026, 17:30', project: 'Image Recognition' },
  { id: 9, name: 'embeddings.npy', type: 'Артефакт модели', size: '128.5 МБ', date: '08.01.2026, 16:15', project: 'Recommendation System' },
  { id: 10, name: 'user_interactions.csv', type: 'Датасет', size: '22.8 МБ', date: '08.01.2026, 15:00', project: 'Recommendation System' },
]

export const inferenceServices: InferenceService[] = [
  { id: 1, name: 'fraud-detection-v3', project: 'ml-team/fraud', model: 'run-abc123', endpoint: 'http://bento-fraud:3000/predict', version: 'fraud-detection:20260114-1430', status: 'running', rps: 24.3, latencyP95: 127, errorRate: 0.2 },
  { id: 2, name: 'recommendation-engine', project: 'ml-team/recommendations', model: 'run-xyz789', endpoint: 'http://bento-rec:3000/recommend', version: 'recommendation-engine:20260113-0920', status: 'running', rps: 45.7, latencyP95: 89, errorRate: 0.1 },
  { id: 3, name: 'sentiment-analyzer', project: 'nlp-team/sentiment', model: 'run-def456', endpoint: 'http://bento-sentiment:3000/analyze', version: 'sentiment-analyzer:20260112-1615', status: 'stopped', rps: 0, latencyP95: 0, errorRate: 0 },
  { id: 4, name: 'image-classifier-v2', project: 'cv-team/classification', model: 'run-ghi321', endpoint: 'http://bento-img:3000/classify', version: 'image-classifier:20260111-1045', status: 'error', rps: 0, latencyP95: 0, errorRate: 100 },
  { id: 5, name: 'churn-predictor', project: 'ml-team/churn', model: 'run-jkl654', endpoint: 'http://bento-churn:3000/predict', version: 'churn-predictor:20260110-1330', status: 'running', rps: 12.5, latencyP95: 156, errorRate: 0.3 },
  { id: 6, name: 'price-optimizer', project: 'ml-team/pricing', model: 'run-mno987', endpoint: 'http://bento-price:3000/optimize', version: 'price-optimizer:20260109-1720', status: 'running', rps: 8.9, latencyP95: 203, errorRate: 0.5 },
]

export const inferenceMonitoringByServiceId: Record<number, InferenceServiceMonitoring> = {
  1: {
    charts: [
      { title: 'Latency (p50, p95)', color: 'bg-[#409EFF]', data: Array.from({ length: 24 }, () => ({ pct: 20 + Math.random() * 60 })) },
      { title: 'Throughput (RPS)', color: 'bg-purple-500', data: Array.from({ length: 24 }, () => ({ pct: 30 + Math.random() * 50 })) },
      { title: 'Error Rate (%)', color: 'bg-red-400', data: Array.from({ length: 24 }, () => ({ pct: Math.random() * 15 })) },
    ],
    recentCalls: Array.from({ length: 10 }, (_v, i) => ({ id: i + 1, time: `2026-01-15 14:23:${String(45 - i * 2).padStart(2, '0')}`, latency: [124, 98, 156, 203, 87, 312, 142, 95, 178, 134][i]!, status: i === 5 ? 'error' : 'success' })),
    logs: [
      { id: 1, timestamp: '2026-01-15 14:23:45', level: 'INFO', message: 'Prediction request processed successfully' },
      { id: 2, timestamp: '2026-01-15 14:23:40', level: 'INFO', message: 'Model inference completed in 124ms' },
      { id: 3, timestamp: '2026-01-15 14:23:35', level: 'ERROR', message: 'Timeout while processing request: connection pool exhausted' },
    ],
    modelArtifacts: ['model.pkl', 'report.pdf', 'confusion_matrix.png'],
    relatedSystems: [
      { icon: 'RefreshCw', name: 'NiFi Flow: fraud-inference-pipeline', desc: 'Вызывает сервис для real-time инференса' },
      { icon: 'Database', name: 'Octopus: fraud_labels', desc: 'Сохранение результатов инференса' },
      { icon: 'FlaskConical', name: 'MLflow: run-abc123', desc: 'Исходная модель из эксперимента' },
    ],
  },
}
