import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
  type MouseEvent,
  type AnchorHTMLAttributes,
} from 'react'
import { getBrowserRouter, type NavigateOptions } from './router.ts'
import type { Route } from './routes.ts'
import { serializeRoute } from './parse.ts'

const RouterContext = createContext<ReturnType<typeof getBrowserRouter> | null>(
  null,
)

export function RouterProvider({ children }: { children: ReactNode }) {
  const router = useMemo(() => getBrowserRouter(), [])
  return (
    <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
  )
}

function useRouterStore() {
  const router = useContext(RouterContext)
  if (!router) {
    throw new Error('useRouter must be used within RouterProvider')
  }
  return router
}

export function useRoute(): Route {
  const router = useRouterStore()
  return useSyncExternalStore(router.subscribe, router.getSnapshot, router.getSnapshot)
}

export function useNavigate() {
  const router = useRouterStore()
  return useCallback(
    (to: Route | string, options?: NavigateOptions) => {
      router.navigate(to, options)
    },
    [router],
  )
}

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string | Route
  replace?: boolean
  children?: ReactNode
  className?: string
}

export function Link({
  to,
  replace = false,
  children,
  className,
  onClick,
  ...rest
}: LinkProps) {
  const navigate = useNavigate()
  const href = typeof to === 'string' ? to : serializeRoute(to)

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented) return
    if (e.button !== 0) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (rest.target && rest.target !== '_self') return
    e.preventDefault()
    navigate(to, { replace })
  }

  return (
    <a href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}