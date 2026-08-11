import { ThemeProvider } from '@/lib/theme.tsx'
import { RouterProvider, useRoute, Link } from '@/lib/router/react.tsx'
import { serializeRoute } from '@/lib/router/parse.ts'
import type { Route } from '@/lib/router/routes.ts'
import { DEFAULT_CATALOG_QUERY } from '@/lib/router/routes.ts'

const ROUTE_LABELS: Record<Route['name'], string> = {
  landing: '落地页',
  login: '登录',
  register: '注册',
  'forgot-password': '忘记密码',
  'auth-complete': '认证完成',
  home: '首页',
  catalog: '目录',
  'series-detail': '剧集详情',
  watch: '播放',
  favorites: '收藏',
  history: '历史',
  notifications: '通知',
  settings: '设置',
  admin: '管理',
  'not-found': '未找到',
}

const NAV_LINKS: { to: Route | string; label: string }[] = [
  { to: { name: 'landing' }, label: '落地页' },
  { to: { name: 'login' }, label: '登录' },
  { to: { name: 'register' }, label: '注册' },
  { to: { name: 'forgot-password' }, label: '忘记密码' },
  { to: { name: 'auth-complete' }, label: '认证完成' },
  { to: { name: 'home' }, label: '首页' },
  { to: { name: 'catalog', query: DEFAULT_CATALOG_QUERY }, label: '目录' },
  {
    to: { name: 'series-detail', slug: 'tos', season: 1 },
    label: '剧集详情',
  },
  {
    to: { name: 'watch', seriesSlug: 'tos', episodeCode: 'S01E01' },
    label: '播放',
  },
  { to: { name: 'favorites' }, label: '收藏' },
  { to: { name: 'history' }, label: '历史' },
  { to: { name: 'notifications' }, label: '通知' },
  { to: { name: 'settings', section: 'profile' }, label: '设置·资料' },
  { to: { name: 'settings', section: 'preferences' }, label: '设置·偏好' },
  {
    to: { name: 'settings', section: 'notifications' },
    label: '设置·通知',
  },
  { to: { name: 'settings', section: 'security' }, label: '设置·安全' },
  { to: { name: 'admin', section: 'dashboard' }, label: '管理·仪表盘' },
  { to: { name: 'admin', section: 'content' }, label: '管理·内容' },
  { to: { name: 'admin', section: 'uploads' }, label: '管理·上传' },
  { to: { name: 'admin', section: 'moderation' }, label: '管理·审核' },
  { to: { name: 'admin', section: 'users' }, label: '管理·用户' },
  { to: { name: 'admin', section: 'invites' }, label: '管理·邀请' },
  { to: { name: 'admin', section: 'statistics' }, label: '管理·统计' },
  { to: '/unknown-path', label: '404' },
]

function PlaceholderPage() {
  const route = useRoute()
  const label = ROUTE_LABELS[route.name]
  const serialized = serializeRoute(route)

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center gap-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">{label}</h1>
        <p className="text-muted-foreground font-mono text-sm">
          {route.name}
        </p>
        <pre className="text-xs bg-card p-3 rounded-md overflow-auto max-w-lg text-left">
          {JSON.stringify(route, null, 2)}
        </pre>
        <p className="text-muted-foreground text-sm">路径: {serialized}</p>
      </div>
      <nav className="flex flex-wrap gap-2 justify-center max-w-2xl">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className="px-3 py-1.5 text-sm rounded-md border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <PlaceholderPage />
      </RouterProvider>
    </ThemeProvider>
  )
}