import { ChevronUp } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import {
  Menu,
  MenuCheckboxItem,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from '@/components/ui/menu'
import { Tooltip, TooltipPopup, TooltipTrigger } from '@/components/ui/tooltip'
import { MEMBER } from '@/data/index.ts'
import { useAuth } from '@/lib/auth.tsx'
import { useNavigate } from '@/lib/router/react.tsx'
import { useTheme } from '@/lib/theme.tsx'
import { cn } from '@/lib/utils'

function AccountMenuItems() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { resolved, setMode } = useTheme()
  const isDark = resolved === 'dark'

  return (
    <MenuPopup align="start" side="top" sideOffset={6} className="min-w-48">
      <MenuItem
        onClick={() => {
          navigate({ name: 'settings', section: 'profile' })
        }}
      >
        设置
      </MenuItem>
      <MenuItem
        onClick={() => {
          navigate({ name: 'admin', section: 'dashboard' })
        }}
      >
        管理控制台
      </MenuItem>
      <MenuSeparator />
      <MenuCheckboxItem
        checked={isDark}
        closeOnClick={false}
        onCheckedChange={(checked) => {
          setMode(checked ? 'dark' : 'light')
        }}
      >
        深色主题
      </MenuCheckboxItem>
      <MenuSeparator />
      <MenuItem
        onClick={() => {
          signOut()
          navigate({ name: 'landing' })
        }}
      >
        退出登录
      </MenuItem>
    </MenuPopup>
  )
}

function MemberAvatar({ className }: { className?: string }) {
  const initials = MEMBER.name.slice(0, 1)
  return (
    <Avatar className={cn('size-8', className)}>
      <AvatarImage src={MEMBER.avatar} alt="" />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}

export function AccountMenuFull() {
  return (
    <Menu>
      <MenuTrigger
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'h-11 w-full justify-start gap-2 rounded-[10px] px-2',
        )}
      >
        <MemberAvatar />
        <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-foreground">
          {MEMBER.name}
        </span>
        <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
      </MenuTrigger>
      <AccountMenuItems />
    </Menu>
  )
}

export function AccountMenuIcon() {
  return (
    <Tooltip>
      <Menu>
        <TooltipTrigger
          delay={200}
          render={
            <MenuTrigger
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'size-10 rounded-[10px]',
              )}
              aria-label="账户"
            />
          }
        >
          <MemberAvatar className="size-7" />
        </TooltipTrigger>
        <AccountMenuItems />
      </Menu>
      <TooltipPopup side="right">账户</TooltipPopup>
    </Tooltip>
  )
}
