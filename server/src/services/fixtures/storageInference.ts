import type {
  InferenceService,
  InferenceServiceMonitoring,
  StorageBucket,
  StorageFile,
  StorageTable,
} from '@/types/domain'

export const buckets: StorageBucket[] = [
  { id: 1, name: 'fraud-raw', size: '164.2 МБ', createdAt: '10.04.2026, 08:10', project: 'fraud-detection' },
  { id: 2, name: 'fraud-features', size: '92.8 МБ', createdAt: '10.04.2026, 08:40', project: 'fraud-detection' },
  { id: 3, name: 'customer-360', size: '58.4 МБ', createdAt: '09.04.2026, 19:25', project: 'Сегментация клиентов' },
  { id: 4, name: 'support-nlp-datasets', size: '41.7 МБ', createdAt: '09.04.2026, 17:15', project: 'Классификация обращений' },
  { id: 5, name: 'vision-qa-images', size: '512.6 МБ', createdAt: '09.04.2026, 12:20', project: 'Компьютерное зрение: контроль качества' },
  { id: 6, name: 'sales-etl-staging', size: '203.1 МБ', createdAt: '08.04.2026, 23:05', project: 'daily-etl-sales' },
  { id: 7, name: 'recsys-events', size: '133.9 МБ', createdAt: '08.04.2026, 21:45', project: 'recommendation-engine' },
  { id: 8, name: 'recsys-model-artifacts', size: '88.6 МБ', createdAt: '08.04.2026, 22:30', project: 'recommendation-engine' },
  { id: 9, name: 'mlflow-exports', size: '34.5 МБ', createdAt: '07.04.2026, 16:55', project: 'fraud-detection' },
  { id: 10, name: 'ops-shared-snapshots', size: '75.9 МБ', createdAt: '07.04.2026, 15:40', project: 'Общие данные' },
]

export const files: StorageFile[] = [
  { id: 1, name: 'transactions_2026_q1.parquet', type: 'Датасет', size: '47.3 МБ', date: '11.04.2026, 07:50', project: 'fraud-detection', bucketId: 1 },
  { id: 2, name: 'chargeback_labels_v5.csv', type: 'Разметка', size: '1.1 МБ', date: '11.04.2026, 08:05', project: 'fraud-detection', bucketId: 1 },
  { id: 3, name: 'fraud_feature_store_snapshot.feather', type: 'Датасет', size: '22.6 МБ', date: '11.04.2026, 08:42', project: 'fraud-detection', bucketId: 2 },
  { id: 4, name: 'fraud_xgb_v241.pkl', type: 'Артефакт модели', size: '18.9 МБ', date: '11.04.2026, 09:36', project: 'fraud-detection', bucketId: 2 },
  { id: 5, name: 'customers_profile_march.csv', type: 'Датасет', size: '9.8 МБ', date: '10.04.2026, 18:20', project: 'Сегментация клиентов', bucketId: 3 },
  { id: 6, name: 'segment_assignments_v3.csv', type: 'Разметка', size: '740 КБ', date: '10.04.2026, 19:04', project: 'Сегментация клиентов', bucketId: 3 },
  { id: 7, name: 'support_tickets_ru_annotated.jsonl', type: 'Разметка', size: '2.3 МБ', date: '10.04.2026, 16:47', project: 'Классификация обращений', bucketId: 4 },
  { id: 8, name: 'ticket_topic_classifier.onnx', type: 'Артефакт модели', size: '96.4 МБ', date: '10.04.2026, 17:05', project: 'Классификация обращений', bucketId: 4 },
  { id: 9, name: 'line_camera_batch_042.zip', type: 'Датасет', size: '210.7 МБ', date: '10.04.2026, 12:55', project: 'Компьютерное зрение: контроль качества', bucketId: 5 },
  { id: 10, name: 'defect_masks_batch_042.zip', type: 'Разметка', size: '64.2 МБ', date: '10.04.2026, 13:10', project: 'Компьютерное зрение: контроль качества', bucketId: 5 },
]

export const tables: StorageTable[] = [
  { id: 1, name: 'raw_transactions', type: 'Исходные данные', rows: 2485120, createdAt: '11.04.2026, 07:58' },
  { id: 2, name: 'fraud_features_daily', type: 'Признаки', rows: 2485120, createdAt: '11.04.2026, 08:45' },
  { id: 3, name: 'chargeback_targets', type: 'Разметка', rows: 102344, createdAt: '11.04.2026, 08:06' },
  { id: 4, name: 'customer_segments_current', type: 'Признаки', rows: 783452, createdAt: '10.04.2026, 19:07' },
  { id: 5, name: 'customer_features_wide', type: 'Признаки', rows: 783452, createdAt: '10.04.2026, 18:42' },
  { id: 6, name: 'support_tickets_raw', type: 'Исходные данные', rows: 451220, createdAt: '10.04.2026, 16:30' },
  { id: 7, name: 'ticket_intent_labels', type: 'Разметка', rows: 78055, createdAt: '10.04.2026, 16:48' },
  { id: 8, name: 'vision_defect_catalog', type: 'Исходные данные', rows: 325880, createdAt: '10.04.2026, 13:14' },
  { id: 9, name: 'vision_embeddings_v2', type: 'Признаки', rows: 325880, createdAt: '10.04.2026, 13:40' },
  { id: 10, name: 'sales_orders_stage', type: 'Исходные данные', rows: 1743210, createdAt: '10.04.2026, 05:50' },
  { id: 11, name: 'sales_orders_mart', type: 'Признаки', rows: 512904, createdAt: '10.04.2026, 06:21' },
  { id: 12, name: 'recsys_user_events', type: 'Исходные данные', rows: 6245011, createdAt: '09.04.2026, 22:05' },
]

