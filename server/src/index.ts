type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

type ApiErrorShape = {
  error: string
  message?: string
  details?: unknown
}

function json(data: Json, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init?.headers ?? {}),
    },
  })
}

function apiError(status: number, payload: ApiErrorShape) {
  return json(payload as unknown as Json, { status })
}

function withCors(req: Request, res: Response) {
  const origin = req.headers.get('origin') ?? '*'
  const headers = new Headers(res.headers)
  headers.set('access-control-allow-origin', origin)
  headers.set('access-control-allow-credentials', 'true')
  headers.set('access-control-allow-methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  headers.set('access-control-allow-headers', req.headers.get('access-control-request-headers') ?? 'content-type')
  headers.set('vary', 'origin')
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
}

type RouteMatch = { params: Record<string, string> }
type Handler = (ctx: { req: Request; url: URL; params: Record<string, string> }) => Promise<Response> | Response

class Router {
  private routes: Array<{ method: string; pattern: RegExp; keys: string[]; handler: Handler }> = []

  on(method: string, pathPattern: string, handler: Handler) {
    const { regex, keys } = this.compile(pathPattern)
    this.routes.push({ method: method.toUpperCase(), pattern: regex, keys, handler })
    return this
  }

  match(method: string, pathname: string): { handler: Handler; match: RouteMatch } | null {
    const m = method.toUpperCase()
    for (const r of this.routes) {
      if (r.method !== m) continue
      const hit = r.pattern.exec(pathname)
      if (!hit) continue
      const params: Record<string, string> = {}
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(hit[i + 1] ?? '')))
      return { handler: r.handler, match: { params } }
    }
    return null
  }

  private compile(pathPattern: string) {
    const keys: string[] = []
    const escaped = pathPattern
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\:([A-Za-z0-9_]+)/g, (_m, key: string) => {
        keys.push(key)
        return '([^/]+)'
      })
    const regex = new RegExp('^' + escaped + '$')
    return { regex, keys }
  }
}

// Domain types (mirrors existing frontend mocks)
type PipelineStatus = 'success' | 'failed' | 'running' | 'partial'
type StageStatus = 'success' | 'failed' | 'running' | 'pending' | 'warning'
type ProjectType = 'training' | 'inference' | 'etl'
type ServiceStatus = 'running' | 'stopped' | 'error'
type FlowStatus = 'running' | 'stopped' | 'error'
type UserRole = 'user' | 'admin'
type UserStatus = 'active' | 'blocked'
type IntegrationStatus = 'working' | 'warning' | 'error'
type AlertState = 'firing' | 'ok' | 'pending'
type AlertSeverity = 'critical' | 'warning' | 'info'

type Project = {
  id: number
  name: string
  description: string
  namespace: string
  lastCommit: { author: string; time: string }
  pipelineStatus: Exclude<PipelineStatus, 'partial'>
  types: ProjectType[]
}

type PipelineStage = {
  name: string
  status: StageStatus
  duration?: string
  mlflowRun?: string
  bentoService?: string
  nifiFlow?: string
}
type Pipeline = {
  id: number
  projectId: number
  pipelineId: string
  branch: string
  tag?: string
  author: string
  startTime: string
  stages: PipelineStage[]
  duration: string
  status: PipelineStatus
}

type StorageFileType = 'Разметка' | 'Датасет' | 'Артефакт модели'
type StorageFile = { id: number; name: string; type: StorageFileType; size: string; date: string; project: string }

type InferenceService = {
  id: number
  name: string
  project: string
  model: string
  endpoint: string
  version: string
  status: ServiceStatus
  rps: number
  latencyP95: number
  errorRate: number
}

type InferenceRecentCall = { id: number; time: string; latency: number; status: 'success' | 'error' }
type InferenceLogItem = { id: number; timestamp: string; level: 'ERROR' | 'WARNING' | 'INFO'; message: string }
type InferenceChart = { title: string; color: string; data: Array<{ pct: number }> }
type InferenceRelatedSystem = { icon: 'RefreshCw' | 'Database' | 'FlaskConical'; name: string; desc: string }
type InferenceServiceMonitoring = {
  recentCalls: InferenceRecentCall[]
  logs: InferenceLogItem[]
  charts: InferenceChart[]
  modelArtifacts: string[]
  relatedSystems: InferenceRelatedSystem[]
}

type EtlFlow = {
  id: number
  name: string
  status: FlowStatus
  processGroups: number
  activeThreads: number
  queuedItems: number
  throughput: number
  lastUpdated: string
  source: string
  destination: string
  owner: string
  schedule: string
  description: string
}

