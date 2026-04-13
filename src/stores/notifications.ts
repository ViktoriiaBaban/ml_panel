import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type NotificationSeverity = 'success' | 'info' | 'warning' | 'error'

export type AppNotification = {
  id: string
  title: string
  message: string
  severity: NotificationSeverity
  source: string
  createdAt: string
  read: boolean
  details?: string
}

const STORAGE_KEY = 'ml-panel-notifications-v1'

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<AppNotification[]>([])
  const toastQueue = ref<AppNotification[]>([])

  const unreadCount = computed(() => items.value.filter((n) => !n.read).length)

  function load() {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as AppNotification[]
      items.value = parsed
    } catch {
      items.value = []
    }
  }

  function persist() {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value.slice(0, 600)))
  }

  function push(payload: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
    const entry: AppNotification = {
      id: uid(),
      createdAt: new Date().toISOString(),
      read: false,
      ...payload,
    }
    items.value.unshift(entry)
    toastQueue.value.push(entry)
    if (typeof window !== 'undefined') {
      window.setTimeout(() => dismissToast(entry.id), 6000)
    }
    persist()
  }

  function remove(id: string) {
    items.value = items.value.filter((item) => item.id !== id)
    toastQueue.value = toastQueue.value.filter((item) => item.id !== id)
    persist()
  }

  function markRead(id: string, read = true) {
    const target = items.value.find((item) => item.id === id)
    if (!target) return
    target.read = read
    persist()
  }

  function markAllRead() {
    items.value = items.value.map((item) => ({ ...item, read: true }))
    persist()
  }

  function dismissToast(id: string) {
    toastQueue.value = toastQueue.value.filter((item) => item.id !== id)
  }

  function trackProcessStart(source: string, name: string, action: string) {
    push({
      source,
      severity: 'info',
      title: `${name}: ${action}`,
      message: `Операция «${action}» началась`,
    })
  }

  function trackProcessResult(source: string, name: string, action: string, ok: boolean, details?: string) {
    push({
      source,
      severity: ok ? 'success' : 'error',
      title: `${name}: ${action}`,
      message: ok ? `Операция «${action}» успешно завершена` : `Операция «${action}» завершилась ошибкой`,
      details,
    })
  }

  return {
    items,
    toastQueue,
    unreadCount,
    load,
    push,
    remove,
    markRead,
    markAllRead,
    dismissToast,
    trackProcessStart,
    trackProcessResult,
  }
})