export const inferenceServices: InferenceService[] = [
  {
    id: 1,
    name: 'fraud-detection-v4',
    project: 'ml-core/risk',
    model: 'run-frd-2481',
    endpoint: 'http://bento-fraud:3000/predict',
    version: 'fraud-detection:20260411-0920',
    status: 'running',
    rps: 37.2,
    latencyP95: 104,
    errorRate: 0.15,
  },
  {
    id: 2,
    name: 'recommendation-engine',
    project: 'ml-product/recsys',
    model: 'run-rec-2477',
    endpoint: 'http://bento-recsys:3000/recommend',
    version: 'recommendation-engine:20260410-1840',
    status: 'running',
    rps: 51.4,
    latencyP95: 83,
    errorRate: 0.09,
  },
  {
    id: 3,
    name: 'support-intent-ru',
    project: 'nlp/support-routing',
    model: 'run-nlp-2475',
    endpoint: 'http://bento-nlp:3000/classify',
    version: 'support-intent-ru:20260409-1612',
    status: 'stopped',
    rps: 0,
    latencyP95: 0,
    errorRate: 0,
  },
  {
    id: 4,
    name: 'quality-vision-inspection',
    project: 'cv/quality-inspection',
    model: 'run-cv-1388',
    endpoint: 'http://bento-vision:3000/detect',
    version: 'quality-vision:20260410-1220',
    status: 'error',
    rps: 0,
    latencyP95: 0,
    errorRate: 100,
  },
  {
    id: 5,
    name: 'churn-predictor',
    project: 'analytics/churn',
    model: 'run-churn-9981',
    endpoint: 'http://bento-churn:3000/predict',
    version: 'churn-predictor:20260409-1115',
    status: 'running',
    rps: 14.8,
    latencyP95: 149,
    errorRate: 0.32,
  },
]

export const inferenceMonitoring: InferenceServiceMonitoring[] = [
  {
    serviceId: 1,
    history: [
      { timestamp: '10:00', rps: 22, latency: 110, errors: 0 },
      { timestamp: '10:05', rps: 27, latency: 107, errors: 1 },
      { timestamp: '10:10', rps: 31, latency: 103, errors: 0 },
      { timestamp: '10:15', rps: 30, latency: 101, errors: 0 },
      { timestamp: '10:20', rps: 37, latency: 104, errors: 1 },
    ],
  },
  {
    serviceId: 2,
    history: [
      { timestamp: '10:00', rps: 41, latency: 87, errors: 0 },
      { timestamp: '10:05', rps: 44, latency: 85, errors: 0 },
      { timestamp: '10:10', rps: 46, latency: 82, errors: 1 },
      { timestamp: '10:15', rps: 48, latency: 80, errors: 0 },
      { timestamp: '10:20', rps: 51, latency: 83, errors: 0 },
    ],
  },
  {
    serviceId: 3,
    history: [
      { timestamp: '10:00', rps: 0, latency: 0, errors: 0 },
      { timestamp: '10:05', rps: 0, latency: 0, errors: 0 },
      { timestamp: '10:10', rps: 0, latency: 0, errors: 0 },
      { timestamp: '10:15', rps: 0, latency: 0, errors: 0 },
      { timestamp: '10:20', rps: 0, latency: 0, errors: 0 },
    ],
  },
  {
    serviceId: 4,
    history: [
      { timestamp: '10:00', rps: 0, latency: 0, errors: 5 },
      { timestamp: '10:05', rps: 0, latency: 0, errors: 4 },
      { timestamp: '10:10', rps: 0, latency: 0, errors: 6 },
      { timestamp: '10:15', rps: 0, latency: 0, errors: 4 },
      { timestamp: '10:20', rps: 0, latency: 0, errors: 3 },
    ],
  },
  {
    serviceId: 5,
    history: [
      { timestamp: '10:00', rps: 11, latency: 153, errors: 0 },
      { timestamp: '10:05', rps: 12, latency: 151, errors: 0 },
      { timestamp: '10:10', rps: 13, latency: 150, errors: 0 },
      { timestamp: '10:15', rps: 13, latency: 148, errors: 1 },
      { timestamp: '10:20', rps: 15, latency: 149, errors: 0 },
    ],
  },
]
