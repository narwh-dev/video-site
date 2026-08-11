import {
  type AdminSection,
  type CatalogDecade,
  type CatalogQuery,
  type CatalogSort,
  type CatalogType,
  type Route,
  type SettingsSection,
  ADMIN_SECTIONS,
  CATALOG_SORTS,
  CATALOG_TYPES,
  DEFAULT_CATALOG_QUERY,
  SETTINGS_SECTIONS,
  VALID_DECADES,
} from './routes.ts'

export function parseSeasonParam(value: string | null): number {
  if (value === null || value === '') return 1
  const n = Number.parseInt(value, 10)
  if (!Number.isFinite(n) || n < 1) return 1
  return n
}

function isCatalogType(v: string): v is CatalogType {
  return (CATALOG_TYPES as readonly string[]).includes(v)
}

function isCatalogSort(v: string): v is CatalogSort {
  return (CATALOG_SORTS as readonly string[]).includes(v)
}

function isSettingsSection(v: string): v is SettingsSection {
  return (SETTINGS_SECTIONS as readonly string[]).includes(v)
}

function isAdminSection(v: string): v is AdminSection {
  return (ADMIN_SECTIONS as readonly string[]).includes(v)
}

function isValidDecade(v: string): v is CatalogDecade {
  return (
    /^\d{4}s$/.test(v) && (VALID_DECADES as readonly string[]).includes(v)
  )
}

export function parseCatalogQuery(searchParams: URLSearchParams): CatalogQuery {
  const q = searchParams.get('q') ?? ''
  const typeRaw = searchParams.get('type')
  const type: CatalogType =
    typeRaw !== null && isCatalogType(typeRaw) ? typeRaw : 'all'
  const decadeRaw = searchParams.get('decade')
  const decade: CatalogDecade =
    decadeRaw !== null && isValidDecade(decadeRaw) ? decadeRaw : 'all'
  const sortRaw = searchParams.get('sort')
  const sort: CatalogSort =
    sortRaw !== null && isCatalogSort(sortRaw) ? sortRaw : 'updated'
  return { q, type, decade, sort }
}

export function serializeCatalogQuery(query: CatalogQuery): string {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.type !== 'all') params.set('type', query.type)
  if (query.decade !== 'all') params.set('decade', query.decade)
  if (query.sort !== 'updated') params.set('sort', query.sort)
  const s = params.toString()
  return s ? `?${s}` : ''
}

export function parseLocation(pathname: string, search: string): Route {
  const path = pathname.replace(/\/+$/, '') || '/'
  const searchParams = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search,
  )

  if (path === '/') return { name: 'landing' }
  if (path === '/login') return { name: 'login' }
  if (path === '/register') return { name: 'register' }
  if (path === '/forgot-password') return { name: 'forgot-password' }
  if (path === '/auth/complete') return { name: 'auth-complete' }
  if (path === '/home') return { name: 'home' }
  if (path === '/series') {
    return { name: 'catalog', query: parseCatalogQuery(searchParams) }
  }
  if (path === '/favorites') return { name: 'favorites' }
  if (path === '/history') return { name: 'history' }
  if (path === '/notifications') return { name: 'notifications' }

  const seriesMatch = path.match(/^\/series\/([^/]+)$/)
  if (seriesMatch && seriesMatch[1]) {
    const slug = seriesMatch[1]
    const season = parseSeasonParam(searchParams.get('season'))
    return { name: 'series-detail', slug, season }
  }

  const watchMatch = path.match(/^\/watch\/([^/]+)\/([^/]+)$/)
  if (watchMatch && watchMatch[1] && watchMatch[2]) {
    return {
      name: 'watch',
      seriesSlug: watchMatch[1],
      episodeCode: watchMatch[2],
    }
  }

  if (path === '/settings') {
    return { name: 'settings', section: 'profile' }
  }

  const settingsMatch = path.match(/^\/settings\/([^/]+)$/)
  if (settingsMatch && settingsMatch[1] && isSettingsSection(settingsMatch[1])) {
    return { name: 'settings', section: settingsMatch[1] }
  }

  if (path === '/admin') {
    return { name: 'admin', section: 'dashboard' }
  }

  const adminMatch = path.match(/^\/admin\/([^/]+)$/)
  if (adminMatch && adminMatch[1] && isAdminSection(adminMatch[1])) {
    return { name: 'admin', section: adminMatch[1] }
  }

  return { name: 'not-found', path: pathname }
}

export interface NormalizeResult {
  route: Route
  replace: boolean
}

export function normalizeLocation(
  pathname: string,
  search: string,
): NormalizeResult {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/settings') {
    return {
      route: { name: 'settings', section: 'profile' },
      replace: true,
    }
  }
  return {
    route: parseLocation(pathname, search),
    replace: false,
  }
}

export function serializeRoute(route: Route): string {
  switch (route.name) {
    case 'landing':
      return '/'
    case 'login':
      return '/login'
    case 'register':
      return '/register'
    case 'forgot-password':
      return '/forgot-password'
    case 'auth-complete':
      return '/auth/complete'
    case 'home':
      return '/home'
    case 'catalog':
      return `/series${serializeCatalogQuery(route.query)}`
    case 'series-detail': {
      const base = `/series/${route.slug}`
      if (route.season === 1) return base
      return `${base}?season=${route.season}`
    }
    case 'watch':
      return `/watch/${route.seriesSlug}/${route.episodeCode}`
    case 'favorites':
      return '/favorites'
    case 'history':
      return '/history'
    case 'notifications':
      return '/notifications'
    case 'settings':
      return `/settings/${route.section}`
    case 'admin':
      return route.section === 'dashboard'
        ? '/admin'
        : `/admin/${route.section}`
    case 'not-found':
      return route.path
    default: {
      const _exhaustive: never = route
      return _exhaustive
    }
  }
}