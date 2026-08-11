import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { NOTIFICATIONS, TODAY } from '@/data/index.ts'
import type { NotificationItem } from '@/data/index.ts'
import { unreadCount as countUnread } from '@/lib/domain/notifications.ts'

interface NotificationsContextValue {
  items: NotificationItem[]
  unreadCount: number
  markRead: (id: string) => void
  markAllRead: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
)

type DateParts = {
  y: number
  m: number
  d: number
  time: string | null
}

function parseCreatedAt(createdAt: string): DateParts {
  const datePart = createdAt.slice(0, 10)
  const [ys, ms, ds] = datePart.split('-')
  const y = Number(ys)
  const m = Number(ms)
  const d = Number(ds)
  let time: string | null = null
  const tIndex = createdAt.indexOf('T')
  if (tIndex !== -1) {
    const rest = createdAt.slice(tIndex + 1)
    const match = /^(\d{2}):(\d{2})/.exec(rest)
    if (match?.[1] !== undefined && match[2] !== undefined) {
      time = `${match[1]}:${match[2]}`
    }
  }
  return { y, m, d, time }
}

function parseToday(today: string): { y: number; m: number; d: number } {
  const [ys, ms, ds] = today.slice(0, 10).split('-')
  return {
    y: Number(ys),
    m: Number(ms),
    d: Number(ds),
  }
}

function dayDiff(
  from: { y: number; m: number; d: number },
  to: { y: number; m: number; d: number },
): number {
  const a = Date.UTC(from.y, from.m - 1, from.d)
  const b = Date.UTC(to.y, to.m - 1, to.d)
  return Math.round((b - a) / 86_400_000)
}

export function formatNotificationTime(createdAt: string): string {
  const parts = parseCreatedAt(createdAt)
  const today = parseToday(TODAY)
  const diff = dayDiff(parts, today)

  if (diff === 0) {
    if (parts.time !== null) {
      return `今天 ${parts.time}`
    }
    return '今天'
  }
  if (diff === 1) {
    return '昨天'
  }
  if (diff >= 2 && diff <= 6) {
    return `${diff} 天前`
  }
  return `${parts.m}月${parts.d}日`
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>(() =>
    NOTIFICATIONS.map((item) => ({ ...item })),
  )

  const markRead = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    )
  }, [])

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })))
  }, [])

  const unread = useMemo(() => countUnread(items), [items])

  const value = useMemo(
    () => ({
      items,
      unreadCount: unread,
      markRead,
      markAllRead,
    }),
    [items, unread, markRead, markAllRead],
  )

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }
  return ctx
}
