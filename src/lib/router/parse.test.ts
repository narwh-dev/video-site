import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  parseLocation,
  serializeRoute,
  parseSeasonParam,
  parseCatalogQuery,
  serializeCatalogQuery,
  normalizeLocation,
} from './parse.ts'
import type { Route } from './routes.ts'
import { DEFAULT_CATALOG_QUERY } from './routes.ts'

describe('parseLocation', () => {
  it('parses landing', () => {
    assert.deepEqual(parseLocation('/', ''), { name: 'landing' })
  })

  it('parses login', () => {
    assert.deepEqual(parseLocation('/login', ''), { name: 'login' })
  })

  it('parses register', () => {
    assert.deepEqual(parseLocation('/register', ''), { name: 'register' })
  })

  it('parses forgot-password', () => {
    assert.deepEqual(parseLocation('/forgot-password', ''), {
      name: 'forgot-password',
    })
  })

  it('parses auth-complete', () => {
    assert.deepEqual(parseLocation('/auth/complete', ''), {
      name: 'auth-complete',
    })
  })

  it('parses home', () => {
    assert.deepEqual(parseLocation('/home', ''), { name: 'home' })
  })

  it('parses catalog with defaults', () => {
    assert.deepEqual(parseLocation('/series', ''), {
      name: 'catalog',
      query: DEFAULT_CATALOG_QUERY,
    })
  })

  it('parses series-detail', () => {
    assert.deepEqual(parseLocation('/series/tos', ''), {
      name: 'series-detail',
      slug: 'tos',
      season: 1,
    })
  })

  it('parses series-detail with season', () => {
    assert.deepEqual(parseLocation('/series/tos', '?season=2'), {
      name: 'series-detail',
      slug: 'tos',
      season: 2,
    })
  })

  it('parses watch', () => {
    assert.deepEqual(parseLocation('/watch/tos/S01E01', ''), {
      name: 'watch',
      seriesSlug: 'tos',
      episodeCode: 'S01E01',
    })
  })

  it('parses favorites', () => {
    assert.deepEqual(parseLocation('/favorites', ''), { name: 'favorites' })
  })

  it('parses history', () => {
    assert.deepEqual(parseLocation('/history', ''), { name: 'history' })
  })

  it('parses notifications', () => {
    assert.deepEqual(parseLocation('/notifications', ''), {
      name: 'notifications',
    })
  })

  it('parses settings sections', () => {
    assert.deepEqual(parseLocation('/settings/profile', ''), {
      name: 'settings',
      section: 'profile',
    })
    assert.deepEqual(parseLocation('/settings/preferences', ''), {
      name: 'settings',
      section: 'preferences',
    })
    assert.deepEqual(parseLocation('/settings/notifications', ''), {
      name: 'settings',
      section: 'notifications',
    })
    assert.deepEqual(parseLocation('/settings/security', ''), {
      name: 'settings',
      section: 'security',
    })
  })

  it('parses admin', () => {
    assert.deepEqual(parseLocation('/admin', ''), {
      name: 'admin',
      section: 'dashboard',
    })
    assert.deepEqual(parseLocation('/admin/content', ''), {
      name: 'admin',
      section: 'content',
    })
    assert.deepEqual(parseLocation('/admin/uploads', ''), {
      name: 'admin',
      section: 'uploads',
    })
    assert.deepEqual(parseLocation('/admin/moderation', ''), {
      name: 'admin',
      section: 'moderation',
    })
    assert.deepEqual(parseLocation('/admin/users', ''), {
      name: 'admin',
      section: 'users',
    })
    assert.deepEqual(parseLocation('/admin/invites', ''), {
      name: 'admin',
      section: 'invites',
    })
    assert.deepEqual(parseLocation('/admin/statistics', ''), {
      name: 'admin',
      section: 'statistics',
    })
  })

  it('unknown → not-found', () => {
    assert.deepEqual(parseLocation('/unknown', ''), {
      name: 'not-found',
      path: '/unknown',
    })
  })

  it('/settings → profile normalization with replace', () => {
    const result = normalizeLocation('/settings', '')
    assert.deepEqual(result.route, {
      name: 'settings',
      section: 'profile',
    })
    assert.equal(result.replace, true)
  })
})