type FlowVariable = { key: string; value: string; description: string }
type FlowComponent = { id: number; name: string; type: string; status: string; threadsActive: number; tasksCompleted: number }
type FlowHistoryItem = { id: number; timestamp: string; action: string; user: string; status: 'success' | 'error' }

type User = { id: number; email: string; name: string; role: UserRole; status: UserStatus; registrationDate: string; lastLogin: string }
type Integration = {
  id: string
  name: string
  status: IntegrationStatus
  lastCheck: string
  details?: { url?: string; version?: string; error?: string; lastSuccessfulCall?: string }
}

type HealthCheck = { name: string; command: string }

type MonitoringMetric = {
  label: string
  value: string
  sub: string
  trend: 'up' | 'down'
}
type MonitoringServiceUptime = { name: string; status: number }
type Alert = { id: number; name: string; status: string; state: AlertState; severity: AlertSeverity; lastChanged: string; description: string }

class InMemoryDb {
  projects: Project[] = [
    { id: 1, name: 'fraud-detection', description: 'Модель для детекции мошенничества в транзакциях', namespace: 'ml-team/fraud', lastCommit: { author: 'ivanov', time: '2 ч назад' }, pipelineStatus: 'success', types: ['training', 'inference'] },
    { id: 2, name: 'customer-segmentation', description: 'Сегментация клиентов для маркетинга', namespace: 'ml-team/marketing', lastCommit: { author: 'petrova', time: '5 ч назад' }, pipelineStatus: 'running', types: ['training'] },
    { id: 3, name: 'recommendation-engine', description: 'Рекомендательная система для продуктов', namespace: 'ml-team/recommendations', lastCommit: { author: 'sidorov', time: '1 день назад' }, pipelineStatus: 'success', types: ['training', 'inference'] },
    { id: 4, name: 'text-classification', description: 'Классификация текстовых документов', namespace: 'ml-team/nlp', lastCommit: { author: 'kuznetsov', time: '3 ч назад' }, pipelineStatus: 'failed', types: ['training', 'inference'] },
    { id: 5, name: 'data-pipeline-etl', description: 'ETL пайплайн для подготовки данных', namespace: 'data-engineering/pipelines', lastCommit: { author: 'sokolova', time: '12 ч назад' }, pipelineStatus: 'success', types: ['etl'] },
    { id: 6, name: 'image-recognition', description: 'Распознавание объектов на изображениях', namespace: 'ml-team/vision', lastCommit: { author: 'volkov', time: '6 ч назад' }, pipelineStatus: 'running', types: ['training', 'inference'] },
  ]

  pipelines: Pipeline[] = [
    { id: 1, projectId: 1, pipelineId: '#1428', branch: 'main', tag: 'v1.2.0', author: 'petrov', startTime: '2026-01-14 14:30', duration: '12 мин 34 сек', status: 'partial', stages: [{ name: 'data_prep', status: 'success', duration: '2 мин 15 сек' }, { name: 'train', status: 'success', duration: '8 мин 45 сек', mlflowRun: 'run-abc123' }, { name: 'deploy', status: 'warning', duration: '1 мин 34 сек', bentoService: 'fraud-v3' }] },
    { id: 2, projectId: 2, pipelineId: '#1427', branch: 'dev', author: 'ivanov', startTime: '2026-01-14 12:15', duration: '10 мин 20 сек', status: 'success', stages: [{ name: 'data_prep', status: 'success', duration: '2 мин 10 сек' }, { name: 'train', status: 'success', duration: '7 мин 30 сек', mlflowRun: 'run-def456' }, { name: 'test', status: 'success', duration: '40 сек' }] },
    { id: 3, projectId: 3, pipelineId: '#1426', branch: 'feature/new-model', author: 'sidorova', startTime: '2026-01-14 10:00', duration: '15 мин 45 сек', status: 'failed', stages: [{ name: 'data_prep', status: 'success', duration: '2 мин 20 сек' }, { name: 'train', status: 'failed', duration: '5 мин 15 сек', mlflowRun: 'run-ghi789' }, { name: 'deploy', status: 'pending' }] },
    { id: 4, projectId: 5, pipelineId: '#1425', branch: 'main', tag: 'v1.1.5', author: 'kuznetsov', startTime: '2026-01-13 16:45', duration: '11 мин 10 сек', status: 'success', stages: [{ name: 'etl', status: 'success', duration: '3 мин 30 сек', nifiFlow: 'flow-etl-001' }, { name: 'data_prep', status: 'success', duration: '2 мин 05 сек' }, { name: 'train', status: 'success', duration: '5 мин 35 сек', mlflowRun: 'run-jkl012' }] },
    { id: 5, projectId: 1, pipelineId: '#1424', branch: 'main', author: 'volkov', startTime: '2026-01-13 14:20', duration: '9 мин 55 сек', status: 'running', stages: [{ name: 'data_prep', status: 'success', duration: '2 мин 15 сек' }, { name: 'train', status: 'running', mlflowRun: 'run-mno345' }, { name: 'deploy', status: 'pending' }] },
  ]

