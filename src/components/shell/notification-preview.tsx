import { useMemo, useState } from 'react'
import { Bell } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Popover,
  PopoverPopup,
  PopoverTrigger,
} from '@/components/ui/popover'
import { sortByCreatedDesc } from '@/lib/domain/notifications.ts'
import {
  formatNotificationTime,
  useNotifications,
} from '@/lib/notifications.tsx'
import { Link, useNavigate } from '@/lib/router/react.tsx'
import { cn } from '@/lib/utils'

export function UnreadDot({ show }: { show: boolean }) {
  if (!show) {
    return null
  }
  return (
    <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />
  )
}

export function NotificationPreview() {
  const { items, unreadCount, markRead, markAllRead } = useNotifications()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const previewItems = useMemo(
    () => sortByCreatedDesc(items).slice(0, 3),
    [items],
  )

  const ariaLabel =
    unreadCount > 0 ? `通知，${unreadCount} 条未读` : '通知'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
          'relative',
        )}
        aria-label={ariaLabel}
      >
        <Bell />
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 font-mono text-[10px] text-primary-foreground">
            {unreadCount}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverPopup
        side="bottom"
        align="end"
        className="w-80 p-0 shadow-md [--viewport-inline-padding:0px] **:data-[slot=popover-viewport]:py-0"
      >
        <div className="flex w-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-[13px] font-medium text-foreground">通知</span>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto px-0"
              disabled={unreadCount === 0}
              onClick={() => {
                markAllRead()
              }}
            >
              全部标为已读
            </Button>
          </div>

          <div className="flex flex-col">
            {previewItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-[120ms] hover:bg-secondary/60"
                onClick={() => {
                  markRead(item.id)
                  navigate(item.targetPath)
                  setOpen(false)
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
                    {!item.read ? (
                      <span className="sr-only">未读</span>
                    ) : null}
                  </p>
                  <p className="line-clamp-2 text-[12px] text-muted-foreground">
                    {item.body}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">
                    {formatNotificationTime(item.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-border">
            <Link
              to="/notifications"
              className="block px-4 py-2.5 text-center text-[13px] text-primary transition-colors duration-[120ms] hover:bg-secondary/60"
              onClick={() => setOpen(false)}
            >
              查看全部通知
            </Link>
          </div>
        </div>
      </PopoverPopup>
    </Popover>
  )
}
