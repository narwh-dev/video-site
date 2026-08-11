import { parseLocation, serializeRoute, normalizeLocation } from './parse.ts'
import type { Route } from './routes.ts'

export type NavigateOptions = {
  replace?: boolean
}

type Listener = () => void

function getCurrentPath(): { pathname: string; search: string } {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
  }
}

function createBrowserRouter() {
  let current: Route = (() => {
    const { pathname, search } = getCurrentPath()
    const { route, replace } = normalizeLocation(pathname, search)
    if (replace) {
      const url = serializeRoute(route)
      window.history.replaceState(null, '', url)
    }
    return route
  })()

  const listeners = new Set<Listener>()

  function notify() {
    for (const listener of listeners) {
      listener()
    }
  }

  function setRoute(route: Route, options: NavigateOptions = {}) {
    const url = serializeRoute(route)
    const replace = options.replace ?? false
    if (replace) {
      window.history.replaceState(null, '', url)
    } else {
      window.history.pushState(null, '', url)
      window.scrollTo(0, 0)
    }
    current = route
    notify()
  }

  function navigate(
    to: Route | string,
    options: NavigateOptions = {},
  ): void {
    if (typeof to === 'string') {
      const url = new URL(to, window.location.origin)
      const { route, replace: shouldReplace } = normalizeLocation(
        url.pathname,
        url.search,
      )
      setRoute(route, {
        replace: options.replace ?? shouldReplace,
      })
    } else {
      setRoute(to, options)
    }
  }

  function getSnapshot(): Route {
    return current
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  function handlePopState() {
    const { pathname, search } = getCurrentPath()
    const { route } = normalizeLocation(pathname, search)
    current = route
    notify()
  }

  window.addEventListener('popstate', handlePopState)

  return {
    getSnapshot,
    subscribe,
    navigate,
    get current() {
      return current
    },
  }
}

export type BrowserRouter = ReturnType<typeof createBrowserRouter>

let singleton: BrowserRouter | null = null

export function getBrowserRouter(): BrowserRouter {
  if (!singleton) {
    singleton = createBrowserRouter()
  }
  return singleton
}

export { createBrowserRouter }