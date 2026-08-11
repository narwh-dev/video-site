export type CatalogType = 'all' | 'series' | 'movie'
export type CatalogDecade = 'all' | `${number}s`
export type CatalogSort = 'updated' | 'year' | 'title'

export interface CatalogQuery {
  q: string
  type: CatalogType
  decade: CatalogDecade
  sort: CatalogSort
}

export type SettingsSection =
  | 'profile'
  | 'preferences'
  | 'notifications'
  | 'security'

export type AdminSection =
  | 'dashboard'
  | 'content'
  | 'uploads'
  | 'moderation'
  | 'users'
  | 'invites'
  | 'statistics'

export type Route =
  | { name: 'landing' }
  | { name: 'login' }
  | { name: 'register' }
  | { name: 'forgot-password' }
  | { name: 'auth-complete' }
  | { name: 'home' }
  | { name: 'catalog'; query: CatalogQuery }
  | { name: 'series-detail'; slug: string; season: number }
  | { name: 'watch'; seriesSlug: string; episodeCode: string }
  | { name: 'favorites' }
  | { name: 'history' }
  | { name: 'notifications' }
  | { name: 'settings'; section: SettingsSection }
  | { name: 'admin'; section: AdminSection }
  | { name: 'not-found'; path: string }

export const DEFAULT_CATALOG_QUERY: CatalogQuery = {
  q: '',
  type: 'all',
  decade: 'all',
  sort: 'updated',
}

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  'profile',
  'preferences',
  'notifications',
  'security',
] as const

export const ADMIN_SECTIONS: readonly AdminSection[] = [
  'dashboard',
  'content',
  'uploads',
  'moderation',
  'users',
  'invites',
  'statistics',
] as const

export const CATALOG_TYPES: readonly CatalogType[] = [
  'all',
  'series',
  'movie',
] as const

export const CATALOG_SORTS: readonly CatalogSort[] = [
  'updated',
  'year',
  'title',
] as const

export const VALID_DECADES = [
  '1960s',
  '1970s',
  '1980s',
  '1990s',
  '2000s',
  '2010s',
  '2020s',
] as const

export type ValidDecade = (typeof VALID_DECADES)[number]