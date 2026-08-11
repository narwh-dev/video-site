import { AppShell } from '@/components/shell/app-shell.tsx'
import { PlaceholderPage } from '@/components/shell/placeholder-page.tsx'
import { AuthProvider } from '@/lib/auth.tsx'
import { NotificationsProvider } from '@/lib/notifications.tsx'
import { Link, RouterProvider, useRoute } from '@/lib/router/react.tsx'
import type { Route, SettingsSection } from '@/lib/router/routes.ts'
import { ThemeProvider } from '@/lib/theme.tsx'
import { NotFoundPage } from '@/routes/not-found.tsx'

const SETTINGS_TITLES: Record<SettingsSection, string> = {
  profile: '个人资料',
  preferences: '偏好设置',
  notifications: '通知设置',
  security: '安全',
}

function memberPlaceholder(route: Route): {
  title: string
  description: string
} {
  switch (route.name) {
    case 'home':
      return {
        title: '首页',
        description: '继续观看、最近更新与推荐系列将在此呈现。',
      }
    case 'catalog':
      return {
        title: '剧集目录',
        description: '按类型、年代与排序浏览星图中的全部档案。',
      }
    case 'series-detail':
      return {
        title: '系列详情',
        description: '系列横幅、元数据、分季与剧集列表将在此呈现。',
      }
    case 'watch':
      return {
        title: '播放',
        description: '播放器、弹幕与剧集选择将在此呈现。',
      }
    case 'favorites':
      return {
        title: '我的收藏',
        description: '已关注系列的检索、排序与视图模式将在此呈现。',
      }
    case 'history':
      return {
        title: '观看历史',
        description: '观看记录的检索、排序与清理操作将在此呈现。',
      }
    case 'notifications':
      return {
        title: '通知中心',
        description: '全部与未读通知筛选、已读管理将在此呈现。',
      }
    case 'settings':
      return {
        title: `设置·${SETTINGS_TITLES[route.section]}`,
        description: '账户与偏好设置将在此呈现。',
      }
    default:
      return {
        title: '页面',
        description: '内容将在后续阶段交付。',
      }
  }
}

function PublicPlaceholder({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <PlaceholderPage title={title} description={description} />
      <div className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-sm text-muted-foreground">第 3 阶段交付</p>
        <Link
          to={{ name: 'home' }}
          className="mt-3 inline-flex text-sm font-medium text-primary transition-colors duration-[120ms] hover:underline"
        >
          进入首页
        </Link>
      </div>
    </div>
  )
}

function AdminPlaceholder() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <PlaceholderPage
        title="管理控制台"
        description="管理控制台将在第 7 阶段交付完整实现。"
      />
      <div className="mx-auto max-w-3xl px-6 pb-16">
        <Link
          to={{ name: 'home' }}
          className="inline-flex text-sm font-medium text-primary transition-colors duration-[120ms] hover:underline"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}

function AppRoutes() {
  const route = useRoute()

  switch (route.name) {
    case 'home':
    case 'catalog':
    case 'series-detail':
    case 'watch':
    case 'favorites':
    case 'history':
    case 'notifications':
    case 'settings': {
      const page = memberPlaceholder(route)
      return (
        <AppShell route={route}>
          <PlaceholderPage title={page.title} description={page.description} />
        </AppShell>
      )
    }
    case 'admin':
      return <AdminPlaceholder />
    case 'landing':
      return (
        <PublicPlaceholder
          title="公开落地页"
          description="内容主导的公开落地页将在第 3 阶段交付。"
        />
      )
    case 'login':
      return (
        <PublicPlaceholder
          title="登录"
          description="密码、通行密钥与第三方登录流程将在第 3 阶段交付。"
        />
      )
    case 'register':
      return (
        <PublicPlaceholder
          title="注册"
          description="邀请码注册与验证邮件完成状态将在第 3 阶段交付。"
        />
      )
    case 'forgot-password':
      return (
        <PublicPlaceholder
          title="找回密码"
          description="中性邮件已发送状态将在第 3 阶段交付。"
        />
      )
    case 'auth-complete':
      return (
        <PublicPlaceholder
          title="第三方登录补全"
          description="关联身份与剩余账户字段将在第 3 阶段交付。"
        />
      )
    case 'not-found':
      return <NotFoundPage />
    default: {
      const _exhaustive: never = route
      return _exhaustive
    }
  }
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <RouterProvider>
            <AppRoutes />
          </RouterProvider>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
