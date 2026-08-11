import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipPopup, TooltipTrigger } from '@/components/ui/tooltip'
import { useTheme } from '@/lib/theme.tsx'

export function ThemeToggle() {
  const { resolved, setMode } = useTheme()
  const isDark = resolved === 'dark'

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="切换深色主题"
            aria-pressed={isDark}
            onClick={() => setMode(isDark ? 'light' : 'dark')}
          />
        }
      >
        {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </TooltipTrigger>
      <TooltipPopup side="bottom">切换深色主题</TooltipPopup>
    </Tooltip>
  )
}
