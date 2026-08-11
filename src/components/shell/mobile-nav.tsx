import { Bookmark, Home, Tv, User } from 'lucide-react'
import { Link, useRoute } from '@/lib/router/react.tsx'
import { DEFAULT_CATALOG_QUERY, type Route } from '@/lib/router/routes.ts'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  icon: typeof Home
  to: Route
  isCurrent: (route: Route) => boolean
}

const ITEMS: NavItem[] = [
  {
    label: '首页',
    icon: Home,
    to: { name: 'home' },
    isCurrent: (route) => route.name === 'home',
  },
  {
    label: '剧集',
    icon: Tv,
    to: { name: 'catalog', query: DEFAULT_CATALOG_QUERY },
    isCurrent: (route) =>
      route.name === 'catalog' ||
      route.name === 'series-detail' ||
      route.name === 'watch',
  },
  {
    label: '收藏',
    icon: Bookmark,
    to: { name: 'favorites' },
    isCurrent: (route) => route.name === 'favorites',
  },
  {
    label: '我的',
    icon: User,
    to: { name: 'settings', section: 'profile' },
    isCurrent: (route) => route.name === 'settings',
  },
]

export function MobileNav() {
  const route = useRoute()

  return (
    <nav
      aria-label="底部导航"
      className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t border-border bg-background min-[768px]:hidden"
    >
      {ITEMS.map((item) => {
        const Icon = item.icon
        const current = item.isCurrent(route)
        return (
          <Link
            key={item.label}
            to={item.to}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 text-[11px] transition-colors duration-[120ms]',
              current
                ? 'font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
