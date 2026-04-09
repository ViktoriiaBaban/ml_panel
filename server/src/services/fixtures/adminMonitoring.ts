import type { Alert, HealthCheck, Integration, MonitoringMetric, MonitoringServiceUptime, User } from '@/types/domain'

export const users: User[] = [
  { id: 1, email: 'ivanov@example.com', name: 'Иванов Иван', role: 'user', status: 'active', registrationDate: '2025-11-03', lastLogin: '2026-01-16 09:45' },
  { id: 2, email: 'petrova@example.com', name: 'Петрова Мария', role: 'admin', status: 'active', registrationDate: '2025-10-15', lastLogin: '2026-01-16 10:20' },
  { id: 3, email: 'sidorov@example.com', name: 'Сидоров Петр', role: 'user', status: 'blocked', registrationDate: '2025-12-01', lastLogin: '2026-01-10 14:30' },
]

export const integrations: Integration[] = [
  { id: 'gitlab', name: 'GitLab CE', connected: true, status: 'working', lastCheck: '2026-01-16 10:45', details: { url: 'https://gitlab.internal', version: 'v4' } },
  { id: 'mlflow', name: 'MLflow Tracking Server', connected: true, status: 'working', lastCheck: '2026-01-16 10:44', details: { url: 'http://mlflow.internal:5000' } },
  { id: 'minio', name: 'MinIO (Object Storage)', connected: true, status: 'warning', lastCheck: '2026-01-16 10:40', details: { url: 'minio.internal:9000', error: 'Проблемы с записью: AccessDenied' } },
]

export const healthChecks: HealthCheck[] = [
  { name: 'GitLab', command: 'GET /version + GET /projects?membership=true' },
  { name: 'MLflow', command: 'GET /api/2.0/mlflow/experiments/list' },
  { name: 'MinIO', command: 'mc ls mlflow-artifacts + mc cp test.txt ...' },
]

export const keyMetrics: MonitoringMetric[] = [
  { label: 'CPU Usage', value: '54.3%', sub: 'Avg across 8 nodes', trend: 'up' },
  { label: 'Memory Usage', value: '67.8%', sub: '42.3 GB / 64 GB', trend: 'down' },
]

export const servicesStatus: MonitoringServiceUptime[] = [
  { name: 'PostgreSQL', status: 95 },
  { name: 'NiFi', status: 98 },
  { name: 'Kafka', status: 92 },
]

export const alerts: Alert[] = [
  { id: 1, name: 'High CPU Usage', status: 'active', state: 'firing', severity: 'critical', lastChanged: '2026-03-25 14:15:30', description: 'CPU usage > 80% for 5 minutes' },
  { id: 2, name: 'Memory Usage Warning', status: 'active', state: 'ok', severity: 'warning', lastChanged: '2026-03-25 13:45:12', description: 'Memory usage > 75%' },
  { id: 3, name: 'Service Down Alert', status: 'active', state: 'firing', severity: 'critical', lastChanged: '2026-03-25 14:20:45', description: 'Service not responding for 1 minute' },
]