  files: StorageFile[] = [
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

  inferenceServices: InferenceService[] = [
    { id: 1, name: 'fraud-detection-v3', project: 'ml-team/fraud', model: 'run-abc123', endpoint: 'http://bento-fraud:3000/predict', version: 'fraud-detection:20260114-1430', status: 'running', rps: 24.3, latencyP95: 127, errorRate: 0.2 },
    { id: 2, name: 'recommendation-engine', project: 'ml-team/recommendations', model: 'run-xyz789', endpoint: 'http://bento-rec:3000/recommend', version: 'recommendation-engine:20260113-0920', status: 'running', rps: 45.7, latencyP95: 89, errorRate: 0.1 },
    { id: 3, name: 'sentiment-analyzer', project: 'nlp-team/sentiment', model: 'run-def456', endpoint: 'http://bento-sentiment:3000/analyze', version: 'sentiment-analyzer:20260112-1615', status: 'stopped', rps: 0, latencyP95: 0, errorRate: 0 },
    { id: 4, name: 'image-classifier-v2', project: 'cv-team/classification', model: 'run-ghi321', endpoint: 'http://bento-img:3000/classify', version: 'image-classifier:20260111-1045', status: 'error', rps: 0, latencyP95: 0, errorRate: 100 },
    { id: 5, name: 'churn-predictor', project: 'ml-team/churn', model: 'run-jkl654', endpoint: 'http://bento-churn:3000/predict', version: 'churn-predictor:20260110-1330', status: 'running', rps: 12.5, latencyP95: 156, errorRate: 0.3 },
    { id: 6, name: 'price-optimizer', project: 'ml-team/pricing', model: 'run-mno987', endpoint: 'http://bento-price:3000/optimize', version: 'price-optimizer:20260109-1720', status: 'running', rps: 8.9, latencyP95: 203, errorRate: 0.5 },
  ]

  inferenceMonitoringByServiceId: Record<number, InferenceServiceMonitoring> = {
    1: {
      charts: [
        { title: 'Latency (p50, p95)', color: 'bg-[#409EFF]', data: Array.from({ length: 24 }, () => ({ pct: 20 + Math.random() * 60 })) },
        { title: 'Throughput (RPS)', color: 'bg-purple-500', data: Array.from({ length: 24 }, () => ({ pct: 30 + Math.random() * 50 })) },
        { title: 'Error Rate (%)', color: 'bg-red-400', data: Array.from({ length: 24 }, () => ({ pct: Math.random() * 15 })) },
      ],
      recentCalls: [
        { id: 1, time: '2026-01-15 14:23:45', latency: 124, status: 'success' },
        { id: 2, time: '2026-01-15 14:23:43', latency: 98, status: 'success' },
        { id: 3, time: '2026-01-15 14:23:41', latency: 156, status: 'success' },
        { id: 4, time: '2026-01-15 14:23:39', latency: 203, status: 'success' },
        { id: 5, time: '2026-01-15 14:23:37', latency: 87, status: 'success' },
        { id: 6, time: '2026-01-15 14:23:35', latency: 312, status: 'error' },
        { id: 7, time: '2026-01-15 14:23:33', latency: 142, status: 'success' },
        { id: 8, time: '2026-01-15 14:23:31', latency: 95, status: 'success' },
        { id: 9, time: '2026-01-15 14:23:29', latency: 178, status: 'success' },
        { id: 10, time: '2026-01-15 14:23:27', latency: 134, status: 'success' },
      ],
      logs: [
        { id: 1, timestamp: '2026-01-15 14:23:45', level: 'INFO', message: 'Prediction request processed successfully' },
        { id: 2, timestamp: '2026-01-15 14:23:40', level: 'INFO', message: 'Model inference completed in 124ms' },
        { id: 3, timestamp: '2026-01-15 14:23:35', level: 'ERROR', message: 'Timeout while processing request: connection pool exhausted' },
        { id: 4, timestamp: '2026-01-15 14:23:30', level: 'WARNING', message: 'High memory usage detected: 85%' },
        { id: 5, timestamp: '2026-01-15 14:23:25', level: 'INFO', message: 'Batch prediction started for 128 items' },
        { id: 6, timestamp: '2026-01-15 14:23:20', level: 'INFO', message: 'Health check passed' },
        { id: 7, timestamp: '2026-01-15 14:23:15', level: 'ERROR', message: 'Failed to deserialize input payload' },
        { id: 8, timestamp: '2026-01-15 14:23:10', level: 'INFO', message: 'Prediction request processed successfully' },
      ],
      modelArtifacts: ['model.pkl', 'report.pdf', 'confusion_matrix.png'],
      relatedSystems: [
        { icon: 'RefreshCw', name: 'NiFi Flow: fraud-inference-pipeline', desc: 'Вызывает сервис для real-time инференса' },
        { icon: 'Database', name: 'Octopus: fraud_labels', desc: 'Сохранение результатов инференса' },
        { icon: 'FlaskConical', name: 'MLflow: run-abc123', desc: 'Исходная модель из эксперимента' },
      ],
    },
  }

  etlFlows: EtlFlow[] = [
    { id: 1, name: 'fraud-inference-pipeline', status: 'running', processGroups: 12, activeThreads: 8, queuedItems: 234, throughput: 1240, lastUpdated: '2026-03-25 14:23:45', source: 'Kafka: fraud-transactions', destination: 'Octopus: fraud_labels', owner: 'ml-team/fraud', schedule: 'Real-time', description: 'Поток скоринга транзакций в режиме реального времени' },
    { id: 2, name: 'data-ingestion-kafka', status: 'running', processGroups: 8, activeThreads: 5, queuedItems: 567, throughput: 2340, lastUpdated: '2026-03-25 14:23:40', source: 'S3: raw-events', destination: 'Kafka: events-normalized', owner: 'data-platform/ingestion', schedule: 'Каждые 5 минут', description: 'Нормализация и загрузка событий в Kafka' },
    { id: 3, name: 'model-training-etl', status: 'stopped', processGroups: 15, activeThreads: 0, queuedItems: 0, throughput: 0, lastUpdated: '2026-03-25 12:10:23', source: 'PostgreSQL: training_samples', destination: 'MLflow Artifacts', owner: 'ml-team/training', schedule: 'Каждую ночь в 02:00', description: 'Подготовка обучающей выборки и публикация артефактов' },
    { id: 4, name: 'feature-extraction-pipeline', status: 'running', processGroups: 10, activeThreads: 6, queuedItems: 128, throughput: 890, lastUpdated: '2026-03-25 14:23:38', source: 'Kafka: clickstream', destination: 'Redis: feature_store', owner: 'ml-team/recommendations', schedule: 'Real-time', description: 'Извлечение и агрегация фичей для рекомендаций' },
    { id: 5, name: 'data-validation-flow', status: 'error', processGroups: 6, activeThreads: 2, queuedItems: 1024, throughput: 45, lastUpdated: '2026-03-25 14:20:12', source: 'MinIO: incoming-datasets', destination: 'Nexus: validation-reports', owner: 'data-quality', schedule: 'Каждый час', description: 'Проверка качества входных датасетов и формирование отчётов' },
    { id: 6, name: 'realtime-aggregation', status: 'running', processGroups: 9, activeThreads: 7, queuedItems: 345, throughput: 1560, lastUpdated: '2026-03-25 14:23:42', source: 'Kafka: telemetry', destination: 'ClickHouse: telemetry_agg', owner: 'analytics-platform', schedule: 'Real-time', description: 'Агрегация телеметрии для мониторинговых дашбордов' },
  ]

  flowVariables: Record<number, FlowVariable[]> = {
    1: [
      { key: 'kafka.topic', value: 'transactions', description: 'Топик Kafka для чтения данных' },
      { key: 'kafka.group.id', value: 'fraud-pipeline-consumer', description: 'Consumer group ID' },
      { key: 'api.endpoint', value: 'http://bento-fraud:3000/predict', description: 'Endpoint для инференса модели' },
      { key: 'api.timeout', value: '5000', description: 'Таймаут API в миллисекундах' },
      { key: 'batch.size', value: '100', description: 'Размер батча для обработки' },
      { key: 'octopus.table', value: 'fraud_labels', description: 'Таблица для сохранения результатов' },
      { key: 'octopus.connection', value: 'jdbc:postgresql://octopus:5432/ml_data', description: 'Connection string для Octopus' },
      { key: 'error.retry.count', value: '3', description: 'Количество повторных попыток при ошибке' },
    ],
  }

  flowComponents: Record<number, FlowComponent[]> = {
    1: [
      { id: 1, name: 'FetchKafka', type: 'Processor', status: 'running', threadsActive: 2, tasksCompleted: 12340 },
      { id: 2, name: 'ValidateJSON', type: 'Processor', status: 'running', threadsActive: 1, tasksCompleted: 12340 },
      { id: 3, name: 'RouteOnAttribute', type: 'Processor', status: 'running', threadsActive: 1, tasksCompleted: 12340 },
      { id: 4, name: 'InvokeHTTP', type: 'Processor', status: 'running', threadsActive: 3, tasksCompleted: 11280 },
      { id: 5, name: 'PutOctopus', type: 'Processor', status: 'running', threadsActive: 2, tasksCompleted: 11280 },
      { id: 6, name: 'ErrorHandling', type: 'Process Group', status: 'running', threadsActive: 1, tasksCompleted: 1060 },
    ],
  }

  flowHistory: Record<number, FlowHistoryItem[]> = {
    1: [
      { id: 1, timestamp: '2026-03-25 14:23:45', action: 'Flow started', user: 'Виктория', status: 'success' },
      { id: 2, timestamp: '2026-03-25 12:10:20', action: 'Flow stopped', user: 'Виктория', status: 'success' },
      { id: 3, timestamp: '2026-03-25 09:45:12', action: 'Variable updated: kafka.topic = "transactions"', user: 'Игорь', status: 'success' },
      { id: 4, timestamp: '2026-03-24 16:30:05', action: 'Flow configuration changed', user: 'Виктория', status: 'success' },
      { id: 5, timestamp: '2026-03-24 14:15:33', action: 'Flow error: Connection timeout', user: 'System', status: 'error' },
      { id: 6, timestamp: '2026-03-24 10:20:18', action: 'Flow started', user: 'Виктория', status: 'success' },
    ],
  }

  users: User[] = [
    { id: 1, email: 'ivanov@example.com', name: 'Иванов Иван', role: 'user', status: 'active', registrationDate: '2025-11-03', lastLogin: '2026-01-16 09:45' },
    { id: 2, email: 'petrova@example.com', name: 'Петрова Мария', role: 'admin', status: 'active', registrationDate: '2025-10-15', lastLogin: '2026-01-16 10:20' },
    { id: 3, email: 'sidorov@example.com', name: 'Сидоров Петр', role: 'user', status: 'blocked', registrationDate: '2025-12-01', lastLogin: '2026-01-10 14:30' },
    { id: 4, email: 'victoria@example.com', name: 'Виктория', role: 'user', status: 'active', registrationDate: '2025-09-20', lastLogin: '2026-01-16 10:30' },
    { id: 5, email: 'kozlov@example.com', name: 'Козлов Андрей', role: 'user', status: 'active', registrationDate: '2025-11-18', lastLogin: '2026-01-15 18:15' },
  ]

  integrations: Integration[] = [
    { id: 'gitlab', name: 'GitLab CE', status: 'working', lastCheck: '2026-01-16 10:45', details: { url: 'https://gitlab.internal', version: 'v4' } },
    { id: 'mlflow', name: 'MLflow Tracking Server', status: 'working', lastCheck: '2026-01-16 10:44', details: { url: 'http://mlflow.internal:5000' } },
    { id: 'minio', name: 'MinIO (Object Storage)', status: 'warning', lastCheck: '2026-01-16 10:40', details: { url: 'minio.internal:9000', error: 'Проблемы с записью: AccessDenied' } },
    { id: 'nifi', name: 'Apache NiFi', status: 'working', lastCheck: '2026-01-16 10:45', details: { url: 'http://nifi.internal:8080' } },
    { id: 'nexus', name: 'Nexus Repository (Docker)', status: 'working', lastCheck: '2026-01-16 10:30', details: { url: 'nexus.internal:8081' } },
    { id: 'bentoml', name: 'BentoML (Deployment)', status: 'error', lastCheck: '2026-01-16 10:20', details: { url: 'http://bentoml-api:3000', error: 'Connection timeout', lastSuccessfulCall: '2026-01-16 09:15' } },
  ]

  healthChecks: HealthCheck[] = [
    { name: 'GitLab', command: 'GET /version + GET /projects?membership=true' },
    { name: 'MLflow', command: 'GET /api/2.0/mlflow/experiments/list' },
    { name: 'MinIO', command: 'mc ls mlflow-artifacts + mc cp test.txt ...' },
    { name: 'NiFi', command: 'GET /nifi-api/flow/status' },
    { name: 'Nexus', command: 'GET /v2/_catalog (Docker registry)' },
    { name: 'BentoML', command: 'GET /docs или bentoml list через CLI' },
  ]

  monitoring: {
    keyMetrics: MonitoringMetric[]
    servicesStatus: MonitoringServiceUptime[]
    alerts: Alert[]
  } = {
    keyMetrics: [
      { label: 'CPU Usage', value: '54.3%', sub: 'Avg across 8 nodes', trend: 'up' },
      { label: 'Memory Usage', value: '67.8%', sub: '42.3 GB / 64 GB', trend: 'down' },
      { label: 'Network Traffic', value: '85.4 MB/s', sub: 'In: 52.3 / Out: 33.1', trend: 'up' },
      { label: 'Requests/sec', value: '1,247', sub: 'Peak: 1,580 req/s', trend: 'up' },
    ],
    servicesStatus: [
      { name: 'PostgreSQL', status: 95 },
      { name: 'NiFi', status: 98 },
      { name: 'Kafka', status: 92 },
      { name: 'BentoML', status: 88 },
      { name: 'MLflow', status: 96 },
    ],
    alerts: [
      { id: 1, name: 'High CPU Usage', status: 'active', state: 'firing', severity: 'critical', lastChanged: '2026-03-25 14:15:30', description: 'CPU usage > 80% for 5 minutes' },
      { id: 2, name: 'Memory Usage Warning', status: 'active', state: 'ok', severity: 'warning', lastChanged: '2026-03-25 13:45:12', description: 'Memory usage > 75%' },
      { id: 3, name: 'Service Down Alert', status: 'active', state: 'firing', severity: 'critical', lastChanged: '2026-03-25 14:20:45', description: 'Service not responding for 1 minute' },
      { id: 4, name: 'Disk Space Low', status: 'active', state: 'pending', severity: 'warning', lastChanged: '2026-03-25 12:30:00', description: 'Disk usage > 85%' },
      { id: 5, name: 'High Error Rate', status: 'active', state: 'ok', severity: 'warning', lastChanged: '2026-03-25 11:15:23', description: 'Error rate > 5% for 10 minutes' },
      { id: 6, name: 'Database Connection Pool', status: 'paused', state: 'ok', severity: 'info', lastChanged: '2026-03-24 18:20:15', description: 'Connection pool usage > 90%' },
      { id: 7, name: 'Kafka Lag Alert', status: 'active', state: 'firing', severity: 'warning', lastChanged: '2026-03-25 14:18:20', description: 'Consumer lag > 10000 messages' },
      { id: 8, name: 'Model Inference Latency', status: 'active', state: 'ok', severity: 'info', lastChanged: '2026-03-25 10:05:40', description: 'P95 latency > 500ms' },
    ],
  }
}

class Api {
  constructor(private readonly db: InMemoryDb) {}

