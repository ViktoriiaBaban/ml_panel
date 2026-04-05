import { h } from 'vue'
import {
  createRouter,
  createWebHistory,
  RouterView,
  type RouteLocationNormalizedLoaded,
} from 'vue-router'

import FileTable from '@/views/FileTable.vue'
import ProjectsView from '@/views/ProjectsView.vue'
import PipelinesView from '@/views/PipelinesView.vue'
import InferenceServicesView from '@/views/InferenceServicesView.vue'
import InferenceMonitoringView from '@/views/InferenceMonitoringView.vue'
import EtlFlowsView from '@/views/EtlFlowsView.vue'
import EtlFlowDetailView from '@/views/EtlFlowDetailView.vue'
import MonitoringSystemView from '@/views/MonitoringSystemView.vue'
import AdministrationView from '@/views/AdministrationView.vue'

const PlaceholderView = {
  render() {
    return h('div', { style: 'padding: 32px; color: #6b7280;' }, 'Раздел в разработке')
  },
}

const RouterGroup = {
  render() {
    return h(RouterView)
  },
}

type RouteMetaLabel = string | ((route: RouteLocationNormalizedLoaded) => string)

function label(
  value: RouteMetaLabel | undefined,
  route: RouteLocationNormalizedLoaded,
  fallback: string
) {
  if (typeof value === 'function') return value(route)
  if (typeof value === 'string') return value
  return fallback
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: PlaceholderView,
      meta: { section: 'home', title: 'Главная панель', breadcrumb: 'Главная' },
    },
    {
      path: '/storage',
      name: 'storage-root',
      component: RouterGroup,
      meta: { section: 'storage', title: 'Данные и хранилища', breadcrumb: 'Данные и хранилища' },
      children: [
        {
          path: '',
          name: 'storage-overview',
          component: FileTable,
          meta: {
            section: 'storage',
            title: 'Данные и хранилища',
            breadcrumb: 'Данные и хранилища',
          },
        },
        {
          path: 'buckets',
          name: 'storage-buckets',
          component: FileTable,
          meta: {
            section: 'storage',
            title: 'Данные и хранилища',
            breadcrumb: 'Бакеты',
          },
        },
        {
          path: 'files',
          name: 'storage-files',
          component: FileTable,
          meta: {
            section: 'storage',
            title: 'Данные и хранилища',
            breadcrumb: 'Файлы',
          },
        },
        {
          path: 'tables',
          name: 'storage-tables',
          component: FileTable,
          meta: {
            section: 'storage',
            title: 'Данные и хранилища',
            breadcrumb: 'Табличные данные',
          },
        },
      ],
    },
    {
      path: '/projects',
      name: 'projects',
      component: ProjectsView,
      meta: { section: 'projects', title: 'Мои проекты', breadcrumb: 'Проекты и пайплайны' },
    },
    {
      path: '/projects/:projectId/pipelines',
      name: 'project-pipelines',
      component: PipelinesView,
      props: (route) => ({
        projectId: Number(route.params.projectId),
        projectName: String(route.query.projectName ?? `Проект #${String(route.params.projectId)}`),
      }),
      meta: {
        section: 'projects',
        title: 'Пайплайны',
        breadcrumb: (route: RouteLocationNormalizedLoaded) =>
          String(route.query.projectName ?? 'Пайплайны'),
      },
    },
    {
      path: '/experiments',
      name: 'experiments',
      component: PlaceholderView,
      meta: { section: 'experiments', title: 'Эксперименты', breadcrumb: 'Эксперименты' },
    },
    {
      path: '/inference',
      name: 'inference-root',
      component: RouterGroup,
      meta: { section: 'inference', breadcrumb: 'Инференс-сервисы' },
      children: [
        {
          path: '',
          name: 'inference-services',
          component: InferenceServicesView,
          meta: { section: 'inference', title: 'Инференс-сервисы', breadcrumb: 'Сервисы' },
        },
        {
          path: 'services/:serviceId',
          name: 'inference-service-root',
          component: RouterGroup,
          meta: {
            section: 'inference',
            breadcrumb: (route: RouteLocationNormalizedLoaded) =>
              String(route.query.serviceName ?? `Сервис #${String(route.params.serviceId)}`),
          },
          children: [
            { path: '', redirect: { name: 'inference-service-metrics' } },
            {
              path: 'metrics',
              name: 'inference-service-metrics',
              component: InferenceMonitoringView,
              props: (route) => ({
                serviceId: Number(route.params.serviceId),
                serviceName: String(
                  route.query.serviceName ?? `Сервис #${String(route.params.serviceId)}`
                ),
              }),
              meta: { section: 'inference', title: 'Мониторинг инференса', breadcrumb: 'Метрики' },
            },
            {
              path: 'logs',
              name: 'inference-service-logs',
              component: InferenceMonitoringView,
              props: (route) => ({
                serviceId: Number(route.params.serviceId),
                serviceName: String(
                  route.query.serviceName ?? `Сервис #${String(route.params.serviceId)}`
                ),
              }),
              meta: { section: 'inference', title: 'Мониторинг инференса', breadcrumb: 'Логи' },
            },
            {
              path: 'model',
              name: 'inference-service-model',
              component: InferenceMonitoringView,
              props: (route) => ({
                serviceId: Number(route.params.serviceId),
                serviceName: String(
                  route.query.serviceName ?? `Сервис #${String(route.params.serviceId)}`
                ),
              }),
              meta: { section: 'inference', title: 'Мониторинг инференса', breadcrumb: 'Модель' },
            },
            {
              path: 'integrations',
              name: 'inference-service-integrations',
              component: InferenceMonitoringView,
              props: (route) => ({
                serviceId: Number(route.params.serviceId),
                serviceName: String(
                  route.query.serviceName ?? `Сервис #${String(route.params.serviceId)}`
                ),
              }),
              meta: {
                section: 'inference',
                title: 'Мониторинг инференса',
                breadcrumb: 'Интеграции',
              },
            },
          ],
        },
      ],
    },
    {
      path: '/etl',
      name: 'etl-root',
      component: RouterGroup,
      meta: { section: 'etl', breadcrumb: 'Потоки данных и ETL' },
      children: [
        {
          path: '',
          name: 'etl-flows',
          component: EtlFlowsView,
          meta: { section: 'etl', title: 'Потоки данных и ETL', breadcrumb: 'Потоки' },
        },
        {
          path: 'flows/:flowId',
          name: 'etl-flow-root',
          component: RouterGroup,
          meta: {
            section: 'etl',
            breadcrumb: (route: RouteLocationNormalizedLoaded) =>
              `Flow #${String(route.params.flowId ?? '')}`,
          },
          children: [
            { path: '', redirect: { name: 'etl-flow-metrics' } },
            {
              path: 'metrics',
              name: 'etl-flow-metrics',
              component: EtlFlowDetailView,
              props: (route) => ({ flowId: Number(route.params.flowId) }),
              meta: { section: 'etl', title: 'Мониторинг потока', breadcrumb: 'Метрики' },
            },
            {
              path: 'variables',
              name: 'etl-flow-variables',
              component: EtlFlowDetailView,
              props: (route) => ({ flowId: Number(route.params.flowId) }),
              meta: { section: 'etl', title: 'Мониторинг потока', breadcrumb: 'Переменные' },
            },
            {
              path: 'components',
              name: 'etl-flow-components',
              component: EtlFlowDetailView,
              props: (route) => ({ flowId: Number(route.params.flowId) }),
              meta: { section: 'etl', title: 'Мониторинг потока', breadcrumb: 'Компоненты' },
            },
            {
              path: 'history',
              name: 'etl-flow-history',
              component: EtlFlowDetailView,
              props: (route) => ({ flowId: Number(route.params.flowId) }),
              meta: { section: 'etl', title: 'Мониторинг потока', breadcrumb: 'История' },
            },
          ],
        },
      ],
    },
    {
      path: '/monitoring',
      name: 'monitoring-root',
      component: RouterGroup,
      meta: {
        section: 'monitoring',
        title: 'Мониторинг и состояние системы',
        breadcrumb: 'Мониторинг и состояние системы',
      },
      children: [
        { path: '', redirect: { name: 'monitoring-dashboard' } },
        {
          path: 'dashboard',
          name: 'monitoring-dashboard',
          component: MonitoringSystemView,
          meta: {
            section: 'monitoring',
            title: 'Мониторинг и состояние системы',
            breadcrumb: 'Дашборд',
          },
        },
        {
          path: 'alerts',
          name: 'monitoring-alerts',
          component: MonitoringSystemView,
          meta: {
            section: 'monitoring',
            title: 'Мониторинг и состояние системы',
            breadcrumb: 'Алерты',
          },
        },
      ],
    },
    {
      path: '/administration',
      name: 'administration-root',
      component: RouterGroup,
      meta: {
        section: 'administration',
        title: 'Администрирование',
        breadcrumb: 'Администрирование',
      },
      children: [
        { path: '', redirect: { name: 'administration-users' } },
        {
          path: 'users',
          name: 'administration-users',
          component: AdministrationView,
          meta: {
            section: 'administration',
            title: 'Администрирование',
            breadcrumb: 'Пользователи',
          },
        },
        {
          path: 'integrations',
          name: 'administration-integrations',
          component: AdministrationView,
          meta: {
            section: 'administration',
            title: 'Администрирование',
            breadcrumb: 'Системные интеграции',
          },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/storage' },
  ],
})

export function resolveBreadcrumb(
  record: { meta: Record<string, unknown>; path: string },
  route: RouteLocationNormalizedLoaded
) {
  return label(record.meta.breadcrumb as RouteMetaLabel | undefined, route, record.path)
}

export function resolveTitle(route: RouteLocationNormalizedLoaded) {
  for (let index = route.matched.length - 1; index >= 0; index -= 1) {
    const entry = route.matched[index]
    const metaTitle = entry.meta.title as RouteMetaLabel | undefined
    if (metaTitle) return label(metaTitle, route, 'ML Control Panel')
  }
  return 'ML Control Panel'
}
