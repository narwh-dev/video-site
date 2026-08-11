import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import type React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "@/components/ui/cva"

export const toggleVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border font-medium text-sm text-foreground outline-none transition-colors duration-[120ms] hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-pressed:bg-accent data-pressed:text-accent-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 min-w-10 px-3",
        sm: "h-8 min-w-8 rounded-md px-2 text-[13px]",
        lg: "h-11 min-w-11 px-4",
      },
      variant: {
        default: "border-transparent",
        outline:
          "border-border bg-transparent hover:bg-accent data-pressed:bg-accent",
      },
    },
  },
)

export function Toggle({
  className,
  variant,
  size,
  ...props
}: TogglePrimitive.Props &
  VariantProps<typeof toggleVariants>): React.ReactElement {
  return (
    <TogglePrimitive
      className={(state) =>
        cn(
          toggleVariants({ size, variant }),
          typeof className === "function" ? className(state) : className,
        )
      }
      data-slot="toggle"
      {...props}
    />
  )
}

export { TogglePrimitive }