  listProjects(q: URLSearchParams) {
    const search = (q.get('search') ?? '').trim().toLowerCase()
    const status = q.get('status') ?? 'all'
    const out = this.db.projects.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      const matchStatus =
        status === 'all' ||
        (status === 'active' && p.pipelineStatus === 'running') ||
        (status === 'errors' && p.pipelineStatus === 'failed')
      return matchSearch && matchStatus
    })
    return out
  }

  listPipelines(projectId: number | null, q: URLSearchParams) {
    const branch = q.get('branch') ?? 'all'
    const status = q.get('status') ?? 'all'
    return this.db.pipelines.filter((p) => {
      if (projectId !== null && p.projectId !== projectId) return false
      const matchBranch = branch === 'all' || p.branch === branch
      const matchStatus = status === 'all' || p.status === status
      return matchBranch && matchStatus
    })
  }

  listFiles(q: URLSearchParams) {
    const search = (q.get('search') ?? '').trim().toLowerCase()
    const filterType = q.get('type') ?? 'Все типы'
    const sortField = q.get('sortField')
    const sortDirection = (q.get('sortDirection') ?? 'asc') as 'asc' | 'desc'
    const page = Math.max(1, Number(q.get('page') ?? '1') || 1)
    const perPage = Math.max(1, Math.min(100, Number(q.get('perPage') ?? '10') || 10))

    let files = this.db.files.filter((f) => {
      const matchSearch =
        !search ||
        f.name.toLowerCase().includes(search) ||
        f.project.toLowerCase().includes(search)
      const matchFilter =
        filterType === 'Все типы' ||
        f.type === filterType ||
        (filterType === 'Датасеты' && f.type === 'Датасет') ||
        (filterType === 'Артефакты' && f.type === 'Артефакт модели')
      return matchSearch && matchFilter
    })

    if (sortField) {
      const dir = sortDirection === 'asc' ? 1 : -1
      files = [...files].sort((a, b) => ((a as any)[sortField] > (b as any)[sortField] ? dir : -dir))
    }

    const total = files.length
    const start = (page - 1) * perPage
    const items = files.slice(start, start + perPage)
    return { items, total, page, perPage }
  }

  listInferenceServices(q: URLSearchParams) {
    const search = (q.get('search') ?? '').trim().toLowerCase()
    const status = q.get('status') ?? 'all'
    const project = q.get('project') ?? 'all'
    return this.db.inferenceServices.filter((s) => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search) ||
        s.project.toLowerCase().includes(search) ||
        s.model.toLowerCase().includes(search)
      const matchStatus = status === 'all' || s.status === status
      const matchProject = project === 'all' || s.project === project
      return matchSearch && matchStatus && matchProject
    })
  }

  getInferenceService(id: number) {
    return this.db.inferenceServices.find((s) => s.id === id) ?? null
  }

  getInferenceMonitoring(id: number) {
    return this.db.inferenceMonitoringByServiceId[id] ?? null
  }

  listEtlFlows() {
    return this.db.etlFlows
  }

  getEtlFlow(id: number) {
    return this.db.etlFlows.find((f) => f.id === id) ?? null
  }

  getFlowVariables(id: number) {
    return this.db.flowVariables[id] ?? []
  }

  updateFlowVariable(flowId: number, key: string, value: string) {
    const vars = this.db.flowVariables[flowId] ?? []
    const v = vars.find((x) => x.key === key)
    if (!v) return null
    v.value = value
    return v
  }

  getFlowComponents(id: number) {
    return this.db.flowComponents[id] ?? []
  }

  getFlowHistory(id: number) {
    return this.db.flowHistory[id] ?? []
  }

  listUsers() {
    return this.db.users
  }

  addUser(input: { email: string; name?: string; role?: UserRole }) {
    const email = input.email.trim()
    if (!email) return null
    const nextId = Math.max(...this.db.users.map((u) => u.id), 0) + 1
    const name = (input.name ?? '').trim() || email.split('@')[0] || email
    const role: UserRole = input.role ?? 'user'
    const registrationDate = new Date().toISOString().split('T')[0] ?? '—'
    const u: User = { id: nextId, email, name, role, status: 'active', registrationDate, lastLogin: '—' }
    this.db.users.push(u)
    return u
  }

  toggleUserStatus(id: number) {
    const u = this.db.users.find((x) => x.id === id)
    if (!u) return null
    u.status = u.status === 'active' ? 'blocked' : 'active'
    return u
  }

  deleteUser(id: number) {
    const before = this.db.users.length
    this.db.users = this.db.users.filter((u) => u.id !== id)
    return this.db.users.length !== before
  }

  listIntegrations() {
    return this.db.integrations
  }

  listHealthChecks() {
    return this.db.healthChecks
  }

  checkIntegration(id: string) {
    const i = this.db.integrations.find((x) => x.id === id)
    if (!i) return null
    i.status = Math.random() > 0.3 ? 'working' : 'warning'
    i.lastCheck = new Date().toLocaleString('ru-RU').replace(',', '')
    return i
  }

  getMonitoringOverview() {
    return {
      keyMetrics: this.db.monitoring.keyMetrics,
      servicesStatus: this.db.monitoring.servicesStatus,
    }
  }

  listAlerts(q: URLSearchParams) {
    const search = (q.get('search') ?? '').trim().toLowerCase()
    return this.db.monitoring.alerts.filter((a) => {
      if (!search) return true
      return a.name.toLowerCase().includes(search) || a.description.toLowerCase().includes(search)
    })
  }
}

