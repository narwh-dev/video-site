import type { ReactNode, RefObject } from 'react'
import {
  Bell,
  Bookmark,
  ChevronsLeft,
  ChevronsRight,
  History,
  Home,
  Rocket,
  Search,
  Tv,
} from 'lucide-react'
import { SidebarSearch } from '@/components/shell/sidebar-search.tsx'
import {
  AccountMenuFull,
  AccountMenuIcon,
} from '@/components/shell/account-menu.tsx'
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipPopup, TooltipTrigger } from '@/components/ui/tooltip'
import {
  FOLLOWS,
  PROGRESS,
  SERIES,
  assetColorForIndex,
  getEpisode,
  getSeries,
} from '@/data/index.ts'
import { useAuth } from '@/lib/auth.tsx'
import { progressPercent } from '@/lib/domain/episode.ts'
import { useNotifications } from '@/lib/notifications.tsx'
import { Link, useRoute } from '@/lib/router/react.tsx'
import { DEFAULT_CATALOG_QUERY, type Route } from '@/lib/router/routes.ts'
import { cn } from '@/lib/utils'

type NavDest = {
  label: string
  icon: typeof Home
  to: Route
  match: (route: Route) => boolean
  badge?: number
}

function NavLinkRow({
  item,
  route,
  collapsed,
  onNavigate,
}: {
  item: NavDest
  route: Route
  collapsed: boolean
  onNavigate?: () => void
}) {
  const current = item.match(route)
  const Icon = item.icon
  const link = (
    <Link
      to={item.to}
      aria-current={current ? 'page' : undefined}
      aria-label={
        collapsed
          ? item.badge !== undefined && item.badge > 0
            ? `${item.label}，${item.badge} 条未读`
            : item.label
          : undefined
      }
      onClick={() => onNavigate?.()}
      className={cn(
        'relative mx-2 flex h-10 items-center gap-3 rounded-[10px] px-3 text-[14px] transition-colors duration-[120ms]',
        collapsed && 'mx-auto size-10 justify-center px-0',
        current
          ? 'bg-secondary font-medium text-foreground'
          : 'text-muted-foreground hover:bg-secondary/60',
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {!collapsed ? (
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      ) : null}
      {!collapsed && item.badge !== undefined && item.badge > 0 ? (
        <Badge variant="secondary" size="sm" className="font-mono">
          {item.badge}
        </Badge>
      ) : null}
      {collapsed && item.badge !== undefined && item.badge > 0 ? (
        <span
          className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary"
          aria-hidden="true"
        />
      ) : null}
    </Link>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger
        delay={200}
        closeOnClick
        render={
          <Link
            to={item.to}
            aria-current={current ? 'page' : undefined}
            aria-label={
              item.badge !== undefined && item.badge > 0
                ? `${item.label}，${item.badge} 条未读`
                : item.label
            }
            onClick={() => onNavigate?.()}
            className={cn(
              'relative mx-auto flex size-10 items-center justify-center rounded-[10px] transition-colors duration-[120ms]',
              current
                ? 'bg-secondary font-medium text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60',
            )}
          />
        }
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {item.badge !== undefined && item.badge > 0 ? (
          <span
            className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary"
            aria-hidden="true"
          />
        ) : null}
      </TooltipTrigger>
      <TooltipPopup side="right">{item.label}</TooltipPopup>
    </Tooltip>
  )
}

export function SidebarContent({
  collapsed,
  onNavigate,
  searchOpen,
  onSearchOpenChange,
  searchTriggerRef,
  showFooter = false,
  footer,
}: {
  collapsed: boolean
  onNavigate?: () => void
  searchOpen: boolean
  onSearchOpenChange: (open: boolean) => void
  searchTriggerRef: RefObject<HTMLButtonElement | null>
  showFooter?: boolean
  footer?: ReactNode
}) {
  const route = useRoute()
  const { unreadCount } = useNotifications()

  const navItems: NavDest[] = [
    {
      label: '首页',
      icon: Home,
      to: { name: 'home' },
      match: (r) => r.name === 'home',
    },
    {
      label: '剧集目录',
      icon: Tv,
      to: { name: 'catalog', query: DEFAULT_CATALOG_QUERY },
      match: (r) =>
        r.name === 'catalog' ||
        r.name === 'series-detail' ||
        r.name === 'watch',
    },
    {
      label: '我的收藏',
      icon: Bookmark,
      to: { name: 'favorites' },
      match: (r) => r.name === 'favorites',
    },
    {
      label: '观看历史',
      icon: History,
      to: { name: 'history' },
      match: (r) => r.name === 'history',
    },
    {
      label: '通知中心',
      icon: Bell,
      to: { name: 'notifications' },
      match: (r) => r.name === 'notifications',
      badge: unreadCount,
    },
  ]

  const logoBlock = collapsed ? (
    <div className="flex h-16 items-center justify-center px-2">
      <Tooltip>
        <TooltipTrigger
          delay={200}
          render={
            <Link
              to={{ name: 'home' }}
              aria-label="星际档案馆"
              onClick={() => onNavigate?.()}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'size-10 rounded-[10px]',
              )}
            />
          }
        >
          <Rocket className="size-5" />
        </TooltipTrigger>
        <TooltipPopup side="right">星际档案馆</TooltipPopup>
      </Tooltip>
    </div>
  ) : (
    <div className="flex h-16 items-center px-4">
      <Link
        to={{ name: 'home' }}
        onClick={() => onNavigate?.()}
        className="min-w-0 transition-opacity duration-[120ms] hover:opacity-90"
      >
        <strong className="block text-[15px] font-semibold text-foreground">
          星际档案馆
        </strong>
        <span className="block text-[11px] text-muted-foreground">
          Starfleet Archive
        </span>
      </Link>
    </div>
  )

  const searchTrigger = collapsed ? (
    <div className={cn('px-2 pb-2', searchOpen && 'hidden')}>
      <Tooltip>
        <TooltipTrigger
          delay={200}
          render={
            <button
              ref={searchTriggerRef}
              type="button"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'mx-auto size-10 rounded-[10px]',
              )}
              aria-label="搜索档案"
              aria-expanded={searchOpen}
              onClick={() => onSearchOpenChange(true)}
            />
          }
        >
          <Search className="size-4" />
        </TooltipTrigger>
        <TooltipPopup side="right">搜索档案</TooltipPopup>
      </Tooltip>
    </div>
  ) : (
    <button
      ref={searchTriggerRef}
      type="button"
      aria-label="搜索档案"
      aria-expanded={searchOpen}
      onClick={() => onSearchOpenChange(true)}
      className={cn(
        'mx-3 mb-2 flex h-10 items-center gap-2 rounded-[10px] border border-border bg-secondary/60 px-3 text-muted-foreground transition-colors duration-[120ms] hover:bg-secondary',
        searchOpen && 'hidden',
      )}
    >
      <Search className="size-4 shrink-0" aria-hidden="true" />
      <span className="text-sm">搜索</span>
      <Kbd className="ms-auto">/</Kbd>
    </button>
  )

  if (searchOpen) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        {logoBlock}
        <SidebarSearch
          onClose={() => onSearchOpenChange(false)}
          triggerRef={searchTriggerRef}
        />
        {showFooter ? footer : null}
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {logoBlock}
      {searchTrigger}
      <ScrollArea className="min-h-0 flex-1">
        <nav aria-label="主导航" className="py-1">
          {navItems.map((item) => (
            <NavLinkRow
              key={item.label}
              item={item}
              route={route}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        {!collapsed ? (
          <>
            <Accordion
              multiple
              defaultValue={['follows', 'recent']}
              className="mt-2 px-1"
            >
              <AccordionItem value="follows" className="border-none">
                <AccordionTrigger className="mx-2 rounded-[10px] px-3 py-2 text-[12px] text-muted-foreground hover:bg-secondary/60">
                  关注的系列
                </AccordionTrigger>
                <AccordionPanel className="pb-1">
                  <ul className="space-y-0.5">
                    {FOLLOWS.map((follow) => {
                      const series = getSeries(follow.slug)
                      if (!series) return null
                      const index = SERIES.findIndex(
                        (s) => s.slug === follow.slug,
                      )
                      const color = assetColorForIndex(index >= 0 ? index : 0)
                      return (
                        <li key={follow.slug}>
                          <Link
                            to={{
                              name: 'series-detail',
                              slug: follow.slug,
                              season: 1,
                            }}
                            onClick={() => onNavigate?.()}
                            className="mx-2 flex h-9 items-center gap-2.5 rounded-[10px] px-3 text-[13px] text-muted-foreground transition-colors duration-[120ms] hover:bg-secondary/60 hover:text-foreground"
                          >
                            <span
                              className="size-3 shrink-0 rounded-[3px]"
                              style={{ backgroundColor: color }}
                              aria-hidden="true"
                            />
                            <span className="truncate">
                              {series.title.zhHans}
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="recent" className="border-none">
                <AccordionTrigger className="mx-2 rounded-[10px] px-3 py-2 text-[12px] text-muted-foreground hover:bg-secondary/60">
                  最近观看
                </AccordionTrigger>
                <AccordionPanel className="pb-1">
                  <ul className="space-y-0.5">
                    {PROGRESS.slice(0, 4).map((item) => {
                      const series = getSeries(item.slug)
                      if (!series) return null
                      const episode = getEpisode(item.slug, item.episodeCode)
                      const pct = progressPercent(
                        item.positionSec,
                        item.durationSec,
                      )
                      return (
                        <li key={`${item.slug}-${item.episodeCode}`}>
                          <Link
                            to={{
                              name: 'watch',
                              seriesSlug: item.slug,
                              episodeCode: item.episodeCode,
                            }}
                            onClick={() => onNavigate?.()}
                            className="mx-2 flex flex-col gap-1 rounded-[10px] px-3 py-2 text-muted-foreground transition-colors duration-[120ms] hover:bg-secondary/60 hover:text-foreground"
                          >
                            <span className="truncate text-[13px]">
                              {series.title.zhHans}
                            </span>
                            <span className="font-mono text-xs">
                              {item.episodeCode}
                              {episode ? ` · ${episode.title.zhHans}` : ''}
                            </span>
                            <Progress value={pct} className="gap-0">
                              <ProgressTrack className="h-1">
                                <ProgressIndicator />
                              </ProgressTrack>
                            </Progress>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>

            <div className="mx-3 my-2 rounded-[10px] bg-secondary/60 p-3 text-[12px] text-muted-foreground">
              原型演示：所有内容与操作均为本地模拟数据。
            </div>
          </>
        ) : null}
      </ScrollArea>
      {showFooter ? footer : null}
    </div>
  )
}

export function DesktopSidebar({
  collapsed,
  onCollapsedChange,
  searchOpen,
  onSearchOpenChange,
  searchTriggerRef,
}: {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  searchOpen: boolean
  onSearchOpenChange: (open: boolean) => void
  searchTriggerRef: RefObject<HTMLButtonElement | null>
}) {
  const { signedIn } = useAuth()
  const forceExpandedVisual = collapsed && searchOpen
  const visualCollapsed = forceExpandedVisual ? false : collapsed

  const footer = (
    <div className="mt-auto border-t border-border p-2">
      {signedIn ? (
        visualCollapsed ? (
          <div className="flex justify-center">
            <AccountMenuIcon />
          </div>
        ) : (
          <AccountMenuFull />
        )
      ) : (
        <Button
          render={<Link to={{ name: 'login' }} />}
          variant="ghost"
          className={cn(
            'w-full justify-center rounded-[10px]',
            !visualCollapsed && 'justify-start',
          )}
        >
          登录
        </Button>
      )}
      <div
        className={cn(
          'mt-1 flex',
          visualCollapsed ? 'justify-center' : 'justify-end',
        )}
      >
        <Tooltip>
          <TooltipTrigger
            delay={200}
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={collapsed ? '展开侧栏' : '收起侧栏'}
                aria-pressed={collapsed}
                onClick={() => onCollapsedChange(!collapsed)}
              />
            }
          >
            {collapsed ? (
              <ChevronsRight className="size-4" />
            ) : (
              <ChevronsLeft className="size-4" />
            )}
          </TooltipTrigger>
          <TooltipPopup side="right">
            {collapsed ? '展开侧栏' : '收起侧栏'}
          </TooltipPopup>
        </Tooltip>
      </div>
    </div>
  )

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-background transition-[width] duration-[160ms]',
        forceExpandedVisual
          ? 'z-50 w-[240px] shadow-lg min-[1440px]:w-64'
          : collapsed
            ? 'w-[72px]'
            : 'w-[240px] min-[1440px]:w-64',
      )}
    >
      <SidebarContent
        collapsed={visualCollapsed}
        searchOpen={searchOpen}
        onSearchOpenChange={onSearchOpenChange}
        searchTriggerRef={searchTriggerRef}
        showFooter
        footer={footer}
      />
    </aside>
  )
}
