import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { AccountMenuFull } from '@/components/shell/account-menu.tsx'
import { DesktopSidebar, SidebarContent } from '@/components/shell/sidebar.tsx'
import { MobileNav } from '@/components/shell/mobile-nav.tsx'
import { NotificationPreview } from '@/components/shell/notification-preview.tsx'
import { TopToolbar } from '@/components/shell/top-toolbar.tsx'
import { Button } from '@/components/ui/button'
import { Sheet, SheetPopup, SheetTitle } from '@/components/ui/sheet'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAuth } from '@/lib/auth.tsx'
import { useIsDesktop } from '@/lib/breakpoints.ts'
import { Link } from '@/lib/router/react.tsx'
import type { Route } from '@/lib/router/routes.ts'
import { cn } from '@/lib/utils'

const COLLAPSE_KEY = 'starfleet-sidebar-collapsed'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}

function writeCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
  } catch {
  }
}

function MobileSheetFooter({ onNavigate }: { onNavigate: () => void }) {
  const { signedIn } = useAuth()
  if (!signedIn) {
    return (
      <Button
        render={<Link to={{ name: 'login' }} onClick={onNavigate} />}
        variant="ghost"
        className="w-full justify-start rounded-[10px]"
      >
        登录
      </Button>
    )
  }
  return <AccountMenuFull />
}

export function AppShell({
  route,
  children,
}: {
  route: Route
  children: ReactNode
}) {
  const isDesktop = useIsDesktop()
  const [collapsed, setCollapsed] = useState(() => readCollapsed())
  const [searchOpen, setSearchOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const searchTriggerRef = useRef<HTMLButtonElement | null>(null)
  const mobileSearchTriggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    writeCollapsed(collapsed)
  }, [collapsed])

  useEffect(() => {
    if (!isDesktop) {
      setSearchOpen(false)
    }
  }, [isDesktop])

  const mainOffsetClass = collapsed
    ? 'ml-[72px]'
    : 'ml-[240px] min-[1440px]:ml-64'

  const overlayLeftClass = collapsed
    ? 'left-[72px]'
    : 'left-[240px] min-[1440px]:left-64'

  return (
    <TooltipProvider delay={200}>
      <div className="min-h-dvh bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-[10px] focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          跳到主要内容
        </a>

        {isDesktop ? (
          <DesktopSidebar
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            searchOpen={searchOpen}
            onSearchOpenChange={setSearchOpen}
            searchTriggerRef={searchTriggerRef}
          />
        ) : null}

        {isDesktop && searchOpen ? (
          <div
            role="presentation"
            aria-hidden="true"
            className={cn(
              'fixed inset-y-0 right-0 z-30 bg-black/25 transition-opacity duration-[120ms]',
              overlayLeftClass,
            )}
            onClick={() => setSearchOpen(false)}
          />
        ) : null}

        <div
          className={cn(
            'min-h-dvh transition-[margin] duration-[160ms]',
            isDesktop && mainOffsetClass,
          )}
        >
          {isDesktop ? <TopToolbar route={route} /> : null}

          {!isDesktop ? (
            <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-background px-3">
              <Sheet
              open={sheetOpen}
              onOpenChange={(open) => {
                setSheetOpen(open)
                if (!open) setSearchOpen(false)
              }}
            >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="打开导航菜单"
                  aria-expanded={sheetOpen}
                  onClick={() => setSheetOpen(true)}
                >
                  <Menu className="size-5" />
                </Button>
                <SheetPopup
                  side="left"
                  showCloseButton={false}
                  className="w-[276px] p-0"
                >
                  <SheetTitle className="sr-only">导航菜单</SheetTitle>
                  <div className="flex h-dvh min-h-0 flex-col">
                    <SidebarContent
                      collapsed={false}
                      searchOpen={searchOpen}
                      onSearchOpenChange={setSearchOpen}
                      searchTriggerRef={mobileSearchTriggerRef}
                      onNavigate={() => setSheetOpen(false)}
                      showFooter
                      footer={
                        <div className="mt-auto border-t border-border p-2">
                          <MobileSheetFooter
                            onNavigate={() => setSheetOpen(false)}
                          />
                        </div>
                      }
                    />
                  </div>
                </SheetPopup>
              </Sheet>

              <Link
                to={{ name: 'home' }}
                className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-foreground transition-opacity duration-[120ms] hover:opacity-90"
              >
                星际档案馆
              </Link>

              <div className="ms-auto">
                <NotificationPreview />
              </div>
            </header>
          ) : null}

          <main
            id="main-content"
            className="min-h-dvh outline-none max-[767px]:pb-16"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>

        <MobileNav />
      </div>
    </TooltipProvider>
  )
}
