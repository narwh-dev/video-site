import type { Route } from '@/lib/router/routes.ts'
import { Breadcrumbs } from '@/components/shell/breadcrumbs.tsx'
import { ThemeToggle } from '@/components/shell/theme-toggle.tsx'
import { NotificationPreview } from '@/components/shell/notification-preview.tsx'

export function TopToolbar({ route }: { route: Route }) {
  return (
    <header className="sticky top-0 z-30 flex h-10 items-center justify-between border-b border-border bg-background px-6 max-[1024px]:hidden">
      <Breadcrumbs route={route} />
      <div
        role="toolbar"
        aria-label="页面工具"
        className="flex items-center gap-1"
      >
        <ThemeToggle />
        <NotificationPreview />
      </div>
    </header>
  )
}
