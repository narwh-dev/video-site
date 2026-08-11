import { Button } from '@/components/ui/button'
import { Link } from '@/lib/router/react.tsx'
import { DEFAULT_CATALOG_QUERY } from '@/lib/router/routes.ts'

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-16 text-foreground">
      <div className="flex max-w-md flex-col items-center text-center">
        <p className="font-mono text-sm tracking-widest text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">信号丢失</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          您尝试访问的坐标不在星图记录中。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            render={<Link to={{ name: 'home' }} />}
            variant="default"
          >
            返回首页
          </Button>
          <Button
            render={
              <Link to={{ name: 'catalog', query: DEFAULT_CATALOG_QUERY }} />
            }
            variant="outline"
          >
            浏览剧集目录
          </Button>
        </div>
      </div>
    </div>
  )
}