describe('parseSeasonParam', () => {
  it('absent → 1', () => {
    assert.equal(parseSeasonParam(null), 1)
  })
  it('"0" → 1', () => {
    assert.equal(parseSeasonParam('0'), 1)
  })
  it('"-3" → 1', () => {
    assert.equal(parseSeasonParam('-3'), 1)
  })
  it('"2" → 2', () => {
    assert.equal(parseSeasonParam('2'), 2)
  })
  it('"abc" → 1', () => {
    assert.equal(parseSeasonParam('abc'), 1)
  })
})

describe('catalog query', () => {
  it('validates and falls back invalid', () => {
    const params = new URLSearchParams(
      'q=trek&type=series&decade=1990s&sort=year',
    )
    assert.deepEqual(parseCatalogQuery(params), {
      q: 'trek',
      type: 'series',
      decade: '1990s',
      sort: 'year',
    })
  })

  it('invalid type/decade/sort fall back', () => {
    const params = new URLSearchParams(
      'type=foo&decade=1950s&sort=bar&decade=xyz',
    )
    assert.deepEqual(parseCatalogQuery(params), {
      q: '',
      type: 'all',
      decade: 'all',
      sort: 'updated',
    })
  })

  it('decade must match /^\\d{4}s$/ and 1960s..2020s', () => {
    assert.equal(
      parseCatalogQuery(new URLSearchParams('decade=1960s')).decade,
      '1960s',
    )
    assert.equal(
      parseCatalogQuery(new URLSearchParams('decade=2020s')).decade,
      '2020s',
    )
    assert.equal(
      parseCatalogQuery(new URLSearchParams('decade=1950s')).decade,
      'all',
    )
    assert.equal(
      parseCatalogQuery(new URLSearchParams('decade=2030s')).decade,
      'all',
    )
    assert.equal(
      parseCatalogQuery(new URLSearchParams('decade=90s')).decade,
      'all',
    )
  })

  it('defaults omitted on serialize', () => {
    assert.equal(serializeCatalogQuery(DEFAULT_CATALOG_QUERY), '')
    assert.equal(
      serializeCatalogQuery({
        q: 'x',
        type: 'all',
        decade: 'all',
        sort: 'updated',
      }),
      '?q=x',
    )
    assert.equal(
      serializeCatalogQuery({
        q: '',
        type: 'movie',
        decade: 'all',
        sort: 'updated',
      }),
      '?type=movie',
    )
    assert.equal(
      serializeCatalogQuery({
        q: '',
        type: 'all',
        decade: '2000s',
        sort: 'title',
      }),
      '?decade=2000s&sort=title',
    )
  })
})

describe('round-trip serialize/parse', () => {
  const cases: Route[] = [
    { name: 'landing' },
    { name: 'login' },
    { name: 'register' },
    { name: 'forgot-password' },
    { name: 'auth-complete' },
    { name: 'home' },
    { name: 'catalog', query: DEFAULT_CATALOG_QUERY },
    {
      name: 'catalog',
      query: { q: 'kirk', type: 'series', decade: '1960s', sort: 'year' },
    },
    { name: 'series-detail', slug: 'tos', season: 1 },
    { name: 'series-detail', slug: 'tng', season: 3 },
    { name: 'watch', seriesSlug: 'tos', episodeCode: 'S01E01' },
    { name: 'favorites' },
    { name: 'history' },
    { name: 'notifications' },
    { name: 'settings', section: 'profile' },
    { name: 'settings', section: 'security' },
    { name: 'admin', section: 'dashboard' },
    { name: 'admin', section: 'statistics' },
  ]

  for (const route of cases) {
    it(`round-trips ${route.name}`, () => {
      const url = serializeRoute(route)
      const u = new URL(url, 'http://localhost')
      const parsed = parseLocation(u.pathname, u.search)
      assert.deepEqual(parsed, route)
    })
  }
})