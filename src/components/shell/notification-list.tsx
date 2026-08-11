import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { UnreadDot } from '@/components/shell/notification-preview.tsx'
import { sortByCreatedDesc } from '@/lib/domain/notifications.ts'
import {
  formatNotificationTime,
  useNotifications,
} from '@/lib/notifications.tsx'
import { useNavigate } from '@/lib/router/react.tsx'
import { cn } from '@/lib/utils'

export function NotificationList() {
  const { items, markRead } = useNotifications()
  const navigate = useNavigate()

  const sorted = useMemo(() => sortByCreatedDesc(items), [items])

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
        <p className="text-[13px] text-muted-foreground">暂无通知</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col">
      {sorted.map((item) => (
        <li
          key={item.id}
          className="flex items-stretch border-b border-border last:border-b-0"
        >
          <button
            type="button"
            className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3 text-left transition-colors duration-[120ms] hover:bg-secondary/60"
            onClick={() => {
              markRead(item.id)
              navigate(item.targetPath)
            }}
          >
            <span className="mt-1.5 inline-flex size-2 shrink-0 items-center justify-center">
              <UnreadDot show={!item.read} />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-[13px]',
                  item.read
                    ? 'text-muted-foreground'
                    : 'font-medium text-foreground',
                )}
              >
                {item.title}
                {!item.read ? <span className="sr-only">未读</span> : null}
              </p>
              <p className="text-[12px] text-muted-foreground">{item.body}</p>
              <p className="text-[11px] text-muted-foreground/70">
                {formatNotificationTime(item.createdAt)}
              </p>
            </div>
          </button>
          <div className="flex shrink-0 items-center pr-3">
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto px-1"
              disabled={item.read}
              onClick={() => {
                if (!item.read) {
                  markRead(item.id)
                }
              }}
            >
              {item.read ? '已读' : '标为已读'}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