async function readJson<T>(req: Request): Promise<T | null> {
  const ct = req.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) return null
  try {
    return (await req.json()) as T
  } catch {
    return null
  }
}

const db = new InMemoryDb()
const api = new Api(db)
const router = new Router()

router.on('GET', '/api/health', () => json({ ok: true } as unknown as Json))

router.on('GET', '/api/projects', ({ url }) => json(api.listProjects(url.searchParams) as unknown as Json))
router.on('GET', '/api/projects/:id/pipelines', ({ params, url }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid project id' })
  return json(api.listPipelines(id, url.searchParams) as unknown as Json)
})
router.on('GET', '/api/pipelines', ({ url }) => {
  const projectIdRaw = url.searchParams.get('projectId')
  const projectId = projectIdRaw ? Number(projectIdRaw) : null
  if (projectIdRaw && !Number.isFinite(projectId)) return apiError(400, { error: 'bad_request', message: 'Invalid projectId' })
  return json(api.listPipelines(projectId, url.searchParams) as unknown as Json)
})

router.on('GET', '/api/storage/files', ({ url }) => json(api.listFiles(url.searchParams) as unknown as Json))

router.on('GET', '/api/inference/services', ({ url }) => json(api.listInferenceServices(url.searchParams) as unknown as Json))
router.on('GET', '/api/inference/services/:id', ({ params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid service id' })
  const svc = api.getInferenceService(id)
  if (!svc) return apiError(404, { error: 'not_found', message: 'Service not found' })
  return json(svc as unknown as Json)
})
router.on('GET', '/api/inference/services/:id/monitoring', ({ params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid service id' })
  const mon = api.getInferenceMonitoring(id)
  if (!mon) return apiError(404, { error: 'not_found', message: 'Monitoring not found' })
  return json(mon as unknown as Json)
})

router.on('GET', '/api/etl/flows', () => json(api.listEtlFlows() as unknown as Json))
router.on('GET', '/api/etl/flows/:id', ({ params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid flow id' })
  const flow = api.getEtlFlow(id)
  if (!flow) return apiError(404, { error: 'not_found', message: 'Flow not found' })
  return json(flow as unknown as Json)
})
router.on('GET', '/api/etl/flows/:id/variables', ({ params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid flow id' })
  return json(api.getFlowVariables(id) as unknown as Json)
})
router.on('PATCH', '/api/etl/flows/:id/variables/:key', async ({ req, params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid flow id' })
  const body = await readJson<{ value?: string }>(req)
  if (!body || typeof body.value !== 'string') return apiError(400, { error: 'bad_request', message: 'Body must be { value: string }' })
  const updated = api.updateFlowVariable(id, params.key, body.value)
  if (!updated) return apiError(404, { error: 'not_found', message: 'Variable not found' })
  return json(updated as unknown as Json)
})
router.on('GET', '/api/etl/flows/:id/components', ({ params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid flow id' })
  return json(api.getFlowComponents(id) as unknown as Json)
})
router.on('GET', '/api/etl/flows/:id/history', ({ params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid flow id' })
  return json(api.getFlowHistory(id) as unknown as Json)
})

router.on('GET', '/api/admin/users', () => json(api.listUsers() as unknown as Json))
router.on('POST', '/api/admin/users', async ({ req }) => {
  const body = await readJson<{ email?: string; name?: string; role?: UserRole }>(req)
  if (!body?.email) return apiError(400, { error: 'bad_request', message: 'email is required' })
  const u = api.addUser({ email: body.email, name: body.name, role: body.role })
  if (!u) return apiError(400, { error: 'bad_request', message: 'Invalid email' })
  return json(u as unknown as Json, { status: 201 })
})
router.on('PATCH', '/api/admin/users/:id/toggle-status', ({ params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid user id' })
  const u = api.toggleUserStatus(id)
  if (!u) return apiError(404, { error: 'not_found', message: 'User not found' })
  return json(u as unknown as Json)
})
router.on('DELETE', '/api/admin/users/:id', ({ params }) => {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return apiError(400, { error: 'bad_request', message: 'Invalid user id' })
  const ok = api.deleteUser(id)
  if (!ok) return apiError(404, { error: 'not_found', message: 'User not found' })
  return json({ ok: true } as unknown as Json)
})

router.on('GET', '/api/admin/integrations', () => json(api.listIntegrations() as unknown as Json))
router.on('POST', '/api/admin/integrations/:id/check', ({ params }) => {
  const i = api.checkIntegration(params.id)
  if (!i) return apiError(404, { error: 'not_found', message: 'Integration not found' })
  return json(i as unknown as Json)
})
router.on('GET', '/api/admin/health-checks', () => json(api.listHealthChecks() as unknown as Json))

router.on('GET', '/api/monitoring/overview', () => json(api.getMonitoringOverview() as unknown as Json))
router.on('GET', '/api/monitoring/alerts', ({ url }) => json(api.listAlerts(url.searchParams) as unknown as Json))

const port = Number(process.env.PORT ?? '3001') || 3001
const server = Bun.serve({
  port,
  fetch: async (req) => {
    const url = new URL(req.url)
    if (req.method === 'OPTIONS') return withCors(req, new Response(null, { status: 204 }))

    const match = router.match(req.method, url.pathname)
    const res = match
      ? await match.handler({ req, url, params: match.match.params })
      : apiError(404, { error: 'not_found', message: 'Route not found', details: { path: url.pathname } })

    return withCors(req, res)
  },
})

console.log(`Fake API listening on http://localhost:${server.port}`)

