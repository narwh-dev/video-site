import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Link } from '@/lib/router/react.tsx'
import { DEFAULT_CATALOG_QUERY, type Route } from '@/lib/router/routes.ts'
import { getEpisode, getSeries } from '@/data/index.ts'
import { Fragment } from 'react'

type Crumb = {
  label: string
  to?: Route | string
  mono?: boolean
}

const SETTINGS_SECTION_LABELS: Record<
  'profile' | 'preferences' | 'notifications' | 'security',
  string
> = {
  profile: '个人资料',
  preferences: '偏好设置',
  notifications: '通知设置',
  security: '安全',
}

function crumbsForRoute(route: Route): Crumb[] {
  switch (route.name) {
    case 'home':
      return [{ label: '首页' }]
    case 'catalog':
      return [{ label: '剧集目录' }]
    case 'series-detail': {
      const series = getSeries(route.slug)
      return [
        {
          label: '剧集目录',
          to: { name: 'catalog', query: DEFAULT_CATALOG_QUERY },
        },
        { label: series?.title.zhHans ?? route.slug },
      ]
    }
    case 'watch': {
      const series = getSeries(route.seriesSlug)
      const episode = getEpisode(route.seriesSlug, route.episodeCode)
      const season =
        episode?.season !== null && episode?.season !== undefined
          ? episode.season
          : 1
      return [
        {
          label: series?.title.zhHans ?? route.seriesSlug,
          to: {
            name: 'series-detail',
            slug: route.seriesSlug,
            season,
          },
        },
        {
          label: `${route.episodeCode} ${episode?.title.zhHans ?? ''}`.trim(),
          mono: true,
        },
      ]
    }
    case 'favorites':
      return [{ label: '收藏' }]
    case 'history':
      return [{ label: '历史' }]
    case 'notifications':
      return [{ label: '通知' }]
    case 'settings':
      return [
        {
          label: '设置',
          to: { name: 'settings', section: 'profile' },
        },
        { label: SETTINGS_SECTION_LABELS[route.section] },
      ]
    default:
      return []
  }
}

export function Breadcrumbs({ route }: { route: Route }) {
  const crumbs = crumbsForRoute(route)
  if (crumbs.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs sm:gap-1.5">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {isLast || !crumb.to ? (
                  <BreadcrumbPage
                    className={
                      crumb.mono
                        ? 'font-mono text-xs text-foreground'
                        : 'text-xs text-foreground'
                    }
                  >
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="text-xs"
                    render={<Link to={crumb.to} />}
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
